import { Inject, Injectable } from "@nestjs/common";

import type { Effect } from "../../domain/effects/Effect";
import { TelegramClient } from "../telegram/telegramClient";
import type { TelegramClientFactory } from "../telegram/telegramClient";
import { PgBossClient } from "../jobs/pgBoss";
import { env } from "../../config/env";
import { SettingsRepository } from "../../domain/settings/SettingsRepository";
import {
  AppLogger,
  LOGGER_FACTORY,
  type LoggerFactory,
  createConsoleLoggerFactory,
} from "../logger";

// Setting keys for admin notifications
export const SETTING_ADMIN_NOTIFY_BOT_TOKEN = "admin_notify_bot_token";
export const SETTING_ADMIN_NOTIFY_CHAT_ID = "admin_notify_chat_id";

// Deduplication window: 1 hour
const DEDUPE_WINDOW_MS = 60 * 60 * 1000;

@Injectable()
export class EffectRunner {
  private readonly logger: AppLogger;
  private readonly recentNotifications: Map<string, number> = new Map();

  constructor(
    @Inject("TelegramClientFactory")
    private readonly telegramClientFactory: TelegramClientFactory,
    private readonly boss: PgBossClient,
    private readonly settingsRepository: SettingsRepository,
    @Inject(LOGGER_FACTORY) loggerFactory?: LoggerFactory
  ) {
    const factory = loggerFactory ?? createConsoleLoggerFactory();
    this.logger = factory(EffectRunner.name);
  }

  async runAll(effects: Effect[]): Promise<void> {
    // MVP: sequential execution keeps ordering deterministic and logs readable
    for (const effect of effects) {
      await this.run(effect);
    }
  }

  async run(effect: Effect): Promise<void> {
    switch (effect.type) {
      case "telegram.ensureWebhook": {
        const webhookUrl = `${env.BASE_URL}/telegram/webhook/${effect.botId}`;
        const client = this.telegramClientFactory.createClient(effect.botToken);
        await client.setWebhook(webhookUrl);
        return;
      }

      case "telegram.removeWebhook": {
        const client = this.telegramClientFactory.createClient(effect.botToken);
        await client.removeWebhook();
        return;
      }

      case "jobs.publish": {
        await this.boss.publish(
          effect.name,
          effect.payload as object,
          effect.options
        );
        return;
      }

      case "notification.adminAlert": {
        await this.sendAdminNotification(effect.message, effect.dedupeKey);
        return;
      }

      default: {
        // Exhaustiveness guard (will error at compile time if Effect is properly discriminated)
        this.assertNever(effect);
      }
    }
  }

  private async sendAdminNotification(
    message: string,
    dedupeKey?: string
  ): Promise<void> {
    // Fetch settings from database
    const botToken = await this.settingsRepository.getSetting(
      SETTING_ADMIN_NOTIFY_BOT_TOKEN
    );
    const chatIdStr = await this.settingsRepository.getSetting(
      SETTING_ADMIN_NOTIFY_CHAT_ID
    );

    if (!botToken || !chatIdStr) {
      this.logger.warn("Admin notification skipped: not configured", {
        message,
        hasBotToken: !!botToken,
        hasChatId: !!chatIdStr,
      });
      return;
    }

    const chatId = parseInt(chatIdStr, 10);
    if (Number.isNaN(chatId)) {
      this.logger.warn("Admin notification skipped: invalid chat ID", {
        chatIdStr,
      });
      return;
    }

    // Check deduplication
    if (dedupeKey) {
      const now = Date.now();
      const lastSent = this.recentNotifications.get(dedupeKey);

      if (lastSent && now - lastSent < DEDUPE_WINDOW_MS) {
        this.logger.debug("Admin notification deduplicated", { dedupeKey });
        return;
      }

      // Cleanup old entries
      for (const [key, timestamp] of this.recentNotifications.entries()) {
        if (now - timestamp > DEDUPE_WINDOW_MS) {
          this.recentNotifications.delete(key);
        }
      }

      this.recentNotifications.set(dedupeKey, now);
    }

    try {
      const adminClient = this.telegramClientFactory.createClient(botToken);
      await adminClient.sendMessage({
        chatId,
        text: message,
      });
      this.logger.info("Admin notification sent", { message, dedupeKey });
    } catch (error) {
      // Don't fail the effect if notification fails - just log
      this.logger.error("Failed to send admin notification", {
        error: error instanceof Error ? error.message : error,
        message,
      });
    }
  }

  private assertNever(x: never): never {
    // Runtime fallback if Effect is widened to `any`
    this.logger.error(`Unknown effect: ${JSON.stringify(x)}`);
    throw new Error("Unknown effect type");
  }
}
