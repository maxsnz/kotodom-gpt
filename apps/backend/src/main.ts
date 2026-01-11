import { NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import fastifyCookie from "@fastify/cookie";
import fastifyStatic from "@fastify/static";
import { resolve } from "path";
import { existsSync, readFileSync } from "fs";
import { AppModule } from "./app.module";
import { PgBossClient } from "./infra/jobs/pgBoss";
import { env } from "./config/env";
import { registerWorkers } from "./infra/jobs/pgBoss/registerWorkers";
import {
  createProcessBotUpdate,
  createProcessMessageTrigger,
} from "./workers/incoming-message.worker";
import { BotRepository } from "./domain/bots/BotRepository";
import { ChatRepository } from "./domain/chats/ChatRepository";
import { MessageRepository } from "./domain/chats/MessageRepository";
import { MessageProcessingRepository } from "./domain/message-processing/MessageProcessingRepository";
import { OpenAIClient } from "./infra/openai/openaiClient";
import {
  TelegramClient,
  DefaultTelegramClientFactory,
} from "./infra/telegram/telegramClient";
import { EffectRunner } from "./infra/effects/EffectRunner";
import { WorkerRegistrationService } from "./infra/jobs/pgBoss/WorkerRegistrationService";
import {
  LOGGER_FACTORY,
  LoggerFactory,
  NestLoggerService,
} from "./infra/logger";
import { AuthService } from "./modules/auth/auth.service";
import { createSessionHook } from "./modules/auth/session.hook";
import {
  SESSION_STORE,
  isRedisSessionStore,
  SessionStore,
} from "./modules/auth/session";
import { RedisSessionStore } from "./modules/auth/session/redis-session-store";

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    { bufferLogs: true }
  );

  // Register Fastify cookie plugin with signing secret
  await app.register(fastifyCookie, {
    secret: env.COOKIE_SECRET,
  });

  const loggerFactory = app.get<LoggerFactory>(LOGGER_FACTORY);
  const nestLogger = app.get(NestLoggerService);
  app.useLogger(nestLogger);
  // app.flushLogs();
  const bootstrapLogger = loggerFactory("Bootstrap");

  // Register static file serving for admin panel
  // Serve static assets from dist-admin-web for /cp/* routes
  const fastifyInstance = app.getHttpAdapter().getInstance();
  // __dirname in compiled JS will be dist-backend/apps/backend/src, so we go up to dist-admin-web
  const adminWebPath = resolve(__dirname, "../../../../dist-admin-web");

  const indexHtmlPath = resolve(adminWebPath, "index.html");
  if (!existsSync(indexHtmlPath)) {
    bootstrapLogger.error(`index.html does not exist at: ${indexHtmlPath}`);
    throw new Error(`index.html does not exist at: ${indexHtmlPath}`);
  }

  const indexHtmlContent = readFileSync(indexHtmlPath, "utf-8");

  await fastifyInstance.register(fastifyStatic, {
    root: adminWebPath,
    prefix: "/",
    // decorateReply: false,
  });

  fastifyInstance.addHook("onRequest", async (request, reply) => {
    const url = request.url.split("?")[0];

    if (url.startsWith("/cp")) {
      reply.type("text/html");
      return reply.send(indexHtmlContent);
    }
  });

  // Register session loading hook
  const authService = app.get(AuthService);
  fastifyInstance.addHook("preHandler", createSessionHook(authService));

  // Connect to Redis if using RedisSessionStore
  const sessionStore = app.get<SessionStore>(SESSION_STORE);
  if (isRedisSessionStore(sessionStore)) {
    try {
      await sessionStore.connect();
      bootstrapLogger.info("Redis session store connected");
    } catch (error) {
      bootstrapLogger.error("Failed to connect to Redis session store", {
        error,
      });
      process.exit(1);
    }
  }

  // Get PgBossClient instance from DI container
  const pgBossClient = app.get(PgBossClient);
  const botRepository = app.get(BotRepository);
  const chatRepository = app.get(ChatRepository);
  const messageRepository = app.get(MessageRepository);
  const messageProcessingRepository = app.get(MessageProcessingRepository);
  const openAIClient = app.get(OpenAIClient);
  const telegramClientFactoryInstance = app.get("TelegramClientFactory");
  const effectRunner = app.get(EffectRunner);

  // Start PgBoss
  try {
    await pgBossClient.start();
    bootstrapLogger.info("PgBoss started successfully");
  } catch (error) {
    bootstrapLogger.error("Failed to start PgBoss", {
      error,
    });
    process.exit(1);
  }

  // Register workers after PgBoss is ready
  const processBotLogger = loggerFactory("ProcessBotUpdate");
  const sharedDeps = {
    botRepository,
    chatRepository,
    messageRepository,
    messageProcessingRepository,
    openAIClient,
    telegramClientFactory: (token: string) =>
      telegramClientFactoryInstance.createClient(token),
    log: {
      info: (msg: string, meta?: Record<string, unknown>) =>
        processBotLogger.info(msg, meta),
      error: (msg: string, meta?: Record<string, unknown>) =>
        processBotLogger.error(msg, meta),
      warn: (msg: string, meta?: Record<string, unknown>) =>
        processBotLogger.warn(msg, meta),
      debug: (msg: string, meta?: Record<string, unknown>) =>
        processBotLogger.debug(msg, meta),
    },
  };

  // Get WorkerRegistrationService from DI container
  const workerRegistrationService = app.get(WorkerRegistrationService);

  const processBotUpdate = createProcessBotUpdate(sharedDeps);
  const processMessageTrigger = createProcessMessageTrigger(sharedDeps);

  const workerLogger = loggerFactory("PgBossWorker");
  await workerRegistrationService.registerWorkers({
    boss: pgBossClient,
    processBotUpdate,
    processMessageTrigger,
    log: {
      info: (msg, meta) => workerLogger.info(msg, meta),
      error: (msg, meta) => workerLogger.error(msg, meta),
    },
    onJobFailed: async (message, dedupeKey) => {
      await effectRunner.run({
        type: "notification.adminAlert",
        message,
        dedupeKey,
      });
    },
  });

  // Get port from environment or use default
  const port = parseInt(env.BACKEND_PORT, 10);
  const host = "0.0.0.0"; // Listen on all interfaces

  // Start HTTP server with Fastify
  // Note: TelegramWebhookRegistrationService will automatically register webhooks
  // via OnModuleInit hook when the module is initialized
  await app.listen(port, host);
  bootstrapLogger.info(`Application is running on: http://localhost:${port}`);

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    bootstrapLogger.info(`Received ${signal}, shutting down gracefully...`);
    try {
      await pgBossClient.stop();
      bootstrapLogger.info("PgBoss stopped");

      // Disconnect Redis if using RedisSessionStore
      if (isRedisSessionStore(sessionStore)) {
        await sessionStore.disconnect();
        bootstrapLogger.info("Redis session store disconnected");
      }

      await app.close();
      bootstrapLogger.info("Application closed");
      process.exit(0);
    } catch (error) {
      bootstrapLogger.error("Error during shutdown", {
        error,
      });
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
