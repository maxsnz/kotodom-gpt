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
  async findByTelegramUpdateId(
    telegramUpdateId: number
  ): Promise<Message | null> {
    const row = await prisma.message.findFirst({
      where: {
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
    // First try to find by telegramUpdateId (works for both old and new format)
    if (input.telegramUpdateId !== null) {
      const existing = await this.findByTelegramUpdateId(
        Number(input.telegramUpdateId)
      );

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
