import { Injectable } from "@nestjs/common";
import { PgBoss, Job, WorkHandler } from "pg-boss";

import { env } from "../../../config/env";

export type PgBossConfig = {
  connectionString: string;
  schema?: string; // optional: separate schema for jobs, e.g. "pgboss"
  applicationName?: string;
};

export type PublishOptions = {
  // pg-boss options are richer; start minimal, extend as needed
  priority?: number; // 0..?
  startAfterMs?: number; // delay
  retryLimit?: number;
  retryDelayMs?: number;
  expireInSeconds?: number;
  singletonKey?: string; // for idempotency
};

export type JobHandler<TPayload> = (
  payload: TPayload,
  job: Job<TPayload>
) => Promise<void>;

@Injectable()
export class PgBossClient {
  private boss: PgBoss;
  private _started = false;

  constructor() {
    const config: PgBossConfig = {
      connectionString: env.DATABASE_URL,
      schema: "pgboss", // optional: separate schema for jobs
      applicationName: "kotodom-gpt-backend",
    };
    this.boss = new PgBoss({
      connectionString: config.connectionString,
      schema: config.schema,
      application_name: config.applicationName,
    });
  }

  async start(): Promise<void> {
    await this.boss.start();
    this._started = true;
  }

  async stop(): Promise<void> {
    await this.boss.stop();
    this._started = false;
  }

  /**
   * Check if PgBoss is ready (started and connected)
   */
  isReady(): boolean {
    return this._started;
  }

  /**
   * Create a queue if it doesn't exist
   */
  async createQueue(name: string): Promise<void> {
    await this.boss.createQueue(name);
  }

  /**
   * Enqueue a job
   */
  async publish<TPayload extends object>(
    name: string,
    payload: TPayload,
    opts: PublishOptions = {}
  ): Promise<string> {
    // Ensure pg-boss is started - auto-start if not started
    // This handles cases where different DI instances might have different _started flags
    if (!this._started) {
      try {
        await this.start();
      } catch (error) {
        // If start fails, check if it's already started (race condition)
        // pg-boss throws error if already started, but we can ignore it
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        if (!errorMessage.includes("already started") && !errorMessage.includes("already running")) {
          throw new Error(
            `pg-boss: cannot publish job "${name}" - failed to start pg-boss: ${errorMessage}`
          );
        }
        // If already started, update our flag
        this._started = true;
      }
    }

    // Ensure queue exists before publishing
    // This handles race conditions where polling starts before workers are registered
    try {
      await this.createQueue(name);
    } catch (error) {
      // Queue might already exist, which is fine
      // Only log if it's not a "queue already exists" type error
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (!errorMessage.includes("already exists")) {
        console.warn(
          `Failed to ensure queue ${name} exists before publishing`,
          { error: errorMessage }
        );
      }
    }

    // Build options object, only including defined values
    // pg-boss validates that priority is an integer if provided, so we must not pass undefined
    const sendOptions: Record<string, unknown> = {};

    if (typeof opts.priority === "number") {
      sendOptions.priority = opts.priority;
    }

    if (typeof opts.startAfterMs === "number") {
      sendOptions.startAfter = `${opts.startAfterMs}ms`;
    }

    if (typeof opts.retryLimit === "number") {
      sendOptions.retryLimit = opts.retryLimit;
    }

    if (typeof opts.retryDelayMs === "number") {
      sendOptions.retryDelay = opts.retryDelayMs;
    }

    if (typeof opts.expireInSeconds === "number") {
      sendOptions.expireInSeconds = opts.expireInSeconds;
    }

    if (opts.singletonKey) {
      sendOptions.singletonKey = opts.singletonKey;
    }

    try {
      const jobId = await this.boss.send(name, payload, sendOptions);

      if (!jobId)
        throw new Error(`pg-boss: failed to publish job "${name}"`);
      return jobId;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      
      // If pg-boss is not started, try to start it and retry
      if (
        errorMessage.includes("not started") ||
        errorMessage.includes("Queue cache is not initialized")
      ) {
        // Try to start if not started
        if (!this._started) {
          try {
            await this.start();
          } catch (startError) {
            const startErrorMessage =
              startError instanceof Error ? startError.message : String(startError);
            // Ignore "already started" errors
            if (
              !startErrorMessage.includes("already started") &&
              !startErrorMessage.includes("already running")
            ) {
              throw new Error(
                `pg-boss: cannot publish job "${name}" - failed to start: ${startErrorMessage}`
              );
            }
            this._started = true;
          }
        }

        // Ensure queue exists
        try {
          await this.createQueue(name);
        } catch (queueError) {
          // Queue might already exist, ignore
        }

        // Retry once
        const jobId = await this.boss.send(name, payload, sendOptions);
        if (!jobId)
          throw new Error(`pg-boss: failed to publish job "${name}" after retry`);
        return jobId;
      }
      
      throw error;
    }
  }

  /**
   * Register a worker for a job name
   */
  async register<TPayload extends object>(
    name: string,
    handler: JobHandler<TPayload>,
    options?: { teamSize?: number; newJobCheckIntervalMs?: number }
  ): Promise<void> {
    // pg-boss v12 WorkHandler receives array of jobs
    const wrapped: WorkHandler<TPayload> = async (jobs: Job<TPayload>[]) => {
      // Process each job in the batch
      for (const job of jobs) {
        await handler(job.data, job);
      }
    };

    // pg-boss v12 work method signature: work(name, options, handler)
    await this.boss.work<TPayload>(
      name,
      {
        teamSize: options?.teamSize ?? 1,
        newJobCheckInterval: options?.newJobCheckIntervalMs,
      } as any, // WorkOptions type may vary by version
      wrapped
    );
  }
}
