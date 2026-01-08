import {
  Controller,
  Post,
  Get,
  Query,
  Param,
  Inject,
  UseGuards,
  ParseIntPipe,
  NotFoundException,
} from "@nestjs/common";

import { MessageProcessingRepository } from "../../domain/message-processing/MessageProcessingRepository";
import {
  MessageProcessing,
  MessageProcessingStatus,
} from "../../domain/message-processing/MessageProcessing";
import { MessageProcessingService } from "./message-processing.service";
import { ProcessingRecoveryService } from "./processing-recovery.service";
import {
  AppLogger,
  LOGGER_FACTORY,
  type LoggerFactory,
  createConsoleLoggerFactory,
} from "../../infra/logger";
import { SessionAuthGuard } from "../auth/guards/session-auth.guard";
import { ZodQueryValidationPipe } from "../../common/pipes";
import {
  MessageProcessingQuerySchema,
  type MessageProcessingQueryDto,
  type MessageProcessingResponse,
} from "@shared/contracts/messageProcessing";

@Controller("api/message-processing")
@UseGuards(SessionAuthGuard)
export class MessageProcessingAdminController {
  private readonly logger: AppLogger;

  constructor(
    @Inject(MessageProcessingRepository)
    private readonly messageProcessingRepository: MessageProcessingRepository,
    private readonly messageProcessingService: MessageProcessingService,
    private readonly recoveryService: ProcessingRecoveryService,
    @Inject(LOGGER_FACTORY) loggerFactory?: LoggerFactory
  ) {
    const factory = loggerFactory ?? createConsoleLoggerFactory();
    this.logger = factory(MessageProcessingAdminController.name);
  }

  /**
   * GET /api/message-processing - List all message processing records
   */
  @Get()
  async listMessageProcessing(
    @Query(new ZodQueryValidationPipe(MessageProcessingQuerySchema))
    query: MessageProcessingQueryDto
  ): Promise<{ data: MessageProcessingResponse[] }> {
    // Separate filters and pagination from query
    const { status, userMessageId, page, limit } = query;

    const filters = this.mapFiltersToDomain({ status, userMessageId });
    const pagination = { page, limit };

    const records = await this.messageProcessingService.findAll(
      filters,
      pagination
    );
    return {
      data: records.map(this.toMessageProcessingResponse),
    };
  }

  /**
   * POST /api/message-processing/:id/retry - Retry message processing by ID
   */
  @Post(":id/retry")
  async retryMessageProcessingById(
    @Param("id", ParseIntPipe) id: number
  ): Promise<{ success: boolean }> {
    try {
      await this.recoveryService.retryById(id);

      this.logger.info("Retried message processing by ID", {
        id,
      });

      return { success: true };
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  /**
   * GET /api/message-processing/:id - Get message processing record by ID
   */
  @Get(":id")
  async getMessageProcessing(
    @Param("id", ParseIntPipe) id: number
  ): Promise<{ data: MessageProcessingResponse }> {
    const record = await this.messageProcessingService.findById(id);
    if (!record) {
      throw new NotFoundException(`MessageProcessing with id ${id} not found`);
    }
    return {
      data: this.toMessageProcessingResponse(record),
    };
  }

  /**
   * Get failed message processing records
   */
  @Get("failed")
  async getFailedMessages(@Query("limit") limit?: string): Promise<{
    messages: Array<{
      id: number;
      userMessageId: number;
      status: string;
      lastError: string | null;
      lastErrorAt: Date | null;
      attempts: number;
      createdAt: Date;
    }>;
  }> {
    const failed = await this.messageProcessingRepository.findFailed(
      limit ? parseInt(limit, 10) : 100
    );

    return {
      messages: failed.map((mp) => ({
        id: mp.id,
        userMessageId: mp.userMessageId,
        status: mp.status,
        lastError: mp.lastError,
        lastErrorAt: mp.lastErrorAt,
        attempts: mp.attempts,
        createdAt: mp.createdAt,
      })),
    };
  }

  /**
   * Retry multiple failed message processing records
   */
  @Post("retry-failed")
  async retryFailedMessages(@Query("limit") limit?: string): Promise<{
    retriedCount: number;
    messageIds: number[];
  }> {
    const result = await this.recoveryService.retryFailed(
      limit ? parseInt(limit, 10) : 100
    );

    this.logger.info("Retried failed messages", {
      retriedCount: result.retriedCount,
    });

    return result;
  }

  /**
   * Maps shared contract DTO filters to domain types
   * Properly converts enum values without type assertion
   * Since Zod already validated the status value, we can safely cast it
   */
  private mapFiltersToDomain(filters: {
    status?: string;
    userMessageId?: number;
  }): {
    status?: MessageProcessingStatus;
    userMessageId?: number;
  } {
    const domainFilters: {
      status?: MessageProcessingStatus;
      userMessageId?: number;
    } = {};

    if (filters.status) {
      // Zod validation ensures this is a valid MessageProcessingStatus value
      // We verify it's one of the enum values for type safety
      const validStatuses = Object.values(MessageProcessingStatus) as string[];
      if (validStatuses.includes(filters.status)) {
        domainFilters.status = filters.status as MessageProcessingStatus;
      }
    }

    if (filters.userMessageId !== undefined) {
      domainFilters.userMessageId = filters.userMessageId;
    }

    return domainFilters;
  }

  /**
   * Maps domain MessageProcessing to response DTO
   */
  private toMessageProcessingResponse(
    record: MessageProcessing
  ): MessageProcessingResponse {
    return {
      id: record.id,
      userMessageId: record.userMessageId,
      status: record.status,
      attempts: record.attempts,
      lastError: record.lastError,
      lastErrorAt: record.lastErrorAt?.toISOString() ?? null,
      terminalReason: record.terminalReason,
      responseMessageId: record.responseMessageId,
      telegramIncomingMessageId: record.telegramIncomingMessageId,
      telegramOutgoingMessageId: record.telegramOutgoingMessageId,
      telegramUpdateId: record.telegramUpdateId?.toString() ?? null,
      responseGeneratedAt: record.responseGeneratedAt?.toISOString() ?? null,
      responseSentAt: record.responseSentAt?.toISOString() ?? null,
      price: record.price.toString(),
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    };
  }
}
