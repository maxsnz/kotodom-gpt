import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Inject,
  Req,
  NotFoundException,
  UseGuards,
} from "@nestjs/common";
import { type FastifyRequest } from "fastify";

import { BotsService } from "./bots.service";
import { Bot } from "../../domain/bots/Bot";
import {
  AppLogger,
  LOGGER_FACTORY,
  type LoggerFactory,
  createConsoleLoggerFactory,
} from "../../infra/logger";
import { SessionAuthGuard } from "../auth/guards/session-auth.guard";
import { BotOwnershipGuard } from "./guards/bot-ownership.guard";
import { ZodValidationPipe } from "../../common/pipes";
import {
  CreateBotSchema,
  type CreateBotDto,
  UpdateBotSchema,
  type UpdateBotDto,
} from "./dto";

/**
 * Bot response DTO - hides sensitive token field
 */
type BotResponse = {
  id: string;
  name: string;
  startMessage: string;
  errorMessage: string;
  model: string;
  assistantId: string;
  enabled: boolean;
  isActive: boolean;
  telegramMode: "webhook" | "polling";
  error: string | null;
  ownerUserId: string | null;
};

@Controller("api/bots")
@UseGuards(SessionAuthGuard)
export class BotsAdminController {
  private readonly logger: AppLogger;

  constructor(
    private readonly botsService: BotsService,
    @Inject(LOGGER_FACTORY) loggerFactory?: LoggerFactory
  ) {
    const factory = loggerFactory ?? createConsoleLoggerFactory();
    this.logger = factory(BotsAdminController.name);
  }

  /**
   * GET /api/bots - List bots (filtered by ownership for USER role)
   */
  @Get()
  async listBots(
    @Req() request: FastifyRequest
  ): Promise<{ bots: BotResponse[] }> {
    const allBots = await this.botsService.getAll();

    // Filter bots based on user permissions
    const user = request.user;
    const filteredBots =
      user && user.role !== "ADMIN" && user.role !== "MANAGER"
        ? allBots.filter((bot) => bot.ownerUserId === user.id)
        : allBots;

    return { bots: filteredBots.map(this.toBotResponse) };
  }

  /**
   * GET /api/bots/:id - Get bot by ID (ownership checked)
   */
  @Get(":id")
  @UseGuards(BotOwnershipGuard)
  async getBot(@Req() request: FastifyRequest): Promise<{ bot: BotResponse }> {
    // Bot is loaded and attached by BotOwnershipGuard
    const bot = request.bot!;
    return { bot: this.toBotResponse(bot) };
  }

  /**
   * POST /api/bots - Create new bot (owner set to current user)
   */
  @Post()
  async createBot(
    @Req() request: FastifyRequest,
    @Body(new ZodValidationPipe(CreateBotSchema)) input: CreateBotDto
  ): Promise<{ bot: BotResponse }> {
    // Set owner to current user
    const ownerUserId = request.user?.id;
    const bot = await this.botsService.create(input, ownerUserId);
    this.logger.info("Bot created", {
      botId: bot.id,
      name: bot.name,
      ownerUserId,
    });
    return { bot: this.toBotResponse(bot) };
  }

  /**
   * PUT /api/bots/:id - Update bot (ownership checked)
   */
  @Put(":id")
  @UseGuards(BotOwnershipGuard)
  async updateBot(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(UpdateBotSchema)) input: UpdateBotDto
  ): Promise<{ bot: BotResponse }> {
    try {
      const bot = await this.botsService.update(id, input);
      this.logger.info("Bot updated", { botId: bot.id });
      return { bot: this.toBotResponse(bot) };
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  /**
   * DELETE /api/bots/:id - Delete bot (ownership checked)
   */
  @Delete(":id")
  @UseGuards(BotOwnershipGuard)
  async deleteBot(@Param("id") id: string): Promise<{ success: boolean }> {
    try {
      await this.botsService.delete(id);
      this.logger.info("Bot deleted", { botId: id });
      return { success: true };
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  /**
   * POST /api/bots/:id/enable - Enable bot (ownership checked)
   */
  @Post(":id/enable")
  @UseGuards(BotOwnershipGuard)
  async enableBot(@Param("id") id: string): Promise<{ bot: BotResponse }> {
    try {
      const bot = await this.botsService.enableBot(id);
      this.logger.info("Bot enabled", { botId: bot.id });
      return { bot: this.toBotResponse(bot) };
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  /**
   * POST /api/bots/:id/disable - Disable bot (ownership checked)
   */
  @Post(":id/disable")
  @UseGuards(BotOwnershipGuard)
  async disableBot(@Param("id") id: string): Promise<{ bot: BotResponse }> {
    try {
      const bot = await this.botsService.disableBot(id);
      this.logger.info("Bot disabled", { botId: bot.id });
      return { bot: this.toBotResponse(bot) };
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  private toBotResponse(bot: Bot): BotResponse {
    return {
      id: bot.id,
      name: bot.name,
      startMessage: bot.startMessage,
      errorMessage: bot.errorMessage,
      model: bot.model,
      assistantId: bot.assistantId,
      enabled: bot.enabled,
      isActive: bot.isActive,
      telegramMode: bot.telegramMode,
      error: bot.error,
      ownerUserId: bot.ownerUserId,
    };
  }
}
