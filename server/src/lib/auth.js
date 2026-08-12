import { betterAuth } from "better-auth";
import prisma from "./db.js";
import { prismaAdapter } from "better-auth/adapters/prisma";
import "dotenv/config"

const clientUrl = process.env.BETTER_AUTH_URL || `https://localhost:3000`

// Use an explicit named export
export const auth = betterAuth({
    baseURL :process.env.BETTER_AUTH_URL,
    secret : process.env.BETTER_AUTH_SECRET,
    trustedOrigins : [clientUrl],
    database: prismaAdapter(prisma, {
        provider: "postgresql", 
    }),
    socialProviders:{
        google:{
                clientId: process.env.GOOGLE_CLENT_ID,
                clientSecret: process.env.GOOGLE_CLENT_SECRET
        },
    }
});
