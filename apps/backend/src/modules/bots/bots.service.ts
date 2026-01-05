import { Injectable } from "@nestjs/common";

import {
  BotRepository,
  CreateBotData,
} from "../../domain/bots/BotRepository";
import { Bot } from "../../domain/bots/Bot";
import { EffectRunner } from "../../infra/effects/EffectRunner";
import { AuthUser, UserRole } from "../../domain/users/types";

export type CreateBotInput = Omit<CreateBotData, "ownerUserId">;

export type UpdateBotInput = Partial<CreateBotInput>;

@Injectable()
export class BotsService {
  constructor(
    private readonly botRepo: BotRepository,
    private readonly effectRunner: EffectRunner
  ) {}

  /**
   * Get all bots, filtered by ownership for USER role
   */
  async getAll(user?: AuthUser): Promise<Bot[]> {
    // If no user provided or user is ADMIN/MANAGER, return all bots
    if (!user || user.role === "ADMIN" || user.role === "MANAGER") {
      return this.botRepo.findAll();
    }

    // USER role: return only their own bots
    return this.botRepo.findByOwner(user.id);
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
      assistantId: input.assistantId,
      token: input.token,
      telegramMode: input.telegramMode,
      ownerUserId: ownerUserId ?? null,
    });
  }

  async update(id: string, input: UpdateBotInput): Promise<Bot> {
    const bot = await this.getOrThrow(id);

    // Create a new Bot with updated fields
    const updatedBot = new Bot({
      id: bot.id,
      name: input.name?.trim() ?? bot.name,
      startMessage: input.startMessage ?? bot.startMessage,
      errorMessage: input.errorMessage ?? bot.errorMessage,
      model: input.model ?? bot.model,
      assistantId: input.assistantId ?? bot.assistantId,
      token: input.token ?? bot.token,
      enabled: bot.enabled,
      isActive: bot.isActive,
      telegramMode: input.telegramMode ?? bot.telegramMode,
      error: bot.error,
      ownerUserId: bot.ownerUserId, // Preserve owner
    });

    await this.botRepo.save(updatedBot);
    return updatedBot;
  }

  async delete(id: string): Promise<void> {
    await this.getOrThrow(id); // Ensure bot exists
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
}
