import { Module } from "@nestjs/common";

import { BotsService } from "./bots.service";
import { BotsAdminController } from "./bots-admin.controller";
import { BotsWebhookController } from "./bots-webhook.controller";
import { TelegramUpdateHandler } from "./telegram-update.handler";
import { TelegramPollingWorker } from "../../workers/telegram-polling.worker";
import { BotOwnershipGuard } from "./guards/bot-ownership.guard";

// Domain interface token (see note below)
import { BotRepository } from "../../domain/bots/BotRepository";
import { SettingsRepository } from "../../domain/settings/SettingsRepository";

// Infra implementations
import { BotRepositoryPrisma } from "../../infra/db/repositories/BotRepositoryPrisma";
import { SettingsRepositoryPrisma } from "../../infra/db/repositories/SettingsRepositoryPrisma";
import { TelegramClient } from "../../infra/telegram/telegramClient";
import { PgBossClient } from "../../infra/jobs/pgBoss";
import { EffectRunner } from "../../infra/effects/EffectRunner";
import { OpenAIClient } from "../../infra/openai/openaiClient";

@Module({
  controllers: [BotsAdminController, BotsWebhookController],
  providers: [
    BotsService,
    TelegramUpdateHandler,
    TelegramPollingWorker,
    BotOwnershipGuard,

    // Infra services used by effects/update handling
    TelegramClient,
    PgBossClient,
    EffectRunner,
    OpenAIClient,

    // Bind domain repo interface -> prisma implementation
    {
      provide: BotRepository,
      useClass: BotRepositoryPrisma,
    },
    {
      provide: SettingsRepository,
      useClass: SettingsRepositoryPrisma,
    },
  ],
  exports: [BotsService, EffectRunner, PgBossClient, BotRepository],
})
export class BotsModule {}
