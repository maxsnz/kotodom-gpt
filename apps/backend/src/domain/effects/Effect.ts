export type Effect =
  | { type: "telegram.ensureWebhook"; botId: string }
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
    };
