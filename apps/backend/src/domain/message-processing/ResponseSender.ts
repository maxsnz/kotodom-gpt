import { TelegramClient } from "../../infra/telegram/telegramClient";
import { MessageProcessingRepository } from "./MessageProcessingRepository";
import { SaveResult, ResponseSender, LoggerLike } from "./MessageProcessor";

const TELEGRAM_MAX_MESSAGE_LENGTH = 4096;

/**
 * Truncate message text to Telegram's maximum length.
 * Logs a warning if truncation occurs.
 */
function truncateMessage(
  text: string,
  maxLength: number = TELEGRAM_MAX_MESSAGE_LENGTH,
  logger?: LoggerLike
): string {
  if (text.length <= maxLength) {
    return text;
  }

  const truncated = text.substring(0, maxLength);
  logger?.warn?.(
    `Message text truncated from ${text.length} to ${maxLength} characters`,
    { originalLength: text.length, truncatedLength: maxLength }
  );
  return truncated;
}

/**
 * Responsible for sending bot responses to Telegram.
 */
export class DefaultResponseSender implements ResponseSender {
  constructor(
    private readonly telegramClientFactory: (token: string) => TelegramClient,
    private readonly messageProcessingRepository: MessageProcessingRepository
  ) {}

  async sendResponse(
    result: SaveResult,
    botId: number | null,
    logger: LoggerLike,
    userMessageId: number,
    chatId?: number
  ): Promise<void> {
    const bot = result.bot;
    const chat = result.chat;
    const telegramChatId = chatId ?? Number(chat.telegramChatId);
    const telegramClient = this.telegramClientFactory(bot.token);

    const truncatedText = truncateMessage(result.botMessage.text, undefined, logger);

    const sendResult = await telegramClient.sendMessage({
      chatId: telegramChatId.toString(),
      text: truncatedText,
    });

    await this.messageProcessingRepository.markResponseSent(
      userMessageId,
      sendResult.messageId
    );

    logger.info(`Outgoing message: ${truncatedText}`, {
      botId,
      chatId: telegramChatId,
      telegramMessageId: sendResult.messageId,
      userMessageId,
    });
  }

  async editMessage(
    chatId: number | string,
    messageId: number,
    text: string,
    botToken: string,
    logger: LoggerLike
  ): Promise<void> {
    const telegramClient = this.telegramClientFactory(botToken);
    const truncatedText = truncateMessage(text, undefined, logger);

    try {
      await telegramClient.editMessageText({
        chatId: chatId.toString(),
        messageId,
        text: truncatedText,
      });
    } catch (error) {
      // Log but don't fail - message already sent, editing is best-effort
      logger.warn?.(
        `Failed to edit message ${messageId} in chat ${chatId}: ${error}`,
        {
          chatId,
          messageId,
          error: error instanceof Error ? error.message : String(error),
        }
      );
    }
  }
}
