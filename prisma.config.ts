import { defineConfig, env } from "prisma/config";
import "dotenv/config";

export default defineConfig({
  datasource: {
    url: env("DATABASE_URL"),
  },

  migrations: {
    seed: "tsx apps/backend/src/infra/db/prisma/seed.ts",
  },

  schema: "./apps/backend/src/infra/db/prisma/schema.prisma",
});
