export const JOBS = {
  BOT_HANDLE_UPDATE: "bot.handle-update",
} as const;

export type JobName = (typeof JOBS)[keyof typeof JOBS];

/**
 * Payload for end-to-end processing of a Telegram update.
 * Keep it serializable (JSON) because it's stored in Postgres.
 */
export type BotHandleUpdatePayload = {
  /** Internal bot id in your system */
  botId: string;

  /** Telegram update ID */
  telegramUpdateId: number;

  /** Chat ID from the update */
  chatId: number;

  /** User ID (optional, may not be present in some update types) */
  userId?: number;

  /** Message ID (optional, may not be present in some update types) */
  messageId?: number;

  /** Message text (optional, only for message/edited_message) */
  text?: string;

  /** Callback data (optional, only for callback_query) */
  callbackData?: string;

  /** Type of update */
  kind: "message" | "edited_message" | "callback_query";

  /** Raw Telegram update object for debugging/future features */
  raw: unknown;
};
