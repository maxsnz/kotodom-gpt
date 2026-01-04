import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from "@nestjs/common";

import { BotRepository } from "../domain/bots/BotRepository";
import { TelegramUpdateHandler } from "../modules/bots/telegram-update.handler";
import { TelegramClient } from "../infra/telegram/telegramClient";

interface BotPollingState {
  botId: string;
  client: TelegramClient;
  lastUpdateId: number;
  intervalId: NodeJS.Timeout;
  isRunning: boolean;
}

@Injectable()
export class TelegramPollingWorker implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TelegramPollingWorker.name);
  private readonly pollingStates = new Map<string, BotPollingState>();
  private refreshIntervalId: NodeJS.Timeout | null = null;
  private readonly POLLING_INTERVAL_MS = 2000; // 2 seconds
  private readonly REFRESH_BOTS_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

  constructor(
    private readonly botRepo: BotRepository,
    private readonly telegramUpdateHandler: TelegramUpdateHandler
  ) {}

  async onModuleInit() {
    this.logger.log("Starting Telegram polling worker...");
    await this.startPolling();
    
    // Periodically refresh bot list to handle new/enabled bots
    this.refreshIntervalId = setInterval(() => {
      this.refreshPollingBots().catch((error) => {
        this.logger.error("Error refreshing polling bots", error);
      });
    }, this.REFRESH_BOTS_INTERVAL_MS);
  }

  async onModuleDestroy() {
    this.logger.log("Stopping Telegram polling worker...");
    
    if (this.refreshIntervalId) {
      clearInterval(this.refreshIntervalId);
      this.refreshIntervalId = null;
    }

    // Stop all polling loops
    const stopPromises = Array.from(this.pollingStates.values()).map((state) =>
      this.stopPollingForBot(state.botId)
    );
    await Promise.all(stopPromises);
    
    this.logger.log("Telegram polling worker stopped");
  }

  private async startPolling() {
    const bots = await this.botRepo.findPollingBots();
    this.logger.log(`Found ${bots.length} polling bot(s)`);

    for (const bot of bots) {
      await this.startPollingForBot(bot.id, bot.token);
    }
  }

  private async refreshPollingBots() {
    const currentBots = await this.botRepo.findPollingBots();
    const currentBotIds = new Set(currentBots.map((b) => b.id));

    // Stop polling for bots that are no longer enabled or in polling mode
    for (const [botId, state] of this.pollingStates.entries()) {
      if (!currentBotIds.has(botId)) {
        this.logger.log(`Stopping polling for bot ${botId} (no longer polling/enabled)`);
        await this.stopPollingForBot(botId);
      }
    }

    // Start polling for new bots
    for (const bot of currentBots) {
      if (!this.pollingStates.has(bot.id)) {
        this.logger.log(`Starting polling for bot ${bot.id}`);
        await this.startPollingForBot(bot.id, bot.token);
      }
    }
  }

  private async startPollingForBot(botId: string, token: string) {
    // Don't start if already polling
    if (this.pollingStates.has(botId)) {
      return;
    }

    try {
      const client = new TelegramClient({ token });
      const state: BotPollingState = {
        botId,
        client,
        lastUpdateId: 0,
        intervalId: setInterval(() => {
          this.pollUpdatesForBot(botId).catch((error) => {
            this.logger.error(`Error polling updates for bot ${botId}`, error);
          });
        }, this.POLLING_INTERVAL_MS),
        isRunning: true,
      };

      this.pollingStates.set(botId, state);
      this.logger.log(`Started polling for bot ${botId}`);

      // Poll immediately
      await this.pollUpdatesForBot(botId);
    } catch (error) {
      this.logger.error(`Failed to start polling for bot ${botId}`, error);
    }
  }

  private async stopPollingForBot(botId: string) {
    const state = this.pollingStates.get(botId);
    if (!state) {
      return;
    }

    state.isRunning = false;
    clearInterval(state.intervalId);
    this.pollingStates.delete(botId);
    this.logger.log(`Stopped polling for bot ${botId}`);
  }

  private async pollUpdatesForBot(botId: string) {
    const state = this.pollingStates.get(botId);
    if (!state || !state.isRunning) {
      return;
    }

    try {
      // Use Telegraf's getUpdates API
      const updates = await state.client.raw.telegram.getUpdates({
        offset: state.lastUpdateId + 1,
        timeout: 1, // Short timeout for polling
        limit: 100,
      });

      if (updates.length === 0) {
        return;
      }

      this.logger.debug(
        `Received ${updates.length} update(s) for bot ${botId}`
      );

      // Process each update
      for (const update of updates) {
        // Update lastUpdateId
        if (update.update_id >= state.lastUpdateId) {
          state.lastUpdateId = update.update_id;
        }

        // Process update asynchronously (don't await to keep polling responsive)
        this.telegramUpdateHandler.handle(botId, update).catch((error) => {
          this.logger.error(
            `Error processing update ${update.update_id} for bot ${botId}`,
            error
          );
        });
      }
    } catch (error) {
      // Log error but continue polling
      this.logger.error(
        `Error polling updates for bot ${botId}`,
        error instanceof Error ? error.message : String(error)
      );

      // If it's a fatal error (e.g., invalid token), stop polling for this bot
      if (this.isFatalError(error)) {
        this.logger.warn(
          `Fatal error for bot ${botId}, stopping polling`
        );
        await this.stopPollingForBot(botId);
      }
    }
  }

  private isFatalError(error: unknown): boolean {
    if (error && typeof error === "object" && "response" in error) {
      const response = (error as any).response;
      if (response && typeof response === "object") {
        const statusCode = response.statusCode || response.status;
        // 401 Unauthorized or 403 Forbidden indicate invalid token
        if (statusCode === 401 || statusCode === 403) {
          return true;
        }
      }
    }

    // Check error message for common fatal errors
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      if (
        message.includes("unauthorized") ||
        message.includes("forbidden") ||
        message.includes("invalid token")
      ) {
        return true;
      }
    }

    return false;
  }
}
