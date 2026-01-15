import { Injectable } from "@nestjs/common";

import { BotRepository, CreateBotData } from "../../domain/bots/BotRepository";
import { Bot } from "../../domain/bots/Bot";
import { EffectRunner } from "../../infra/effects/EffectRunner";
import { AuthUser, UserRole } from "../../domain/users/types";

export type CreateBotInput = Omit<CreateBotData, "ownerUserId">;

export type UpdateBotInput = Partial<{
  name: string;
  startMessage: string;
  errorMessage: string;
  model: string;
  token: string;
  telegramMode: "webhook" | "polling";
  enabled: boolean;
  prompt: string;
}>;

@Injectable()
export class BotsService {
  constructor(
    private readonly botRepo: BotRepository,
    private readonly effectRunner: EffectRunner
  ) {}

  /**
   * Get all bots
   */
  async getAll(): Promise<Bot[]> {
    return this.botRepo.findAll();
  }

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
   * Create a new bot with the specified owner
   * Note: Input validation is handled by ZodValidationPipe in the controller
   */
  async create(input: CreateBotInput, ownerUserId?: string): Promise<Bot> {
    return this.botRepo.create({
      name: input.name,
      startMessage: input.startMessage,
      errorMessage: input.errorMessage,
      model: input.model,
      token: input.token,
      telegramMode: input.telegramMode,
      ownerUserId: ownerUserId ?? null,
      prompt: input.prompt,
    });
  }

  async update(id: string, input: UpdateBotInput): Promise<Bot> {
    const oldBot = await this.getOrThrow(id);

    // 1. Stop bot with old settings (old token, old mode)
    const stopEffects = oldBot.stop();
    await this.effectRunner.runAll(stopEffects);

    // 2. Save new settings to database
    const updatedBot = new Bot({
      id: oldBot.id,
      name: input.name?.trim() ?? oldBot.name,
      startMessage: input.startMessage ?? oldBot.startMessage,
      errorMessage: input.errorMessage ?? oldBot.errorMessage,
      model: input.model ?? oldBot.model,
      token: input.token ?? oldBot.token,
      enabled: input.enabled ?? oldBot.enabled,
      telegramMode: input.telegramMode ?? oldBot.telegramMode,
      error: oldBot.error,
      ownerUserId: oldBot.ownerUserId, // Preserve owner
      prompt: input.prompt || oldBot.prompt,
      createdAt: oldBot.createdAt,
      updatedAt: oldBot.updatedAt,
    });

    await this.botRepo.save(updatedBot);

    // 3. Start bot with new settings (if enabled)
    if (updatedBot.enabled) {
      const startEffects = updatedBot.enable();
      await this.effectRunner.runAll(startEffects);
    }

    return updatedBot;
  }

  async delete(id: string): Promise<void> {
    const bot = await this.getOrThrow(id); // Ensure bot exists

    // Cleanup: stop bot completely before deletion
    const cleanupEffects = bot.stop();
    if (cleanupEffects.length > 0) {
      await this.effectRunner.runAll(cleanupEffects);
    }

    await this.botRepo.delete(id);
  }

  async enableBot(id: string): Promise<Bot> {
    const bot = await this.getOrThrow(id);
    const effects = bot.enable();
    await this.botRepo.save(bot);
    await this.effectRunner.runAll(effects);
    return bot;
  }

  async disableBot(id: string): Promise<Bot> {
    const bot = await this.getOrThrow(id);
    const effects = bot.disable();
    await this.botRepo.save(bot);
    await this.effectRunner.runAll(effects);
    return bot;
  }

  async restartBot(id: string): Promise<Bot> {
    const bot = await this.getOrThrow(id);
    const effects = bot.restart();
    await this.effectRunner.runAll(effects);
    return bot;
  }
}
