import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
 
  datasource: {
    url: process.env.DIRECT_URL, // Removed the TypeScript index signature syntax
  },
});

