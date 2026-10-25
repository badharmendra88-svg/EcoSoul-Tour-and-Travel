import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// Prisma CLI configuration (migrate, generate, seed, studio). Prisma 7 no longer
// reads .env by itself, hence dotenv. DATABASE_URL is relative to the project
// root, e.g. file:./prisma/dev.db — the app resolves it the same way (src/lib/db.ts).
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.mjs",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
