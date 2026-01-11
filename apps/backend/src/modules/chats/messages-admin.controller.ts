import {
  Controller,
  Get,
  Delete,
  Param,
  UseGuards,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";

import { MessageRepository } from "../../domain/chats/MessageRepository";
import { Message } from "../../domain/chats/Message";
import { SessionAuthGuard } from "../auth/guards/session-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";

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

@Controller("api/messages")
@UseGuards(SessionAuthGuard, RolesGuard)
@Roles("ADMIN")
export class MessagesAdminController {
  constructor(private readonly messageRepository: MessageRepository) {}

  /**
   * GET /api/messages - List all messages
   */
  @Get()
  async listMessages(): Promise<{ data: MessageResponse[] }> {
    const messages = await this.messageRepository.findAll();
    return { data: messages.map(this.toMessageResponse) };
  }

  /**
   * GET /api/messages/:id - Get message by ID
   */
  @Get(":id")
  async getMessage(
    @Param("id") id: string
  ): Promise<{ data: MessageResponse }> {
    const messageId = parseInt(id, 10);
    if (Number.isNaN(messageId)) {
      throw new BadRequestException("Invalid message ID format");
    }

    const message = await this.messageRepository.findById(messageId);
    if (!message) {
      throw new NotFoundException(`Message with id ${id} not found`);
    }

    return { data: this.toMessageResponse(message) };
  }

  /**
   * DELETE /api/messages/:id - Delete message
   */
  @Delete(":id")
  async deleteMessage(@Param("id") id: string): Promise<{ success: boolean }> {
    const messageId = parseInt(id, 10);
    if (Number.isNaN(messageId)) {
      throw new BadRequestException("Invalid message ID format");
    }

    const message = await this.messageRepository.findById(messageId);
    if (!message) {
      throw new NotFoundException(`Message with id ${id} not found`);
    }

    await this.messageRepository.delete(messageId);
    return { success: true };
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
