import { Controller, Get } from "@nestjs/common";
import { SkipThrottle } from "@nestjs/throttler";

import { prisma } from "../../infra/db/prisma/client";
import { PgBossClient } from "../../infra/jobs/pgBoss";

type HealthResponse = {
  status: "ok" | "error";
  error?: string;
};

type DbHealthResponse = HealthResponse & {
  responseTimeMs?: number;
};

type PgBossHealthResponse = HealthResponse & {
  isReady?: boolean;
};

@Controller("api/health")
@SkipThrottle()
export class HealthController {
  constructor(private readonly pgBossClient: PgBossClient) {}

  /**
   * GET /api/health - Simple health check
   */
  @Get()
  async check(): Promise<HealthResponse> {
    return { status: "ok" };
  }

  /**
   * GET /api/health/db - Check database connection
   */
  @Get("db")
  async checkDb(): Promise<DbHealthResponse> {
    const startTime = Date.now();

    try {
      await prisma.$queryRaw`SELECT 1`;
      const responseTimeMs = Date.now() - startTime;

      return {
        status: "ok",
        responseTimeMs,
      };
    } catch (error) {
      return {
        status: "error",
        error:
          error instanceof Error ? error.message : "Database connection failed",
      };
    }
  }

  /**
   * GET /api/health/pgboss - Check PgBoss status
   */
  @Get("pgboss")
  async checkPgBoss(): Promise<PgBossHealthResponse> {
    try {
      const isReady = this.pgBossClient.isReady();

      return {
        status: isReady ? "ok" : "error",
        isReady,
      };
    } catch (error) {
      return {
        status: "error",
        error: error instanceof Error ? error.message : "PgBoss check failed",
      };
    }
  }
}
