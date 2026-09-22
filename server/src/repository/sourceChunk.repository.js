
import prisma from "../lib/db.js";


// Fields we want to get from the database
export const sourceChunkSelect = {
    id: true,
    sourceId: true,
    index: true,
    content: true,
    tokenCount: true,
    metadata: true,
    createdAt: true,
};


// ------------------------------------
// Delete all chunks of a source
// ------------------------------------

export function deleteChunksBySourceId(sourceId) {

    return prisma.sourceChunk.deleteMany({
        where: {
            sourceId
        }
    });
}


// ------------------------------------
// Create multiple chunks
// ------------------------------------

export function createSourceChunks(chunks) {

    // Nothing to create
    if (chunks.length === 0) {
        return Promise.resolve([]);
    }


    // Create all chunks in one transaction
    return prisma.$transaction(

        chunks.map((chunk) => {

            return prisma.sourceChunk.create({

                data: {
                    sourceId: chunk.sourceId,
                    index: chunk.index,
                    content: chunk.content,
                    tokenCount: chunk.tokenCount ?? null,
                    metadata: chunk.metadata,
                },

                select: sourceChunkSelect,

            });

        })

    );
}


// ------------------------------------
// Find all chunks of a source
// ------------------------------------

export function findChunksBySourceId(sourceId) {

    return prisma.sourceChunk.findMany({

        where: {
            sourceId
        },

        select: sourceChunkSelect,

        orderBy: {
            index: "asc"
        },

    });
}
