import { PrismaClient } from "../../apps/backend/src/infra/db/prisma/generated/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "../../apps/backend/src/config/env";

export class DatabaseService {
  private prisma: PrismaClient;
  private isConnected: boolean = false;

  constructor() {
    const dbUrl = env.DATABASE_URL;

    if (!dbUrl) {
      throw new Error("DATABASE_URL is required");
    }

    const adapter = new PrismaPg({
      connectionString: dbUrl,
    });

    this.prisma = new PrismaClient({ adapter });
  }

  async connect(): Promise<void> {
    if (this.isConnected) {
      return;
    }

    await this.prisma.$connect();
    this.isConnected = true;
  }

  async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    await this.prisma.$disconnect();
    this.isConnected = false;
  }

  getClient(): PrismaClient {
    if (!this.isConnected) {
      throw new Error("Database is not connected. Call connect() first.");
    }
    return this.prisma;
  }

  isDatabaseConnected(): boolean {
    return this.isConnected;
  }
}
