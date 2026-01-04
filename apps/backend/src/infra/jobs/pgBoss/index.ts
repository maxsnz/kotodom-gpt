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
  }

  async stop(): Promise<void> {
    await this.boss.stop();
  }

  /**
   * Enqueue a job
   */
  async publish<TPayload extends object>(
    name: string,
    payload: TPayload,
    opts: PublishOptions = {}
  ): Promise<string> {
    const jobId = await this.boss.send(name, payload, {
      priority: opts.priority,
      startAfter:
        typeof opts.startAfterMs === "number"
          ? `${opts.startAfterMs}ms`
          : undefined,
      retryLimit: opts.retryLimit,
      retryDelay:
        typeof opts.retryDelayMs === "number" ? opts.retryDelayMs : undefined,
      expireInSeconds: opts.expireInSeconds,
      singletonKey: opts.singletonKey, // for idempotency
    });

    if (!jobId) throw new Error(`pg-boss: failed to publish job "${name}"`);
    return jobId;
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
