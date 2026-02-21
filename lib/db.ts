import { PrismaClient } from "@prisma/client";

// Validate required env on startup (fail fast before handling requests)
import "@/lib/env";

declare global {
    var prisma: PrismaClient | undefined;
};

export const db = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalThis.prisma = db;
 
// app/actions.ts
