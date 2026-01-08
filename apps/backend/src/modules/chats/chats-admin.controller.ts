import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  Inject,
  Req,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  UseGuards,
} from "@nestjs/common";
import type { FastifyRequest } from "fastify";

import { ChatsService } from "../../domain/chats/ChatsService";
import { Chat } from "../../domain/chats/Chat";
import { Message } from "../../domain/chats/Message";
import {
  AppLogger,
  LOGGER_FACTORY,
  type LoggerFactory,
  createConsoleLoggerFactory,
} from "../../infra/logger";
import { SessionAuthGuard } from "../auth/guards/session-auth.guard";
import { BotRepository } from "../../domain/bots/BotRepository";
import { BotPolicy } from "../../domain/bots/BotPolicy";

/**
 * Chat response DTO
 */
type ChatResponse = {
  id: string;
  telegramChatId: string;
  botId: number | null;
  tgUserId: string;
  threadId: string | null;
  name: string | null;
  createdAt: string;
};

/**
 * Message response DTO
 */
type MessageResponse = {
  id: number;
  chatId: string | null;
  tgUserId: string | null;
  botId: number | null;
  text: string;
  userMessageId: number | null;
  createdAt: string;
};

type SendMessageInput = {
  text: string;
};

@Controller("api/chats")
@UseGuards(SessionAuthGuard)
export class ChatsAdminController {
  private readonly logger: AppLogger;

  constructor(
    private readonly chatsService: ChatsService,
    @Inject(BotRepository)
    private readonly botRepository: BotRepository,
    @Inject(LOGGER_FACTORY) loggerFactory?: LoggerFactory
  ) {
    const factory = loggerFactory ?? createConsoleLoggerFactory();
    this.logger = factory(ChatsAdminController.name);
  }

  /**
   * GET /api/chats - List chats (filtered by bot ownership for USER role)
   */
  @Get()
  async listChats(
    @Req() request: FastifyRequest,
    @Query("userId") userId?: string,
    @Query("botId") botId?: string
  ): Promise<{ data: ChatResponse[] }> {
    const filters: {
      userId?: bigint;
      botId?: number;
      botOwnerUserId?: string;
    } = {};

    if (userId) {
      try {
        filters.userId = BigInt(userId);
      } catch {
        throw new BadRequestException("Invalid userId format");
      }
    }

    if (botId) {
      const botIdNum = parseInt(botId, 10);
      if (Number.isNaN(botIdNum)) {
        throw new BadRequestException("Invalid botId format");
      }
      filters.botId = botIdNum;
    }

    // Apply user-based filtering for non-admin users
    const user = request.user;
    if (user && user.role !== "ADMIN" && user.role !== "MANAGER") {
      filters.botOwnerUserId = user.id;
    }

    const chats = await this.chatsService.findAll(
      Object.keys(filters).length > 0 ? filters : undefined
    );
    return { data: chats.map(this.toChatResponse) };
  }

  /**
   * GET /api/chats/:id - Get chat by ID (ownership checked via bot)
   */
  @Get(":id")
  async getChat(
    @Req() request: FastifyRequest,
    @Param("id") id: string
  ): Promise<{ data: ChatResponse }> {
    const chat = await this.chatsService.findById(id);
    if (!chat) {
      throw new NotFoundException(`Chat with id ${id} not found`);
    }

    await this.checkChatOwnership(request, chat);

    return { data: this.toChatResponse(chat) };
  }

  /**
   * GET /api/chats/:id/messages - Get messages for a chat (ownership checked)
   */
  @Get(":id/messages")
  async getChatMessages(
    @Req() request: FastifyRequest,
    @Param("id") id: string
  ): Promise<{ data: MessageResponse[] }> {
    try {
      const chat = await this.chatsService.findById(id);
      if (!chat) {
        throw new NotFoundException(`Chat with id ${id} not found`);
      }

      await this.checkChatOwnership(request, chat);

      const messages = await this.chatsService.getMessages(id);
      return { data: messages.map(this.toMessageResponse) };
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  /**
   * POST /api/chats/:id/messages - Send admin message to chat (ownership checked)
   */
  @Post(":id/messages")
  async sendMessage(
    @Req() request: FastifyRequest,
    @Param("id") id: string,
    @Body() input: SendMessageInput
  ): Promise<{ message: MessageResponse; telegramMessageId: number }> {
    try {
      const chat = await this.chatsService.findById(id);
      if (!chat) {
        throw new NotFoundException(`Chat with id ${id} not found`);
      }

      await this.checkChatOwnership(request, chat);

      const result = await this.chatsService.sendAdminMessage(id, input.text);
      this.logger.info("Admin message sent", {
        chatId: id,
        telegramMessageId: result.telegramMessageId,
      });
      return {
        message: this.toMessageResponse(result.message),
        telegramMessageId: result.telegramMessageId,
      };
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("not found")) {
          throw new NotFoundException(error.message);
        }
        if (error.message.includes("is required")) {
          throw new BadRequestException(error.message);
        }
      }
      throw error;
    }
  }

  /**
   * Check if user has access to a chat via bot ownership
   */
  private async checkChatOwnership(
    request: FastifyRequest,
    chat: Chat
  ): Promise<void> {
    const user = request.user;
    if (!user) {
      throw new ForbiddenException("User not authenticated");
    }

    // ADMIN and MANAGER have full access
    if (user.role === "ADMIN" || user.role === "MANAGER") {
      return;
    }

    // Check bot ownership
    if (!chat.botId) {
      throw new ForbiddenException("Chat has no associated bot");
    }

    const bot = await this.botRepository.findById(String(chat.botId));
    if (!bot) {
      throw new NotFoundException(`Bot not found: ${chat.botId}`);
    }

    if (!BotPolicy.canManage(user, bot)) {
      throw new ForbiddenException(
        "You do not have permission to access this chat"
      );
    }
  }

  private toChatResponse(chat: Chat): ChatResponse {
    return {
      id: chat.id,
      telegramChatId: chat.telegramChatId.toString(),
      botId: chat.botId,
      tgUserId: chat.tgUserId.toString(),
      threadId: chat.threadId,
      name: chat.name,
      createdAt: chat.createdAt.toISOString(),
    };
  }

  private toMessageResponse(message: Message): MessageResponse {
    return {
      id: message.id,
      chatId: message.chatId,
      tgUserId: message.tgUserId?.toString() ?? null,
      botId: message.botId,
      text: message.text,
      userMessageId: message.userMessageId,
      createdAt: message.createdAt.toISOString(),
    };
  }
}
