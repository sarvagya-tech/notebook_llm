import { findChunksBySourceId } from "../repository/sourceChunk.repository.js";
import { findSourceById } from "../repository/source.repository.js";

// import { processArtifactById } from "../services/artifact.services.js";
import { summarizeConversationById } from "../services/conversation-memory.services.js";

import {
    chunkSourceContent,
    embedAndIndexSource,
    extractSourceContent,
    markSourceFailed,
    markSourceProcessing,
} from "../services/source-processing.services.js";

import { inngest } from "./client.js";


export const processSource = inngest.createFunction(
    {
        id: "process-source",
        retries: 3,
        triggers: [
            {
                event: "source/created",
            },
        ],
    },

    async ({ event, step }) => {
        const { sourceId } = event.data;

        // Step 1: Mark source as PROCESSING
        await step.run(
            "mark-processing",
            () => markSourceProcessing(sourceId)
        );

        try {
            // Step 2: Extract content
            const extracted = await step.run(
                "extract-content",
                () => extractSourceContent(sourceId)
            );

            // Step 3: Create chunks
            await step.run(
                "chunk-content",
                () =>
                    chunkSourceContent(
                        sourceId,
                        extracted.text,
                        extracted.pages
                    )
            );

            // Step 4: Generate embeddings and store in Pinecone
            const result = await step.run(
                "embed-and-index",
                async () => {
                    const source =
                        await findSourceById(sourceId);

                    if (!source) {
                        throw new Error(
                            "Source not found"
                        );
                    }

                    const chunks =
                        await findChunksBySourceId(
                            sourceId
                        );

                    await embedAndIndexSource(
                        source,
                        chunks
                    );

                    return {
                        chunkCount: chunks.length,
                    };
                }
            );

            return {
                sourceId,
                status: "READY",
                ...result,
            };

        } catch (error) {

            // If anything fails, mark source as FAILED
            await step.run(
                "mark-failed",
                async () => {
                    const source =
                        await findSourceById(sourceId);

                    if (source) {
                        await markSourceFailed(
                            sourceId,
                            error,
                            source.metadata
                        );
                    }
                }
            );

            // Let Inngest know that the function failed
            throw error;
        }
    }
);


export const generateArtifact = inngest.createFunction(
    {
        id: "generate-artifact",
        retries: 2,
        triggers: [
            {
                event: "artifact/generate",
            },
        ],
    },

    async ({ event, step }) => {
        const { artifactId } = event.data;

        await step.run(
            "generate",
            () => processArtifactById(artifactId)
        );

        return {
            artifactId,
            status: "READY",
        };
    }
);


export const summarizeConversation =
    inngest.createFunction(
        {
            id: "summarize-conversation",
            retries: 2,
            triggers: [
                {
                    event: "conversation/summarize",
                },
            ],
        },

        async ({ event, step }) => {
            const {
                conversationId,
                userId,
            } = event.data;

            await step.run(
                "summarize",
                () =>
                    summarizeConversationById(
                        conversationId,
                        userId
                    )
            );

            return {
                conversationId,
                status: "SUMMARIZED",
            };
        }
    );


export const functions = [
    processSource,
    generateArtifact,
    summarizeConversation,
];