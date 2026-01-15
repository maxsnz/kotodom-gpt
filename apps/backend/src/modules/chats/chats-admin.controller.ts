import {
  Controller,
  Get,
  Post,
  Delete,
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
  name: string | null;
  createdAt: string;
  lastResponseId: string | null;
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
   * GET /api/chats/:id/messages - Get messages for a chat with chat data and participants (ownership checked)
   */
  @Get(":id/messages")
  async getChatMessages(
    @Req() request: FastifyRequest,
    @Param("id") id: string
  ): Promise<{
    data: {
      chat: ChatResponse;
      participants: {
        bot: {
          id: string;
          name: string;
          avatarUrl: string | null;
        } | null;
        user: {
          id: string;
          username: string | null;
          firstName: string | null;
        } | null;
      };
      messages: Array<{
        id: number;
        text: string;
        createdAt: string;
        author:
          | { type: "bot"; botId: number }
          | { type: "user"; tgUserId: string };
      }>;
    };
  }> {
    try {
      const chat = await this.chatsService.findById(id);
      if (!chat) {
        throw new NotFoundException(`Chat with id ${id} not found`);
      }

      await this.checkChatOwnership(request, chat);

      const result = await this.chatsService.getChatMessagesWithParticipants(
        id
      );

      return {
        data: {
          chat: this.toChatResponse(result.chat),
          participants: {
            bot: result.bot,
            user: result.user,
          },
          messages: result.messages.map((msg) => ({
            id: msg.id,
            text: msg.text,
            createdAt: msg.createdAt.toISOString(),
            author: msg.author,
          })),
        },
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  /**
   * GET /api/chats/:chatId/messages/:messageId - Get a specific message from a chat (ownership checked)
   */
  @Get(":chatId/messages/:messageId")
  async getChatMessage(
    @Req() request: FastifyRequest,
    @Param("chatId") chatId: string,
    @Param("messageId") messageId: string
  ): Promise<{ data: MessageResponse }> {
    try {
      const messageIdNum = parseInt(messageId, 10);
      if (Number.isNaN(messageIdNum)) {
        throw new BadRequestException("Invalid messageId format");
      }

      const chat = await this.chatsService.findById(chatId);
      if (!chat) {
        throw new NotFoundException(`Chat with id ${chatId} not found`);
      }

      await this.checkChatOwnership(request, chat);

      const message = await this.chatsService.getMessage(chatId, messageIdNum);
      return { data: this.toMessageResponse(message) };
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("not found")) {
          throw new NotFoundException(error.message);
        }
        if (error.message.includes("does not belong to chat")) {
          throw new ForbiddenException(error.message);
        }
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
   * DELETE /api/chats/:id - Delete chat (ownership checked)
   */
  @Delete(":id")
  async deleteChat(
    @Req() request: FastifyRequest,
    @Param("id") id: string
  ): Promise<{ success: boolean }> {
    const chat = await this.chatsService.findById(id);
    if (!chat) {
      throw new NotFoundException(`Chat with id ${id} not found`);
    }

    await this.checkChatOwnership(request, chat);

    await this.chatsService.delete(id);
    this.logger.info("Chat deleted", { chatId: id });
    return { success: true };
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
      name: chat.name,
      createdAt: chat.createdAt.toISOString(),
      lastResponseId: chat.lastResponseId,
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
