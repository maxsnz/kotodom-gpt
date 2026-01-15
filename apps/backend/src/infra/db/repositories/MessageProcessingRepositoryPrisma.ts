import { MessageProcessingRepository } from "../../../domain/message-processing/MessageProcessingRepository";
import {
  MessageProcessing,
  MessageProcessingStatus,
} from "../../../domain/message-processing/MessageProcessing";
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
    // Use upsert instead of update because the record might not exist yet
    // (e.g., if error occurs before markProcessing is called)
    await prisma.messageProcessing.upsert({
      where: { userMessageId },
      create: {
        userMessageId,
        status: MessageProcessingStatus.FAILED,
        lastError: error,
        lastErrorAt: new Date(),
        attempts: 1,
        price: createDecimal(0),
      },
      update: {
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
    // Use upsert instead of update because the record might not exist yet
    // (e.g., if error occurs before markProcessing is called)
    await prisma.messageProcessing.upsert({
      where: { userMessageId },
      create: {
        userMessageId,
        status: MessageProcessingStatus.TERMINAL,
        terminalReason: reason,
        attempts: 0,
        price: createDecimal(0),
      },
      update: {
        status: MessageProcessingStatus.TERMINAL,
        terminalReason: reason,
      },
    });
  }

  async markResponseGenerated(
    userMessageId: number,
    responseMessageId: number,
    price?: Prisma.Decimal,
    rawResponse?: unknown
  ): Promise<void> {
    const updateData: Prisma.MessageProcessingUncheckedUpdateInput = {
      responseMessageId,
      responseGeneratedAt: new Date(),
    };

    if (price !== undefined) {
      updateData.price = price;
    }

    if (rawResponse !== undefined) {
      updateData.rawResponse = rawResponse as Prisma.InputJsonValue;
    }

    await prisma.messageProcessing.update({
      where: { userMessageId },
      data: updateData,
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
    // Use upsert instead of update because the record might not exist yet
    // (e.g., if called before markProcessing)
    const updateData: Record<string, unknown> = {};
    if (telegramIncomingMessageId !== undefined) {
      updateData.telegramIncomingMessageId = telegramIncomingMessageId;
    }
    if (telegramUpdateId !== undefined) {
      updateData.telegramUpdateId = telegramUpdateId;
    }

    await prisma.messageProcessing.upsert({
      where: { userMessageId },
      create: {
        userMessageId,
        status: MessageProcessingStatus.RECEIVED,
        attempts: 0,
        price: createDecimal(0),
        ...updateData,
      },
      update: updateData,
    });
  }

  async findAll(
    filters?: {
      status?: MessageProcessingStatus | MessageProcessingStatus[];
      userMessageId?: number;
    },
    pagination?: {
      skip?: number;
      take?: number;
    }
  ): Promise<MessageProcessing[]> {
    const where: Record<string, unknown> = {};

    if (filters?.status) {
      if (Array.isArray(filters.status)) {
        // Multiple statuses: use IN operator
        where.status = { in: filters.status };
      } else {
        // Single status
        where.status = filters.status;
      }
    }

    if (filters?.userMessageId) {
      where.userMessageId = filters.userMessageId;
    }

    const rows = await prisma.messageProcessing.findMany({
      where,
      skip: pagination?.skip,
      take: pagination?.take,
      orderBy: {
        createdAt: "desc",
      },
    });

    return rows.map((row) => this.toDomain(row));
  }

  async findById(id: number): Promise<MessageProcessing | null> {
    const row = await prisma.messageProcessing.findUnique({
      where: { id },
    });

    return row ? this.toDomain(row) : null;
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
      rawResponse: row.rawResponse,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
