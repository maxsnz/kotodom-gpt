import { Injectable } from "@nestjs/common";

import { ChatRepository, ChatFilters } from "./ChatRepository";
import { MessageRepository } from "./MessageRepository";
import { BotRepository } from "../bots/BotRepository";
import { Chat } from "./Chat";
import { Message } from "./Message";
import { TelegramClient } from "../../infra/telegram/telegramClient";
import { AuthUser } from "../users/types";

export type TelegramClientFactory = (token: string) => TelegramClient;

export type SendAdminMessageResult = {
  message: Message;
  telegramMessageId: number;
};

@Injectable()
export class ChatsService {
  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly messageRepository: MessageRepository,
    private readonly botRepository: BotRepository,
    private readonly telegramClientFactory: TelegramClientFactory
  ) {}

  /**
   * Find all chats
   */
  async findAll(filters?: ChatFilters): Promise<Chat[]> {
    return this.chatRepository.findAll(filters);
  }

  async findById(id: string): Promise<Chat | null> {
    if (!id) throw new Error("ChatsService.findById: id is required");
    return this.chatRepository.findById(id);
  }

  async getOrThrow(id: string): Promise<Chat> {
    const chat = await this.findById(id);
    if (!chat) throw new Error(`Chat not found: ${id}`);
    return chat;
  }

  async getMessages(chatId: string): Promise<Message[]> {
    const chat = await this.getOrThrow(chatId);
    return this.messageRepository.findByChatId(chat.id);
  }

  async sendAdminMessage(
    chatId: string,
    text: string
  ): Promise<SendAdminMessageResult> {
    if (!text?.trim()) {
      throw new Error("ChatsService.sendAdminMessage: text is required");
    }

    const chat = await this.getOrThrow(chatId);

    if (!chat.botId) {
      throw new Error(
        "ChatsService.sendAdminMessage: chat has no associated bot"
      );
    }

    const bot = await this.botRepository.findById(String(chat.botId));
    if (!bot) {
      throw new Error(`Bot not found: ${chat.botId}`);
    }

    const telegramClient = this.telegramClientFactory(bot.token);

    // Send message to Telegram
    const sendResult = await telegramClient.sendMessage({
      chatId: chat.telegramChatId.toString(),
      text: text.trim(),
    });

    // Create admin message in database
    // Note: Admin messages don't use MessageProcessing - they're sent immediately
    const message = await this.messageRepository.createAdminMessage({
      chatId: chat.id,
      botId: chat.botId,
      text: text.trim(),
    });

    return {
      message,
      telegramMessageId: sendResult.messageId,
    };
  }
}
