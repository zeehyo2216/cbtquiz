import { PrismaClient } from "@prisma/client";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";

// Set WebSocket constructor for Node.js environments
if (typeof WebSocket === "undefined") {
  neonConfig.webSocketConstructor = ws;
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

const initPrisma = () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set in environment variables");
  }
  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({ adapter });
};

export const db = globalForPrisma.prisma ?? initPrisma();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
