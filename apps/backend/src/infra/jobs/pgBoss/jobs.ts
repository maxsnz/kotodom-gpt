export const JOBS = {
  BOT_HANDLE_UPDATE: "bot.handle-update",
  MESSAGE_PROCESSING_TRIGGER: "message-processing.trigger",
} as const;

export type JobName = (typeof JOBS)[keyof typeof JOBS];

/** Default retry limit for jobs */
export const DEFAULT_RETRY_LIMIT = 5;

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

  /** Callback query ID (optional, only for callback_query, needed for answerCallbackQuery) */
  callbackQueryId?: string;

  /** Type of update */
  kind: "message" | "edited_message" | "callback_query";

  /** Raw Telegram update object for debugging/future features */
  raw: unknown;
};

/**
 * Minimal payload for triggering message processing retry.
 * Worker will load all necessary data from database using userMessageId.
 */
export type MessageProcessingTriggerPayload = {
  /** User message ID - unique identifier to load message and processing state from DB */
  userMessageId: number;
};
