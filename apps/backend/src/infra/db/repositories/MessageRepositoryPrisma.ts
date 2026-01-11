import {
  CreateAdminMessageInput,
  CreateBotMessageInput,
  CreateUserMessageInput,
  MessageRepository,
} from "../../../domain/chats/MessageRepository";
import { Message } from "../../../domain/chats/Message";
import type { Message as PrismaMessage } from "../prisma/generated/client";
import { prisma } from "../prisma/client";

export class MessageRepositoryPrisma extends MessageRepository {
  async findByTelegramUpdate(
    botId: number,
    telegramUpdateId: number
  ): Promise<Message | null> {
    const row = await prisma.message.findFirst({
      where: {
        botId,
        telegramUpdateId: BigInt(telegramUpdateId),
      },
    });

    return row ? this.toDomain(row) : null;
  }

  async findUserMessageByTelegramUpdate(
    botId: number,
    telegramUpdateId: number
  ): Promise<Message | null> {
    const row = await prisma.message.findFirst({
      where: {
        botId,
        telegramUpdateId: BigInt(telegramUpdateId),
        tgUserId: {
          not: null,
        },
      },
    });

    return row ? this.toDomain(row) : null;
  }

  async findBotResponseForUserMessage(
    userMessageId: number
  ): Promise<Message | null> {
    const row = await prisma.message.findFirst({
      where: {
        userMessageId,
      },
    });

    return row ? this.toDomain(row) : null;
  }

  async findByChatId(chatId: string): Promise<Message[]> {
    const rows = await prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: "asc" },
    });
    return rows.map((row) => this.toDomain(row));
  }

  async findById(id: number): Promise<Message | null> {
    const row = await prisma.message.findUnique({
      where: { id },
    });
    return row ? this.toDomain(row) : null;
  }

  async findAll(): Promise<Message[]> {
    const rows = await prisma.message.findMany({
      orderBy: { createdAt: "desc" },
    });
    return rows.map((row) => this.toDomain(row));
  }

  async save(message: Message): Promise<void> {
    await prisma.message.update({
      where: { id: message.id },
      data: {
        chatId: message.chatId,
        tgUserId: message.tgUserId,
        botId: message.botId,
        text: message.text,
        telegramUpdateId: message.telegramUpdateId,
        userMessageId: message.userMessageId,
      },
    });
  }

  async createUserMessage(input: CreateUserMessageInput): Promise<Message> {
    // Idempotent creation: try to find existing message first
    // For user messages (botId is null), search by chatId, tgUserId, and telegramUpdateId
    // For bot messages (botId is not null), use the existing findByTelegramUpdate method
    if (input.telegramUpdateId !== null) {
      let existing: Message | null = null;

      if (input.botId !== null) {
        // Bot message - use existing method
        existing = await this.findByTelegramUpdate(
          input.botId,
          Number(input.telegramUpdateId)
        );
      } else {
        // User message - search by chatId, tgUserId, and telegramUpdateId
        const row = await prisma.message.findFirst({
          where: {
            chatId: input.chatId,
            tgUserId: input.tgUserId,
            telegramUpdateId: input.telegramUpdateId,
            botId: null, // Ensure it's a user message
          },
        });
        existing = row ? this.toDomain(row) : null;
      }

      if (existing) {
        return existing;
      }
    }

    const row = await prisma.message.create({
      data: {
        chatId: input.chatId,
        tgUserId: input.tgUserId,
        botId: input.botId, // null for user messages
        text: input.text,
        telegramUpdateId: input.telegramUpdateId,
        userMessageId: null,
      },
    });

    return this.toDomain(row);
  }

  async createBotMessage(input: CreateBotMessageInput): Promise<Message> {
    const row = await prisma.message.create({
      data: {
        chatId: input.chatId,
        botId: input.botId,
        tgUserId: null,
        text: input.text,
        telegramUpdateId: null,
        userMessageId: input.userMessageId,
      },
    });

    return this.toDomain(row);
  }

  async createAdminMessage(input: CreateAdminMessageInput): Promise<Message> {
    const row = await prisma.message.create({
      data: {
        chatId: input.chatId,
        botId: input.botId,
        tgUserId: null,
        text: input.text,
        telegramUpdateId: null,
        userMessageId: null,
      },
    });

    return this.toDomain(row);
  }

  async delete(id: number): Promise<void> {
    await prisma.message.delete({
      where: { id },
    });
  }

  private toDomain(row: PrismaMessage): Message {
    return new Message({
      id: row.id,
      chatId: row.chatId,
      tgUserId: row.tgUserId,
      botId: row.botId,
      text: row.text,
      telegramUpdateId: row.telegramUpdateId,
      userMessageId: row.userMessageId,
      createdAt: row.createdAt,
    });
  }
}
