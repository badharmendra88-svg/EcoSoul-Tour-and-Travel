import "dotenv/config";
import { defineConfig } from "prisma/config";

// Prisma CLI configuration (migrate, generate, seed, studio). Prisma 7 no longer
// reads .env by itself, hence dotenv. Migrations use the direct (not pooled) Neon
// connection: DIRECT_URL, or DATABASE_URL_UNPOOLED that the Vercel–Neon integration
// adds. The app always uses DATABASE_URL. `npm run build` applies pending migrations.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.mjs",
  },
  datasource: {
    // `prisma generate` (postinstall) needs no database, so a missing URL is not an error here
    url: process.env.DIRECT_URL || process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL || "",
  },
});
