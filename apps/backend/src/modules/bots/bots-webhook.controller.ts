import {
  Controller,
  Post,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  NotFoundException,
  BadRequestException,
  Logger,
} from "@nestjs/common";

import { TelegramUpdateHandler } from "./telegram-update.handler";
import { BotRepository } from "../../domain/bots/BotRepository";

@Controller("webhook")
export class BotsWebhookController {
  private readonly logger = new Logger(BotsWebhookController.name);

  constructor(
    private readonly telegramUpdateHandler: TelegramUpdateHandler,
    private readonly botRepo: BotRepository
  ) {}

  @Post(":botId")
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Param("botId") botId: string,
    @Body() update: unknown
  ): Promise<{ ok: boolean }> {
    this.logger.debug(`Received webhook for botId=${botId}`);

    // Load bot from database
    const bot = await this.botRepo.findById(botId);
    if (!bot) {
      this.logger.warn(`Bot not found: botId=${botId}`);
      throw new NotFoundException(`Bot with id ${botId} not found`);
    }

    // Check if bot is configured for webhook mode
    if (bot.telegramMode !== "webhook") {
      this.logger.warn(
        `Bot ${botId} is not configured for webhook mode (current mode: ${bot.telegramMode})`
      );
      throw new BadRequestException(
        `Bot ${botId} is not configured for webhook mode`
      );
    }

    // Check if bot is enabled
    if (!bot.enabled) {
      this.logger.warn(`Bot ${botId} is disabled`);
      throw new BadRequestException(`Bot ${botId} is disabled`);
    }

    // Process update asynchronously (don't await to return quickly to Telegram)
    this.telegramUpdateHandler.handle(botId, update).catch((error) => {
      this.logger.error(
        `Error processing webhook update for botId=${botId}`,
        error
      );
    });

    // Return 200 OK immediately to Telegram (webhook best practice)
    return { ok: true };
  }
}
