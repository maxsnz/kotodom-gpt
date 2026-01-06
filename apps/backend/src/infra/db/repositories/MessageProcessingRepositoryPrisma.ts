import { MessageProcessingRepository } from "../../../domain/chats/MessageProcessingRepository";
import {
  MessageProcessing,
  MessageProcessingStatus,
} from "../../../domain/chats/MessageProcessing";
import type {
  Prisma,
  MessageProcessing as PrismaMessageProcessing,
} from "../prisma/generated/client";
import { prisma } from "../prisma/client";
import { createDecimal } from "../prisma/decimal";
import type * as runtime from "@prisma/client/runtime/client";

export class MessageProcessingRepositoryPrisma extends MessageProcessingRepository {
  async getOrCreateForUserMessage(
    userMessageId: number
  ): Promise<MessageProcessing> {
    const existing = await prisma.messageProcessing.findUnique({
      where: { userMessageId },
    });

    if (existing) {
      return this.toDomain(existing);
    }

    const created = await prisma.messageProcessing.create({
      data: {
        userMessageId,
        status: MessageProcessingStatus.RECEIVED,
        attempts: 0,
        price: createDecimal(0),
      },
    });

    return this.toDomain(created);
  }

  async markProcessing(userMessageId: number): Promise<void> {
    await prisma.messageProcessing.update({
      where: { userMessageId },
      data: {
        status: MessageProcessingStatus.PROCESSING,
        attempts: {
          increment: 1,
        },
      },
    });
  }

  async markFailed(userMessageId: number, error: string): Promise<void> {
    await prisma.messageProcessing.update({
      where: { userMessageId },
      data: {
        status: MessageProcessingStatus.FAILED,
        lastError: error,
        lastErrorAt: new Date(),
        attempts: {
          increment: 1,
        },
      },
    });
  }

  async markTerminal(userMessageId: number, reason: string): Promise<void> {
    await prisma.messageProcessing.update({
      where: { userMessageId },
      data: {
        status: MessageProcessingStatus.TERMINAL,
        terminalReason: reason,
      },
    });
  }

  async markResponseGenerated(
    userMessageId: number,
    responseMessageId: number,
    price?: Prisma.Decimal
  ): Promise<void> {
    await prisma.messageProcessing.update({
      where: { userMessageId },
      data: {
        responseMessageId,
        responseGeneratedAt: new Date(),
        ...(price !== undefined && { price }),
      },
    });
  }

  async markResponseSent(
    userMessageId: number,
    telegramOutgoingMessageId?: number
  ): Promise<void> {
    await prisma.messageProcessing.update({
      where: { userMessageId },
      data: {
        telegramOutgoingMessageId,
        responseSentAt: new Date(),
      },
    });
  }

  async markCompleted(userMessageId: number): Promise<void> {
    await prisma.messageProcessing.update({
      where: { userMessageId },
      data: {
        status: MessageProcessingStatus.COMPLETED,
      },
    });
  }

  async findByUserMessageId(
    userMessageId: number
  ): Promise<MessageProcessing | null> {
    const row = await prisma.messageProcessing.findUnique({
      where: { userMessageId },
    });

    return row ? this.toDomain(row) : null;
  }

  async findFailed(limit: number = 100): Promise<MessageProcessing[]> {
    const rows = await prisma.messageProcessing.findMany({
      where: {
        status: MessageProcessingStatus.FAILED,
      },
      take: limit,
      orderBy: {
        lastErrorAt: "desc",
      },
    });

    return rows.map((row) => this.toDomain(row));
  }

  async updateTelegramIds(
    userMessageId: number,
    telegramIncomingMessageId?: number,
    telegramUpdateId?: bigint
  ): Promise<void> {
    await prisma.messageProcessing.update({
      where: { userMessageId },
      data: {
        ...(telegramIncomingMessageId !== undefined && {
          telegramIncomingMessageId,
        }),
        ...(telegramUpdateId !== undefined && { telegramUpdateId }),
      },
    });
  }

  private toDomain(row: PrismaMessageProcessing): MessageProcessing {
    return new MessageProcessing({
      id: row.id,
      userMessageId: row.userMessageId,
      status: row.status as MessageProcessingStatus,
      attempts: row.attempts,
      lastError: row.lastError,
      lastErrorAt: row.lastErrorAt,
      terminalReason: row.terminalReason,
      responseMessageId: row.responseMessageId,
      telegramIncomingMessageId: row.telegramIncomingMessageId,
      telegramOutgoingMessageId: row.telegramOutgoingMessageId,
      telegramUpdateId: row.telegramUpdateId,
      responseGeneratedAt: row.responseGeneratedAt,
      responseSentAt: row.responseSentAt,
      price: row.price,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
