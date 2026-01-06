import {
  Controller,
  Post,
  Get,
  Query,
  Param,
  Inject,
  UseGuards,
  ParseIntPipe,
} from "@nestjs/common";

import { MessageProcessingRepository } from "../../domain/chats/MessageProcessingRepository";
import { ProcessingRecoveryService } from "./processing-recovery.service";
import {
  AppLogger,
  LOGGER_FACTORY,
  type LoggerFactory,
  createConsoleLoggerFactory,
} from "../../infra/logger";
import { SessionAuthGuard } from "../auth/guards/session-auth.guard";

@Controller("admin/message-processing")
@UseGuards(SessionAuthGuard)
export class MessageProcessingAdminController {
  private readonly logger: AppLogger;

  constructor(
    @Inject(MessageProcessingRepository)
    private readonly messageProcessingRepository: MessageProcessingRepository,
    private readonly recoveryService: ProcessingRecoveryService,
    @Inject(LOGGER_FACTORY) loggerFactory?: LoggerFactory
  ) {
    const factory = loggerFactory ?? createConsoleLoggerFactory();
    this.logger = factory(MessageProcessingAdminController.name);
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
   * Retry specific message processing by userMessageId
   */
  @Post("retry/:userMessageId")
  async retryMessage(
    @Param("userMessageId", ParseIntPipe) userMessageId: number
  ): Promise<{ success: boolean }> {
    await this.recoveryService.retryByUserMessageId(userMessageId);

    this.logger.info("Retried message", {
      userMessageId,
    });

    return { success: true };
  }
}

