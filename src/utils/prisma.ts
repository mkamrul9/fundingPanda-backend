import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;

// Initialize pg Pool
const pool = new Pool({ connectionString });

// Initialize the Prisma Adapter 
const adapter = new PrismaPg(pool as unknown as any);

// Pass the adapter to Prisma Client
const prisma = new PrismaClient({ adapter });

export default prisma;