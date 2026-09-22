
import OpenAI from "openai";

import {
    EMBEDDING_DIMENSIONS,
    EMBEDDING_MODEL,
} from "./ai-config.js";


// OpenAI client
let client = null;


// Generate embeddings for multiple texts
export async function embedTexts(texts) {

    // If there is nothing to embed
    if (texts.length === 0) {
        return [];
    }


    // Check API key
    if (!process.env.OPENAI_API_KEY) {
        throw new Error(
            "OPENAI_API_KEY is not configured"
        );
    }


    // Create OpenAI client only once
    if (!client) {
        client = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
    }


    // Send texts to OpenAI
    const response =
        await client.embeddings.create({

            model: EMBEDDING_MODEL,

            input: texts,

            dimensions: EMBEDDING_DIMENSIONS

        });


    // Return only the embeddings
    return response.data
        .sort((a, b) => a.index - b.index)
        .map(item => item.embedding);
}
