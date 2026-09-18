
import { Pinecone } from "@pinecone-database/pinecone";
import { EMBEDDING_DIMENSIONS } from "./ai-config.js";


// ------------------------------------
// Configuration
// ------------------------------------

const indexName =
    process.env.PINECONE_INDEX ?? "chaibook";

let pineconeClient = null;
let indexReady = false;


// ------------------------------------
// Get Pinecone client
// ------------------------------------

function getPineconeClient() {

    if (!process.env.PINECONE_API_KEY) {
        throw new Error(
            "PINECONE_API_KEY is not configured"
        );
    }

    // Create client only once
    if (!pineconeClient) {

        pineconeClient = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY
        });

    }

    return pineconeClient;
}


// ------------------------------------
// Wait until Pinecone index is ready
// ------------------------------------

async function waitForIndexReady(name) {

    const client = getPineconeClient();

    for (let attempt = 0; attempt < 30; attempt++) {

        const description =
            await client.describeIndex(name);

        if (description.status?.ready) {
            return;
        }

        // Wait 2 seconds
        await new Promise(resolve =>
            setTimeout(resolve, 2000)
        );
    }

    throw new Error(
        `Pinecone index "${name}" did not become ready in time`
    );
}


// ------------------------------------
// Make sure index exists
// ------------------------------------

export async function ensurePineconeIndex() {

    // Already checked
    if (indexReady) {
        return;
    }

    const client = getPineconeClient();

    const indexes =
        await client.listIndexes();

    const exists =
        indexes.indexes?.some(
            index => index.name === indexName
        );


    // Create index if it doesn't exist
    if (!exists) {

        await client.createIndex({

            name: indexName,

            dimension: EMBEDDING_DIMENSIONS,

            metric: "cosine",

            spec: {
                serverless: {
                    cloud: "aws",
                    region: "us-east-1"
                }
            }

        });

        // Wait until Pinecone finishes creating it
        await waitForIndexReady(indexName);
    }


    indexReady = true;
}


// ------------------------------------
// Get Pinecone index
// ------------------------------------

export async function getPineconeIndex() {

    await ensurePineconeIndex();

    const client = getPineconeClient();

    return client.index({
        name: indexName
    });
}


// ------------------------------------
// Store vectors
// ------------------------------------

export async function upsertSourceVectors(
    workspaceId,
    records
) {

    // Nothing to store
    if (records.length === 0) {
        return;
    }

    const index =
        await getPineconeIndex();

    // Each workspace gets its own namespace
    const namespace =
        index.namespace(workspaceId);


    const batchSize = 100;


    // Upload 100 vectors at a time
    for (
        let i = 0;
        i < records.length;
        i += batchSize
    ) {

        const batch =
            records.slice(i, i + batchSize);

        await namespace.upsert({
            records: batch
        });
    }
}


// ------------------------------------
// Delete vectors of one source
// ------------------------------------

export async function deleteSourceVectors(
    workspaceId,
    sourceId
) {

    const index =
        await getPineconeIndex();

    await index
        .namespace(workspaceId)
        .deleteMany({

            filter: {
                sourceId: {
                    $eq: sourceId
                }
            }

        });
}


// ------------------------------------
// Delete complete workspace
// ------------------------------------

export async function deleteWorkspaceVectors(
    workspaceId
) {

    const index =
        await getPineconeIndex();

    await index
        .namespace(workspaceId)
        .deleteAll();
}


// ------------------------------------
// Search vectors
// ------------------------------------

export async function queryWorkspaceVectors(
    workspaceId,
    vector,
    topK
) {

    const index =
        await getPineconeIndex();

    const result =
        await index
            .namespace(workspaceId)
            .query({

                vector,

                topK,

                includeMetadata: true

            });


    return result.matches ?? [];
}


// Export index name
export {
    indexName as PINECONE_INDEX_NAME
};
