import {
  BotRepository,
  CreateBotData,
} from "../../../domain/bots/BotRepository";
import type { Bot as PrismaBot, Prisma } from "../prisma/generated/client";
import { Bot } from "../../../domain/bots/Bot";
import { prisma } from "../prisma/client";

export class BotRepositoryPrisma extends BotRepository {
  async findById(id: string): Promise<Bot | null> {
    const botId = parseInt(id, 10);
    if (isNaN(botId)) {
      return null;
    }
    const row = await prisma.bot.findUnique({ where: { id: botId } });
    return row ? this.toDomain(row) : null;
  }

  async findAll(): Promise<Bot[]> {
    const rows = await prisma.bot.findMany({ orderBy: { id: "asc" } });
    return rows.map((row) => this.toDomain(row));
  }

  async findByOwner(ownerUserId: string): Promise<Bot[]> {
    const rows = await prisma.bot.findMany({
      where: { ownerUserId },
      orderBy: { id: "asc" },
    });
    return rows.map((row) => this.toDomain(row));
  }

  async findPollingBots(): Promise<Bot[]> {
    const rows = await prisma.bot.findMany({
      where: {
        enabled: true,
        telegramMode: "polling",
      },
    });
    return rows.map((row) => this.toDomain(row));
  }

  async findWebhookBots(): Promise<Bot[]> {
    const rows = await prisma.bot.findMany({
      where: {
        enabled: true,
        telegramMode: "webhook",
      },
    });
    return rows.map((row) => this.toDomain(row));
  }

  async create(data: CreateBotData): Promise<Bot> {
    const row = await prisma.bot.create({
      data: {
        name: data.name,
        startMessage: data.startMessage,
        errorMessage: data.errorMessage,
        model: data.model,
        assistantId: data.assistantId,
        token: data.token,
        enabled: false,
        telegramMode: data.telegramMode,
        error: null,
        ownerUserId: data.ownerUserId ?? null,
      },
    });
    return this.toDomain(row);
  }

  async save(bot: Bot): Promise<void> {
    const { createData, updateData } = this.toPrisma(bot);
    const botId = parseInt(bot.id, 10);
    if (isNaN(botId)) {
      throw new Error(`Invalid bot id: ${bot.id}`);
    }

    await prisma.bot.upsert({
      where: { id: botId },
      create: createData,
      update: updateData,
    });
  }

  async delete(id: string): Promise<void> {
    const botId = parseInt(id, 10);
    if (isNaN(botId)) {
      throw new Error(`Invalid bot id: ${id}`);
    }
    await prisma.bot.delete({ where: { id: botId } });
  }

  private toDomain(row: PrismaBot): Bot {
    return new Bot({
      id: String(row.id),
      name: row.name,
      startMessage: row.startMessage,
      errorMessage: row.errorMessage,
      model: row.model,
      assistantId: row.assistantId,
      token: row.token,
      enabled: row.enabled,
      telegramMode: row.telegramMode as "webhook" | "polling",
      error: row.error ?? null,
      ownerUserId: row.ownerUserId ?? null,
    });
  }

  private toPrisma(bot: Bot): {
    createData: Prisma.BotUncheckedCreateInput;
    updateData: Prisma.BotUncheckedUpdateInput;
  } {
    const base = {
      id: parseInt(bot.id, 10),
      name: bot.name,
      startMessage: bot.startMessage,
      errorMessage: bot.errorMessage,
      model: bot.model,
      assistantId: bot.assistantId,
      token: bot.token,
      enabled: bot.enabled,
      telegramMode: bot.telegramMode,
      error: bot.error,
      ownerUserId: bot.ownerUserId,
    };

    const createData: Prisma.BotUncheckedCreateInput = {
      ...base,
    };

    const updateData: Prisma.BotUncheckedUpdateInput = {
      ...base,
    };

    return { createData, updateData };
  }
}
