import { Injectable } from "@nestjs/common";

import { ChatRepository, ChatFilters } from "./ChatRepository";
import { MessageRepository } from "./MessageRepository";
import { BotRepository } from "../bots/BotRepository";
import { TgUserRepository } from "../tg-users/TgUserRepository";
import { Chat } from "./Chat";
import { Message } from "./Message";
import { TelegramClient } from "../../infra/telegram/telegramClient";
import { AuthUser } from "../users/types";

export type TelegramClientFactory = (token: string) => TelegramClient;

export type SendAdminMessageResult = {
  message: Message;
  telegramMessageId: number;
};

export type ChatMessagesWithParticipants = {
  chat: Chat;
  bot: { id: string; name: string; avatarUrl: string | null } | null;
  user: {
    id: string;
    username: string | null;
    firstName: string | null;
  } | null;
  messages: Array<{
    id: number;
    text: string;
    createdAt: Date;
    author: { type: "bot"; botId: number } | { type: "user"; tgUserId: string };
  }>;
};

@Injectable()
export class ChatsService {
  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly messageRepository: MessageRepository,
    private readonly botRepository: BotRepository,
    private readonly tgUserRepository: TgUserRepository,
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

  /**
   * Get chat messages with chat data and participants (bot and user)
   */
  async getChatMessagesWithParticipants(
    chatId: string
  ): Promise<ChatMessagesWithParticipants> {
    const chat = await this.getOrThrow(chatId);

    // Get messages
    const messages = await this.messageRepository.findByChatId(chat.id);

    // Get bot if chat has botId
    let bot: { id: string; name: string; avatarUrl: string | null } | null =
      null;
    if (chat.botId) {
      const botEntity = await this.botRepository.findById(String(chat.botId));
      if (botEntity) {
        bot = {
          id: botEntity.id,
          name: botEntity.name,
          avatarUrl: null, // FIXME: avatarUrl is not stored in Bot model, consider adding it
        };
      }
    }

    // Get user
    const userEntity = await this.tgUserRepository.findById(chat.tgUserId);
    const user = userEntity
      ? {
          id: userEntity.id.toString(),
          username: userEntity.username,
          firstName: userEntity.name, // FIXME: using name as firstName, consider adding firstName field to TgUser model
        }
      : null;

    // Map messages with author information
    const messagesWithAuthor = messages.map((message) => {
      if (message.botId !== null && message.tgUserId === null) {
        return {
          id: message.id,
          text: message.text,
          createdAt: message.createdAt,
          author: { type: "bot" as const, botId: message.botId },
        };
      } else if (message.tgUserId !== null) {
        return {
          id: message.id,
          text: message.text,
          createdAt: message.createdAt,
          author: {
            type: "user" as const,
            tgUserId: message.tgUserId.toString(),
          },
        };
      } else {
        // Fallback for messages without author (should not happen in normal flow)
        throw new Error(`Message ${message.id} has neither botId nor tgUserId`);
      }
    });

    return {
      chat,
      bot,
      user,
      messages: messagesWithAuthor,
    };
  }

  async getMessage(chatId: string, messageId: number): Promise<Message> {
    const chat = await this.getOrThrow(chatId);
    const message = await this.messageRepository.findById(messageId);

    if (!message) {
      throw new Error(`Message not found: ${messageId}`);
    }

    if (message.chatId !== chat.id) {
      throw new Error(`Message ${messageId} does not belong to chat ${chatId}`);
    }

    return message;
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
