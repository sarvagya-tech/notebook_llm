import 'dotenv/config';
import { PrismaNeon } from '@prisma/adapter-neon';
import pkg from '@prisma/client'; // Import the default CommonJS package

const { PrismaClient } = pkg; // Extract PrismaClient safely

const connectionString = process.env.DATABASE_URL;

const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

export default prisma;
