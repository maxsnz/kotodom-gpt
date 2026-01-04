import { PrismaClient } from "./generated/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "../../../config/env";

const dbUrl = env.DATABASE_URL;

if (!dbUrl) {
  throw new Error("DATABASE_URL is required");
}

const adapter = new PrismaPg({
  connectionString: dbUrl,
});

export const prisma = new PrismaClient({ adapter });
