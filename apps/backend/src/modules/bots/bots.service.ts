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
  assistantId: string;
  token: string;
  telegramMode: "webhook" | "polling";
  enabled: boolean;
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
      assistantId: input.assistantId,
      token: input.token,
      telegramMode: input.telegramMode,
      ownerUserId: ownerUserId ?? null,
    });
  }

  async update(id: string, input: UpdateBotInput): Promise<Bot> {
    const bot = await this.getOrThrow(id);

    const newTelegramMode = input.telegramMode ?? bot.telegramMode;
    const newEnabled = input.enabled ?? bot.enabled;
    const modeChanged =
      input.telegramMode !== undefined &&
      input.telegramMode !== bot.telegramMode;
    const enabledChanged =
      input.enabled !== undefined && input.enabled !== bot.enabled;

    // Collect all effects
    const effects: ReturnType<Bot["enable"]> = [];

    // Handle mode change effects (based on old bot state)
    // Note: onModeChange checks bot.enabled, so if enabled is also changing,
    // we need to handle that separately
    if (modeChanged && !enabledChanged) {
      // Only mode changed, use onModeChange
      const modeChangeEffects = bot.onModeChange(
        bot.telegramMode,
        newTelegramMode
      );
      effects.push(...modeChangeEffects);
    } else if (modeChanged && enabledChanged) {
      // Both changed - handle mode transition first, then enabled change
      // For mode change: always remove webhook if switching to polling
      if (bot.telegramMode === "webhook" && newTelegramMode === "polling") {
        effects.push({ type: "telegram.removeWebhook", botToken: bot.token });
      }
      // For enabled change: use new mode to determine effects
      if (newEnabled) {
        // Bot is being enabled - generate effects based on new mode
        if (newTelegramMode === "webhook") {
          effects.push({
            type: "telegram.ensureWebhook",
            botId: bot.id,
            botToken: bot.token,
          });
        } else if (newTelegramMode === "polling") {
          effects.push({
            type: "telegram.refreshPolling",
            botId: bot.id,
          });
        }
      } else {
        // Bot is being disabled - generate effects based on old mode
        if (bot.telegramMode === "webhook") {
          effects.push({ type: "telegram.removeWebhook", botToken: bot.token });
        } else if (bot.telegramMode === "polling") {
          effects.push({
            type: "telegram.refreshPolling",
            botId: bot.id,
          });
        }
      }
    } else if (enabledChanged && !modeChanged) {
      // Only enabled changed, use enable/disable methods
      if (newEnabled) {
        const enableEffects = bot.enable();
        effects.push(...enableEffects);
      } else {
        const disableEffects = bot.disable();
        effects.push(...disableEffects);
      }
    }

    // Create a new Bot with updated fields
    const updatedBot = new Bot({
      id: bot.id,
      name: input.name?.trim() ?? bot.name,
      startMessage: input.startMessage ?? bot.startMessage,
      errorMessage: input.errorMessage ?? bot.errorMessage,
      model: input.model ?? bot.model,
      assistantId: input.assistantId ?? bot.assistantId,
      token: input.token ?? bot.token,
      enabled: newEnabled,
      telegramMode: newTelegramMode,
      error: bot.error,
      ownerUserId: bot.ownerUserId, // Preserve owner
    });

    await this.botRepo.save(updatedBot);

    // Run all effects
    if (effects.length > 0) {
      await this.effectRunner.runAll(effects);
    }

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
