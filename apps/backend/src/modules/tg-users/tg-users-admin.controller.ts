import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";

import { TgUsersService, UpdateTgUserInput } from "./tg-users.service";
import { TgUser } from "../../domain/tg-users/TgUser";
import { SessionAuthGuard } from "../auth/guards/session-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { ZodValidationPipe } from "../../common/pipes";
import {
  UpdateTgUserSchema,
  type UpdateTgUserDto,
} from "@shared/contracts/tg-users";
import { ChatsService } from "../../domain/chats/ChatsService";
import { Chat } from "../../domain/chats/Chat";

/**
 * TgUser response DTO - converts BigInt id to string
 */
interface TgUserResponse {
  id: string;
  username: string | null;
  name: string | null;
  fullName: string | null;
  createdAt: string;
}

/**
 * Chat response DTO
 */
interface ChatResponse {
  id: string;
  telegramChatId: string;
  botId: number | null;
  tgUserId: string;
  name: string | null;
  createdAt: string;
}

@Controller("api/tg-users")
@UseGuards(SessionAuthGuard, RolesGuard)
@Roles("ADMIN")
export class TgUsersAdminController {
  constructor(
    private readonly tgUsersService: TgUsersService,
    private readonly chatsService: ChatsService
  ) {}

  /**
   * GET /api/tg-users - List all Telegram users
   */
  @Get()
  async listTgUsers(): Promise<{ data: TgUserResponse[] }> {
    const tgUsers = await this.tgUsersService.findAll();
    return { data: tgUsers.map(this.toTgUserResponse) };
  }

  /**
   * GET /api/tg-users/:id - Get Telegram user by ID
   */
  @Get(":id")
  async getTgUser(@Param("id") id: string): Promise<{ data: TgUserResponse }> {
    let tgUserId: bigint;
    try {
      tgUserId = BigInt(id);
    } catch {
      throw new BadRequestException("Invalid TgUser ID format");
    }

    const tgUser = await this.tgUsersService.findById(tgUserId);
    if (!tgUser) {
      throw new NotFoundException(`TgUser with id ${id} not found`);
    }
    return { data: this.toTgUserResponse(tgUser) };
  }

  /**
   * PUT /api/tg-users/:id - Update Telegram user
   */
  @Put(":id")
  async updateTgUser(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(UpdateTgUserSchema)) input: UpdateTgUserDto
  ): Promise<{ data: TgUserResponse }> {
    let tgUserId: bigint;
    try {
      tgUserId = BigInt(id);
    } catch {
      throw new BadRequestException("Invalid TgUser ID format");
    }

    // Check if TgUser exists
    const existingTgUser = await this.tgUsersService.findById(tgUserId);
    if (!existingTgUser) {
      throw new NotFoundException(`TgUser with id ${id} not found`);
    }

    // Update TgUser properties
    const updateData: UpdateTgUserInput = {};
    if (input.username !== undefined) updateData.username = input.username;
    if (input.name !== undefined) updateData.name = input.name;
    if (input.fullName !== undefined) updateData.fullName = input.fullName;

    let tgUser: TgUser;
    if (Object.keys(updateData).length > 0) {
      tgUser = await this.tgUsersService.updateTgUser(tgUserId, updateData);
    } else {
      tgUser = existingTgUser;
    }

    return { data: this.toTgUserResponse(tgUser) };
  }

  /**
   * DELETE /api/tg-users/:id - Delete Telegram user
   */
  @Delete(":id")
  async deleteTgUser(@Param("id") id: string): Promise<{ success: boolean }> {
    let tgUserId: bigint;
    try {
      tgUserId = BigInt(id);
    } catch {
      throw new BadRequestException("Invalid TgUser ID format");
    }

    const tgUser = await this.tgUsersService.findById(tgUserId);
    if (!tgUser) {
      throw new NotFoundException(`TgUser with id ${id} not found`);
    }

    await this.tgUsersService.deleteTgUser(tgUserId);
    return { success: true };
  }

  /**
   * GET /api/tg-users/:id/chats - Get all chats for a Telegram user
   */
  @Get(":id/chats")
  async getTgUserChats(@Param("id") id: string): Promise<{ data: ChatResponse[] }> {
    let tgUserId: bigint;
    try {
      tgUserId = BigInt(id);
    } catch {
      throw new BadRequestException("Invalid TgUser ID format");
    }

    // Check if TgUser exists
    const tgUser = await this.tgUsersService.findById(tgUserId);
    if (!tgUser) {
      throw new NotFoundException(`TgUser with id ${id} not found`);
    }

    // Get chats for this user
    const chats = await this.chatsService.findAll({ userId: tgUserId });
    return { data: chats.map(this.toChatResponse) };
  }

  private toTgUserResponse(tgUser: TgUser): TgUserResponse {
    return {
      id: tgUser.id.toString(),
      username: tgUser.username,
      name: tgUser.name,
      fullName: tgUser.fullName,
      createdAt: tgUser.createdAt.toISOString(),
    };
  }

  private toChatResponse(chat: Chat): ChatResponse {
    return {
      id: chat.id,
      telegramChatId: chat.telegramChatId.toString(),
      botId: chat.botId,
      tgUserId: chat.tgUserId.toString(),
      name: chat.name,
      createdAt: chat.createdAt.toISOString(),
    };
  }
}
