import { Injectable, Inject } from "@nestjs/common";

import { PgBossClient } from "./index";
import {
  JOBS,
  BotHandleUpdatePayload,
  MessageProcessingTriggerPayload,
  DEFAULT_RETRY_LIMIT,
} from "./jobs";
import {
  TerminalError,
  ErrorType,
  classifyError,
} from "../../errors/ErrorClassifier";
import { Job } from "pg-boss";
import {
  AppLogger,
  LOGGER_FACTORY,
  type LoggerFactory,
  createConsoleLoggerFactory,
} from "../../logger";

/**
 * Extended Job type that includes retryCount field which may be present
 * in pg-boss job objects but is not in the base Job type definition.
 */
type JobWithRetryCount<T> = Job<T> & { retryCount?: number };

export type RegisterWorkersDeps = {
  boss: PgBossClient;

  /**
   * Application use-case: "process telegram update end-to-end"
   * Put the real implementation in your application layer.
   */
  processBotUpdate: (payload: BotHandleUpdatePayload) => Promise<void>;

  /**
   * Application use-case: "process message by userMessageId (retry/trigger)"
   * Uses minimal payload and loads data from database.
   */
  processMessageTrigger: (
    payload: MessageProcessingTriggerPayload
  ) => Promise<void>;

  /**
   * Optional logger abstraction.
   * If you don't have one — can be console.
   */
  log?: {
    info: (msg: string, meta?: Record<string, unknown>) => void;
    error: (msg: string, meta?: Record<string, unknown>) => void;
  };

  /**
   * Optional callback to notify admin on final job failure.
   * Called with message and optional deduplication key.
   */
  onJobFailed?: (message: string, dedupeKey?: string) => Promise<void>;

  /** Worker concurrency */
  teamSize?: number;
};

/**
 * Service responsible for registering and managing pg-boss workers.
 */
@Injectable()
export class WorkerRegistrationService {
  private readonly logger: AppLogger;

  constructor(
    private readonly pgBossClient: PgBossClient,
    @Inject(LOGGER_FACTORY) loggerFactory?: LoggerFactory
  ) {
    const factory = loggerFactory ?? createConsoleLoggerFactory();
    this.logger = factory(WorkerRegistrationService.name);
  }

