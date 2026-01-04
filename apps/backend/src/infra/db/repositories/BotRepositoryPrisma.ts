import { BotRepository } from "../../../domain/bots/BotRepository";
import { Bot as PrismaBot } from "../prisma/generated/client";
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

  async findPollingBots(): Promise<Bot[]> {
    const rows = await prisma.bot.findMany({
      where: {
        enabled: true,
        telegramMode: "polling",
      },
    });
    return rows.map((row) => this.toDomain(row));
  }

  async save(bot: Bot): Promise<void> {
    const data = this.toPrisma(bot);
    const botId = parseInt(bot.id, 10);
    if (isNaN(botId)) {
      throw new Error(`Invalid bot id: ${bot.id}`);
    }

    await prisma.bot.upsert({
      where: { id: botId },
      create: data,
      update: data,
    });
  }

  private toDomain(row: PrismaBot): Bot {
    return new Bot({
      id: String(row.id),
      enabled: row.enabled,
      telegramMode: row.telegramMode as "webhook" | "polling",
      token: row.token,
    });
  }

  private toPrisma(bot: Bot): PrismaBotCreateUpdateData {
    return {
      id: parseInt(bot.id, 10),
      enabled: bot.enabled,
      telegramMode: bot.telegramMode,
      token: bot.token,
      // TODO + остальные поля
    };
  }
}

type PrismaBotCreateUpdateData = Omit<PrismaBot, "createdAt" | "updatedAt">;
