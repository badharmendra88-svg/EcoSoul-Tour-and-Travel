import "server-only";
import path from "node:path";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/generated/prisma/client";

// Prisma 7 talks to SQLite through the better-sqlite3 driver adapter.
// A relative DATABASE_URL (file:./prisma/dev.db) is resolved from the project
// root, the same way the Prisma CLI resolves it via prisma.config.ts.
function sqliteUrl() {
  const url = process.env.DATABASE_URL || "file:./prisma/dev.db";
  const file = url.replace(/^file:/, "");
  return path.isAbsolute(file) ? `file:${file}` : `file:${path.resolve(/*turbopackIgnore: true*/ process.cwd(), file)}`;
}

// Reuse one client across hot reloads in development.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: sqliteUrl() }) });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
