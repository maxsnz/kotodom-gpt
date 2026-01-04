import { NestFactory } from "@nestjs/core";
import { Logger } from "@nestjs/common";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";

import { AppModule } from "./app.module";
import { PgBossClient } from "./infra/jobs/pgBoss";
import { env } from "./config/env";

async function bootstrap() {
  const logger = new Logger("Bootstrap");

  // Create NestJS application with Fastify adapter
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  );

  // Get PgBossClient instance from DI container
  const pgBossClient = app.get(PgBossClient);

  // Start PgBoss
  try {
    await pgBossClient.start();
    logger.log("PgBoss started successfully");
  } catch (error) {
    logger.error("Failed to start PgBoss", error);
    process.exit(1);
  }

  // Get port from environment or use default
  const port = env.SERVER_PORT ? parseInt(env.SERVER_PORT, 10) : 3000;
  const host = "0.0.0.0"; // Listen on all interfaces

  // Start HTTP server with Fastify
  await app.listen(port, host);
  logger.log(`Application is running on: http://localhost:${port}`);

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.log(`Received ${signal}, shutting down gracefully...`);
    try {
      await pgBossClient.stop();
      logger.log("PgBoss stopped");
      await app.close();
      logger.log("Application closed");
      process.exit(0);
    } catch (error) {
      logger.error("Error during shutdown", error);
      process.exit(1);
    }
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

bootstrap().catch((error) => {
  console.error("Failed to start application", error);
  process.exit(1);
});