  /**
   * Register all workers with pg-boss
   */
  async registerWorkers(deps: RegisterWorkersDeps): Promise<void> {
    const { boss, processBotUpdate, processMessageTrigger, onJobFailed } = deps;
    const log = deps.log ?? console;
    const teamSize = deps.teamSize ?? Number(process.env.JOBS_CONCURRENCY ?? 5);

    // Register bot.handle-update worker (for Telegram updates)
    await boss.register<BotHandleUpdatePayload>(
      JOBS.BOT_HANDLE_UPDATE,
      async (payload, job) => {
        const meta = {
          jobId: job.id,
          name: job.name,
          botId: payload.botId,
          telegramUpdateId: payload.telegramUpdateId,
          chatId: payload.chatId,
          kind: payload.kind,
        };

        log.info("Job start: BOT_HANDLE_UPDATE", meta);

        try {
          await processBotUpdate(payload);
          log.info("Job done: BOT_HANDLE_UPDATE", meta);
        } catch (err) {
          const errorPayload =
            err instanceof Error
              ? { message: err.message, stack: err.stack }
              : err;

          const errorType = classifyError(err);
          const errorMessage =
            err instanceof Error ? err.message : JSON.stringify(err);

          if (err instanceof TerminalError) {
            log.error("Job failed terminal: BOT_HANDLE_UPDATE", {
              ...meta,
              error: errorPayload,
            });

            // Notify admin on terminal failure
            if (onJobFailed) {
              const dedupeKey = `terminal:${payload.botId}:${payload.telegramUpdateId}`;
              await onJobFailed(
                `Terminal failure in job ${job.id}:\nBot: ${payload.botId}\nUpdate: ${payload.telegramUpdateId}\nError: ${errorMessage}`,
                dedupeKey
              );
            }
            return;
          }

          if (errorType === ErrorType.FATAL) {
            log.error("Job failed fatal: BOT_HANDLE_UPDATE", {
              ...meta,
              error: errorPayload,
            });

            // Notify admin on fatal error (no retry will happen)
            if (onJobFailed) {
              const dedupeKey = `fatal:${payload.botId}:${payload.telegramUpdateId}`;
              await onJobFailed(
                `Fatal error in job ${job.id}:\nBot: ${payload.botId}\nUpdate: ${payload.telegramUpdateId}\nError: ${errorMessage}`,
                dedupeKey
              );
            }
            throw err;
          }

          // Retryable error - check if this is the last retry
          const jobWithRetry = job as JobWithRetryCount<BotHandleUpdatePayload>;
          const retryCount = jobWithRetry.retryCount;
          const isLastRetry =
            typeof retryCount === "number" &&
            retryCount >= DEFAULT_RETRY_LIMIT - 1;

          if (isLastRetry && onJobFailed) {
            const dedupeKey = `retries-exhausted:${payload.botId}:${payload.telegramUpdateId}`;
            await onJobFailed(
              `Job ${job.id} failed after ${DEFAULT_RETRY_LIMIT} retries:\nBot: ${payload.botId}\nUpdate: ${payload.telegramUpdateId}\nError: ${errorMessage}`,
              dedupeKey
            );
          }

          // Throwing makes pg-boss mark as failed and apply retry policy
          log.error("Job failed: BOT_HANDLE_UPDATE", {
            ...meta,
            error: errorPayload,
            retryCount,
            isLastRetry,
          });
          throw err;
        }
      },
      { teamSize }
    );

    // Register message-processing.trigger worker (for retries/triggers)
    await boss.register<MessageProcessingTriggerPayload>(
      JOBS.MESSAGE_PROCESSING_TRIGGER,
      async (payload, job) => {
        const meta = {
          jobId: job.id,
          name: job.name,
          userMessageId: payload.userMessageId,
        };

        log.info("Job start: MESSAGE_PROCESSING_TRIGGER", meta);

        try {
          await processMessageTrigger(payload);
          log.info("Job done: MESSAGE_PROCESSING_TRIGGER", meta);
        } catch (err) {
          const errorPayload =
            err instanceof Error
              ? { message: err.message, stack: err.stack }
              : err;

          const errorType = classifyError(err);
          const errorMessage =
            err instanceof Error ? err.message : JSON.stringify(err);

          if (err instanceof TerminalError) {
            log.error("Job failed terminal: MESSAGE_PROCESSING_TRIGGER", {
              ...meta,
              error: errorPayload,
            });

            // Notify admin on terminal failure
            if (onJobFailed) {
              const dedupeKey = `terminal:message-processing:${payload.userMessageId}`;
              await onJobFailed(
                `Terminal failure in job ${job.id}:\nUserMessageId: ${payload.userMessageId}\nError: ${errorMessage}`,
                dedupeKey
              );
            }
            return;
          }

          if (errorType === ErrorType.FATAL) {
            log.error("Job failed fatal: MESSAGE_PROCESSING_TRIGGER", {
              ...meta,
              error: errorPayload,
            });

            // Notify admin on fatal error (no retry will happen)
            if (onJobFailed) {
              const dedupeKey = `fatal:message-processing:${payload.userMessageId}`;
              await onJobFailed(
                `Fatal error in job ${job.id}:\nUserMessageId: ${payload.userMessageId}\nError: ${errorMessage}`,
                dedupeKey
              );
            }
            throw err;
          }

          // Retryable error - check if this is the last retry
          const jobWithRetry =
            job as JobWithRetryCount<MessageProcessingTriggerPayload>;
          const retryCount = jobWithRetry.retryCount;
          const isLastRetry =
            typeof retryCount === "number" &&
            retryCount >= DEFAULT_RETRY_LIMIT - 1;

          if (isLastRetry && onJobFailed) {
            const dedupeKey = `retries-exhausted:message-processing:${payload.userMessageId}`;
            await onJobFailed(
              `Job ${job.id} failed after ${DEFAULT_RETRY_LIMIT} retries:\nUserMessageId: ${payload.userMessageId}\nError: ${errorMessage}`,
              dedupeKey
            );
          }

          // Throwing makes pg-boss mark as failed and apply retry policy
          log.error("Job failed: MESSAGE_PROCESSING_TRIGGER", {
            ...meta,
            error: errorPayload,
            retryCount,
            isLastRetry,
          });
          throw err;
        }
      },
      { teamSize }
    );

    this.logger.info("Workers registered successfully", { teamSize });
  }
}

