import { Injectable, Inject } from "@nestjs/common";

import { MessageProcessingRepository } from "../../domain/message-processing/MessageProcessingRepository";
import { MessageRepository } from "../../domain/chats/MessageRepository";
import { MessageProcessingStatus } from "../../domain/message-processing/MessageProcessing";
import { PgBossClient } from "../../infra/jobs/pgBoss";
import {
  JOBS,
  MessageProcessingTriggerPayload,
} from "../../infra/jobs/pgBoss/jobs";
import {
  AppLogger,
  LOGGER_FACTORY,
  type LoggerFactory,
  createConsoleLoggerFactory,
} from "../../infra/logger";

@Injectable()
export class ProcessingRecoveryService {
  private readonly logger: AppLogger;

  constructor(
    @Inject(MessageProcessingRepository)
    private readonly messageProcessingRepository: MessageProcessingRepository,
    @Inject(MessageRepository)
    private readonly messageRepository: MessageRepository,
    private readonly pgBossClient: PgBossClient,
    @Inject(LOGGER_FACTORY) loggerFactory?: LoggerFactory
  ) {
    const factory = loggerFactory ?? createConsoleLoggerFactory();
    this.logger = factory(ProcessingRecoveryService.name);
  }

  /**
   * Retry multiple failed message processing records
   */
  async retryFailed(
    limit: number = 100
  ): Promise<{ retriedCount: number; messageIds: number[] }> {
    const failed = await this.messageProcessingRepository.findFailed(limit);

    const messageIds: number[] = [];
    let retriedCount = 0;

    for (const processing of failed) {
      try {
        await this.retryByUserMessageId(processing.userMessageId);
        messageIds.push(processing.userMessageId);
        retriedCount++;
      } catch (error) {
        this.logger.error("Error retrying failed message", {
          processingId: processing.id,
          userMessageId: processing.userMessageId,
          error:
            error instanceof Error
              ? { message: error.message, stack: error.stack }
              : error,
        });
      }
    }

    this.logger.info("Retried failed messages", {
      retriedCount,
      totalFailed: failed.length,
    });

    return { retriedCount, messageIds };
  }

  /**
   * Retry specific message processing by ID
   * Publishes minimal payload job - worker will load all data from DB
   */
  async retryById(id: number): Promise<void> {
    const processing = await this.messageProcessingRepository.findById(id);
    if (!processing) {
      throw new Error(`MessageProcessing not found for id: ${id}`);
    }

    // Delegate to retryByUserMessageId which has all the validation logic
    await this.retryByUserMessageId(processing.userMessageId);

    this.logger.info("Retried message processing by ID", {
      id,
      userMessageId: processing.userMessageId,
    });
  }

  /**
   * Retry specific message processing by userMessageId
   * Publishes minimal payload job - worker will load all data from DB
   */
  async retryByUserMessageId(userMessageId: number): Promise<void> {
    // Verify processing exists and is retryable
    // Worker will validate userMessage existence
    const processing =
      await this.messageProcessingRepository.findByUserMessageId(userMessageId);
    if (!processing) {
      throw new Error(
        `MessageProcessing not found for userMessageId: ${userMessageId}`
      );
    }

    if (processing.status === MessageProcessingStatus.TERMINAL) {
      throw new Error(
        `Cannot retry terminal message processing: ${userMessageId}`
      );
    }

    // Publish minimal payload job
    const payload: MessageProcessingTriggerPayload = {
      userMessageId,
    };

    await this.pgBossClient.publish(JOBS.MESSAGE_PROCESSING_TRIGGER, payload, {
      singletonKey: `message-processing:${userMessageId}`,
    });

    this.logger.info("Published retry job for message", {
      userMessageId,
      status: processing.status,
    });
  }
}
