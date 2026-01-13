export type Effect =
  | { type: "telegram.ensureWebhook"; botId: string; botToken: string }
  | { type: "telegram.removeWebhook"; botToken: string }
  | { type: "telegram.startPolling"; botId: string; botToken: string }
  | { type: "telegram.stopPolling"; botId: string }
  | {
      type: "jobs.publish";
      name: string;
      payload: unknown;
      options?: {
        singletonKey?: string;
        retryLimit?: number;
        retryBackoff?: boolean | number;
        startAfter?: number | string;
        expireInSeconds?: number;
        priority?: number;
      };
    }
  | {
      type: "notification.adminAlert";
      message: string;
      /** Deduplication key to prevent spam. Only one notification per key within 1 hour */
      dedupeKey?: string;
    };
