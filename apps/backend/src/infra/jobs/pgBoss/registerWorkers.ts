import { PgBossClient } from "./index";
import { JOBS, BotHandleUpdatePayload } from "./jobs";

export type RegisterWorkersDeps = {
  boss: PgBossClient;

  /**
   * Application use-case: "process telegram update end-to-end"
   * Put the real implementation in your application layer.
   */
  processBotUpdate: (payload: BotHandleUpdatePayload) => Promise<void>;

  /**
   * Optional logger abstraction.
   * If you don't have one — can be console.
   */
  log?: {
    info: (msg: string, meta?: Record<string, unknown>) => void;
    error: (msg: string, meta?: Record<string, unknown>) => void;
  };

  /** Worker concurrency */
  teamSize?: number;
};

export async function registerWorkers(
  deps: RegisterWorkersDeps
): Promise<void> {
  const { boss, processBotUpdate } = deps;
  const log = deps.log ?? console;
  const teamSize = deps.teamSize ?? Number(process.env.JOBS_CONCURRENCY ?? 5);

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
        // Throwing makes pg-boss mark as failed and apply retry policy
        log.error("Job failed: BOT_HANDLE_UPDATE", {
          ...meta,
          error:
            err instanceof Error
              ? { message: err.message, stack: err.stack }
              : err,
        });
        throw err;
      }
    },
    { teamSize }
  );
}
