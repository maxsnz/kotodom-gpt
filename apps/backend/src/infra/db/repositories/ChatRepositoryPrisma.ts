import { ChatRepository } from "../../../domain/chats/ChatRepository";
import { Chat as PrismaChat } from "../prisma/generated/client";
import { Chat } from "../../../domain/chats/Chat";
import type { TgUser } from "../prisma/generated/client";
import { prisma } from "../prisma/client";

export class ChatRepositoryPrisma extends ChatRepository {
  async findById(id: string): Promise<Chat | null> {
    const row = await prisma.chat.findUnique({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async findByUserId(tgUserId: bigint): Promise<Chat[]> {
    const rows = await prisma.chat.findMany({
      where: { tgUserId },
    });
    return rows.map((row) => this.toDomain(row));
  }

  async findByBotId(botId: number): Promise<Chat[]> {
    const rows = await prisma.chat.findMany({
      where: { botId },
    });
    return rows.map((row) => this.toDomain(row));
  }

  async save(chat: Chat): Promise<void> {
    const data = this.toPrisma(chat);

    await prisma.chat.upsert({
      where: { id: chat.id },
      create: data,
      update: data,
    });
  }

  async findOrCreateChat(
    chatId: string,
    tgUserId: bigint,
    botId: number
  ): Promise<Chat> {
    const created = await prisma.chat.upsert({
      where: { id: chatId },
      create: {
        id: chatId,
        tgUserId,
        botId,
        threadId: null,
        name: null,
      },
      update: {}, // не обновляем, если уже существует
    });

    return this.toDomain(created);
  }

  async findOrCreateUser(
    tgUserId: bigint,
    userData: {
      username?: string;
      firstName?: string;
      lastName?: string;
    }
  ): Promise<TgUser> {
    const fullName = this.buildFullName(userData.firstName, userData.lastName);

    return await prisma.tgUser.upsert({
      where: { id: tgUserId },
      create: {
        id: tgUserId,
        username: userData.username ?? null,
        name: userData.firstName ?? null,
        fullName: fullName ?? null,
      },
      update: {
        username: userData.username ?? null,
        name: userData.firstName ?? null,
        fullName: fullName ?? null,
      },
    });
  }

  private toDomain(row: PrismaChat): Chat {
    return new Chat({
      id: row.id,
      botId: row.botId,
      tgUserId: row.tgUserId,
      threadId: row.threadId,
      name: row.name,
      createdAt: row.createdAt,
    });
  }

  private toPrisma(chat: Chat): PrismaChatCreateUpdateData {
    return {
      id: chat.id,
      botId: chat.botId,
      tgUserId: chat.tgUserId,
      threadId: chat.threadId,
      name: chat.name,
      createdAt: chat.createdAt,
    };
  }

  private buildFullName(
    firstName?: string,
    lastName?: string
  ): string | null {
    if (!firstName && !lastName) {
      return null;
    }
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }
    return firstName ?? lastName ?? null;
  }
}

type PrismaChatCreateUpdateData = Omit<
  PrismaChat,
  "messages" | "bot" | "tgUser"
>;
