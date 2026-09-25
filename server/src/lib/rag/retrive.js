import { RAG_MIN_SCORE, RAG_TOP_K } from "../ai-config.js";
import { embedTexts } from "../openAi.js";
import { queryWorkspaceVectors } from "../pinecone.js";


export async function retrieveWorkspaceContext(
    workspaceId,
    query
) {
    // Convert user's question into an embedding
    const [embedding] = await embedTexts([query]);

    // Search similar vectors in this workspace
    const matches = await queryWorkspaceVectors(
        workspaceId,
        embedding,
        RAG_TOP_K
    );

    const chunks = [];

    for (const match of matches) {
        const score = match.score ?? 0;

        // Ignore results that are not similar enough
        if (score < RAG_MIN_SCORE) {
            continue;
        }

        const metadata = match.metadata;

        // Ignore invalid metadata
        if (
            !metadata ||
            typeof metadata.sourceId !== "string" ||
            typeof metadata.sourceTitle !== "string" ||
            typeof metadata.sourceType !== "string" ||
            typeof metadata.chunkId !== "string" ||
            typeof metadata.text !== "string"
        ) {
            continue;
        }

        chunks.push({
            sourceId: metadata.sourceId,
            sourceTitle: metadata.sourceTitle,
            sourceType: metadata.sourceType,
            chunkId: metadata.chunkId,
            chunkIndex: Number(
                metadata.chunkIndex ?? 0
            ),

            ...(typeof metadata.page === "number"
                ? {
                      page: metadata.page,
                  }
                : {}),

            text: metadata.text,
            score,
        });
    }

    return chunks;
}


export function buildChatSystemPrompt(input) {
    const sections = [
        "You are Chaibook, an assistant that helps users learn from their workspace sources.",
    ];

    // Add web-search instructions
    if (input.webSearchEnabled) {
        sections.push(
            "You have access to a web_search tool for up-to-date information outside the workspace.",
            "Use it when the user asks about recent events or topics not covered by their sources.",
            "Cite web results inline using [W1], [W2], etc. matching the web result blocks."
        );
    }

    // Add user memories
    if (input.userMemories?.length) {
        const memoryBlock = input.userMemories
            .map((memory) => `- ${memory}`)
            .join("\n");

        sections.push(
            "Known facts about this user (use when relevant):",
            memoryBlock
        );
    }

    // Add previous conversation summary
    const summary =
        input.conversationSummary?.trim();

    if (summary) {
        sections.push(
            "Earlier conversation summary:",
            summary
        );
    }

    // No relevant chunks found
    if (input.chunks.length === 0) {
        sections.push(
            "This workspace has no indexed source content yet, or nothing relevant was retrieved.",

            input.webSearchEnabled
                ? "Use web search when needed, or answer from general knowledge."
                : "Answer helpfully from general knowledge and suggest adding or processing sources when appropriate.",

            "Do not invent citations."
        );

        return sections.join("\n");
    }

    // Convert retrieved chunks into context for the AI
    const context = input.chunks
        .map((chunk, index) => {
            const label =
                `[${index + 1}] ${chunk.sourceTitle} (${chunk.sourceType})` +
                (
                    chunk.page
                        ? `, page ${chunk.page}`
                        : ""
                );

            return `${label}\n${chunk.text}`;
        })
        .join("\n\n");

    sections.push(
        "Use ONLY the retrieved context below when making factual claims about their materials.",
        "If the context is insufficient, say so clearly.",
        "Cite sources inline using, [2], etc. matching the numbered context blocks.",
        "Keep answers concise, accurate, and educational.",
        "",
        "Retrieved context:",
        context
    );

    return sections.join("\n");
}