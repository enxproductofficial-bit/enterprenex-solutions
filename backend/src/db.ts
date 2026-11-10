import { PrismaClient } from '@prisma/client';

if (!process.env.DATABASE_URL || process.env.DATABASE_URL.startsWith('file:')) {
  process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_QhISxl3XZ1Go@ep-gentle-salad-bdn7t3j3-pooler.c-8.us-east-2.aws.neon.tech/neondb?sslmode=require&connect_timeout=30';
}

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
