import { TelegramClient } from "../../infra/telegram/telegramClient";
import { MessageProcessingRepository } from "../chats/MessageProcessingRepository";
import { SaveResult, ResponseSender, LoggerLike } from "./MessageProcessor";

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

    const sendResult = await telegramClient.sendMessage({
      chatId: telegramChatId.toString(),
      text: result.botMessage.text,
    });

    await this.messageProcessingRepository.markResponseSent(
      userMessageId,
      sendResult.messageId
    );

    logger.info(`Outgoing message: ${result.botMessage.text}`, {
      botId,
      chatId: telegramChatId,
      telegramMessageId: sendResult.messageId,
      userMessageId,
    });
  }
}

