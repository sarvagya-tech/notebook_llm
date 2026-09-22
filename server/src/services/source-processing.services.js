
import { chunkPages, chunkText } from "../lib/chunking.js";
import { embedTexts } from "../lib/openAi.js";
import { extractPdfFromCloudinary } from "../lib/pdf.js";

import {
    deleteSourceVectors,
    upsertSourceVectors,
} from "../lib/pinecone.js";

import {
    createSourceChunks,
    deleteChunksBySourceId,
    findChunksBySourceId,
} from "../repository/source-chunk.repository.js";

import {
    findSourceById,
    updateSourceRecord,
} from "../repository/source.repository.js";


async function extractSourceText(source) {
    const text = source.content?.trim();

    // If content already exists, use it.
    if (text) {
        return {
            text,
            pageCount: undefined,
            pages: undefined,
        };
    }

    // If the source is a PDF, extract its text.
    if (source.type === "PDF") {
        const metadata =
            source.metadata &&
            typeof source.metadata === "object" &&
            !Array.isArray(source.metadata)
                ? source.metadata
                : {};

        if (!metadata.fileUrl) {
            throw new Error("PDF source is missing fileUrl metadata");
        }

        const extracted = await extractPdfFromCloudinary({
            fileUrl: metadata.fileUrl,
            publicId: metadata.publicId,
            resourceType: metadata.resourceType ?? "image",
        });

        return {
            text: extracted.text,
            pageCount: extracted.pageCount,
            pages: extracted.pages,
        };
    }

    throw new Error(
        `Source ${source.id} has no extractable content`
    );
}


export function markSourceProcessing(sourceId) {
    return updateSourceRecord(sourceId, {
        status: "PROCESSING",
    });
}


export async function markSourceFailed(
    sourceId,
    error,
    existingMetadata
) {
    const message =
        error instanceof Error
            ? error.message
            : "Source processing failed";

    const metadata =
        existingMetadata &&
        typeof existingMetadata === "object" &&
        !Array.isArray(existingMetadata)
            ? existingMetadata
            : {};

    return updateSourceRecord(sourceId, {
        status: "FAILED",

        metadata: {
            ...metadata,
            processingError: message,
        },
    });
}


export async function extractSourceContent(sourceId) {
    const source = await findSourceById(sourceId);

    if (!source) {
        throw new Error("Source not found");
    }

    const extracted = await extractSourceText(source);

    const metadata =
        source.metadata &&
        typeof source.metadata === "object" &&
        !Array.isArray(source.metadata)
            ? source.metadata
            : {};

    await updateSourceRecord(sourceId, {
        content: extracted.text,

        metadata: {
            ...metadata,
            pageCount:
                extracted.pageCount ?? metadata.pageCount,
        },
    });

    return {
        sourceId,
        workspaceId: source.workspaceId,
        text: extracted.text,
        pages: extracted.pages,
        source,
    };
}


export async function chunkSourceContent(
    sourceId,
    text,
    pages
) {
    // Remove old chunks first.
    await deleteChunksBySourceId(sourceId);

    // If pages exist, chunk by pages.
    // Otherwise, chunk the complete text.
    const chunks = pages?.length
        ? chunkPages(pages)
        : chunkText(text);

    if (chunks.length === 0) {
        throw new Error(
            "No chunks were generated from source content"
        );
    }

    return createSourceChunks(
        chunks.map((chunk) => ({
            sourceId,
            index: chunk.index,
            content: chunk.content,

            // Rough token estimation.
            tokenCount: Math.ceil(
                chunk.content.length / 4
            ),

            metadata: chunk.metadata,
        }))
    );
}


export async function removeSourceFromIndex(
    workspaceId,
    sourceId
) {
    await deleteSourceVectors(
        workspaceId,
        sourceId
    );

    await deleteChunksBySourceId(sourceId);
}


/**
 * Returns all chunks for a source
 * along with their total count.
 */
export async function listChunksForSource(sourceId) {
    const chunks =
        await findChunksBySourceId(sourceId);

    return {
        chunks,
        count: chunks.length,
    };
}


/**
 * Step 3:
 * Generate embeddings for chunks
 * and store them in Pinecone.
 */
export async function embedAndIndexSource(
    source,
    chunks
) {
    const batchSize = 50;

    const records = [];

    // Process chunks in batches of 50.
    for (
        let i = 0;
        i < chunks.length;
        i += batchSize
    ) {
        const batch = chunks.slice(
            i,
            i + batchSize
        );

        // Get text from each chunk.
        const texts = batch.map(
            (chunk) => chunk.content
        );

        // Generate embeddings.
        const embeddings =
            await embedTexts(texts);

        // Create Pinecone records.
        for (
            let j = 0;
            j < batch.length;
            j += 1
        ) {
            const chunk = batch[j];
            const embedding = embeddings[j];

            const chunkMetadata =
                chunk.metadata &&
                typeof chunk.metadata === "object" &&
                !Array.isArray(chunk.metadata)
                    ? chunk.metadata
                    : {};

            records.push({
                id: chunk.id,

                // Vector/embedding
                values: embedding,

                // Information stored with the vector
                metadata: {
                    workspaceId: source.workspaceId,
                    sourceId: source.id,
                    chunkId: chunk.id,
                    chunkIndex: chunk.index,
                    sourceTitle: source.title,
                    sourceType: source.type,

                    // Limit metadata text size.
                    text: chunk.content.slice(
                        0,
                        35000
                    ),

                    // Add page only if available.
                    ...(typeof chunkMetadata.page === "number"
                        ? {
                              page: chunkMetadata.page,
                          }
                        : {}),
                },
            });
        }
    }

    // Store all vectors in Pinecone.
    await upsertSourceVectors(
        source.workspaceId,
        records
    );

    const metadata =
        source.metadata &&
        typeof source.metadata === "object" &&
        !Array.isArray(source.metadata)
            ? source.metadata
            : {};

    // Processing is complete.
    return updateSourceRecord(source.id, {
        status: "READY",

        metadata: {
            ...metadata,

            chunkCount: chunks.length,

            indexedAt:
                new Date().toISOString(),

            processingError: undefined,
        },
    });
}

