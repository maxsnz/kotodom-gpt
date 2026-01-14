import { TelegramClient } from "../../infra/telegram/telegramClient";
import { ChatAction } from "../../infra/telegram/telegramClient";

const TYPING_INTERVAL_MS = 5000; // 5 seconds

type LoggerLike = {
  error?: (msg: string, meta?: Record<string, unknown>) => void;
};

/**
 * Manages periodic TYPING actions during message processing.
 * Sends TYPING action every 5 seconds while active.
 */
export class TypingActionManager {
  private intervalId: NodeJS.Timeout | null = null;
  private chatId: number | string | null = null;
  private telegramClient: TelegramClient | null = null;
  private logger: LoggerLike | null = null;

  /**
   * Start sending TYPING action periodically.
   * @param chatId - Telegram chat ID
   * @param telegramClient - Telegram client instance
   * @param logger - Optional logger for error reporting
   */
  startTyping(
    chatId: number | string,
    telegramClient: TelegramClient,
    logger?: LoggerLike
  ): void {
    // Stop any existing typing if already running
    this.stopTyping();

    this.chatId = chatId;
    this.telegramClient = telegramClient;
    this.logger = logger ?? null;

    // Send first TYPING immediately
    this.sendTypingAction().catch((error) => {
      // Log but don't fail - TYPING is non-critical
      if (this.logger?.error) {
        this.logger.error("Failed to send initial TYPING action", {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    });

    // Set up interval to send TYPING every 5 seconds
    this.intervalId = setInterval(() => {
      this.sendTypingAction().catch((error) => {
        // Log but don't fail - TYPING is non-critical
        if (this.logger?.error) {
          this.logger.error("Failed to send periodic TYPING action", {
            error: error instanceof Error ? error.message : String(error),
          });
        }
      });
    }, TYPING_INTERVAL_MS);
  }

  /**
   * Stop sending TYPING action and clean up interval.
   */
  stopTyping(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.chatId = null;
    this.telegramClient = null;
    this.logger = null;
  }

  private async sendTypingAction(): Promise<void> {
    if (this.chatId === null || this.telegramClient === null) {
      return;
    }

    await this.telegramClient.sendChatAction({
      chatId: this.chatId,
      action: ChatAction.TYPING,
    });
  }

  /**
   * Check if TYPING is currently active.
   */
  isActive(): boolean {
    return this.intervalId !== null;
  }
}
