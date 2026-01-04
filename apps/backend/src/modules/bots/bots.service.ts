import { BotRepository } from "../../domain/bots/BotRepository";
import { Bot } from "../../domain/bots/Bot";

export class BotsService {
  constructor(private readonly botRepo: BotRepository) {}

  async getById(id: string): Promise<Bot | null> {
    if (!id) throw new Error("BotsService.getById: id is required");
    return this.botRepo.findById(id);
  }

  async getOrThrow(id: string): Promise<Bot> {
    const bot = await this.getById(id);
    if (!bot) throw new Error(`Bot not found: ${id}`);
    return bot;
  }

  /**
   * Create or update (upsert-like) depending on your repository implementation.
   * If you want strict create-only, split into create/update.
   */
  async save(bot: Bot): Promise<void> {
    this.assertBot(bot);
    await this.botRepo.save(bot);
  }

  /**
   * Example "rename" use-case (domain-level change + persistence).
   * Adjust fields to your real Bot shape.
   */
  async renameBot(botId: string, newName: string): Promise<Bot> {
    if (!newName?.trim())
      throw new Error("BotsService.renameBot: newName is required");

    const bot = await this.getOrThrow(botId);

    // If Bot is a domain entity/class with methods — call bot.rename(newName)
    // If Bot is a plain type — update immutably:
    const updated: Bot = {
      ...bot,
      name: newName.trim(),
      updatedAt: new Date(),
    } as unknown as Bot;

    await this.botRepo.save(updated);
    return updated;
  }

  private assertBot(bot: Bot): void {
    if (!bot) throw new Error("BotsService.save: bot is required");

    // Минимальные проверки — подстрой под свою модель
    const anyBot = bot as any;
    if (!anyBot.id) throw new Error("BotsService.save: bot.id is required");
    // if (!anyBot.ownerId) throw new Error("BotsService.save: bot.ownerId is required");
  }
}
