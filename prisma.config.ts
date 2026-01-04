import { defineConfig, env } from "prisma/config";
import "dotenv/config";

export default defineConfig({
  datasource: {
    url: env("DATABASE_URL"),
  },

  schema: "./apps/backend/src/infra/db/prisma/schema.prisma",
});
