import { Inject, Injectable, OnModuleInit } from "@nestjs/common";

import { BotRepository } from "../domain/bots/BotRepository";
import { EffectRunner } from "../infra/effects/EffectRunner";
import {
  AppLogger,
  LOGGER_FACTORY,
  type LoggerFactory,
  createConsoleLoggerFactory,
} from "../infra/logger";

@Injectable()
export class TelegramWebhookRegistrationService implements OnModuleInit {
  private readonly logger: AppLogger;

  constructor(
    private readonly botRepo: BotRepository,
    private readonly effectRunner: EffectRunner,
    @Inject(LOGGER_FACTORY) loggerFactory?: LoggerFactory
  ) {
    const factory = loggerFactory ?? createConsoleLoggerFactory();
    this.logger = factory(TelegramWebhookRegistrationService.name);
  }

  async onModuleInit(): Promise<void> {
    this.logger.info("Starting Telegram webhook registration...");
    await this.registerWebhooks();
  }

  private async registerWebhooks(): Promise<void> {
    try {
      const webhookBots = await this.botRepo.findWebhookBots();
      this.logger.info(`Found ${webhookBots.length} webhook bot(s)`);

      for (const bot of webhookBots) {
        try {
          await this.effectRunner.run({
            type: "telegram.ensureWebhook",
            botId: bot.id,
            botToken: bot.token,
          });
          this.logger.info(`Registered webhook for bot ${bot.id} (${bot.name})`, {
            botId: bot.id,
          });
        } catch (error) {
          this.logger.error(`Failed to register webhook for bot ${bot.id}`, {
            botId: bot.id,
            error: error instanceof Error ? error.message : error,
          });
        }
      }
    } catch (error) {
      this.logger.error("Failed to register webhooks for bots", {
        error,
      });
    }
  }
}
