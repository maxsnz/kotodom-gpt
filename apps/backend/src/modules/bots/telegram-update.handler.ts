import { Inject, Injectable } from "@nestjs/common";

import { BotRepository } from "../../domain/bots/BotRepository";
import { PgBossClient } from "../../infra/jobs/pgBoss";
import {
  JOBS,
  BotHandleUpdatePayload,
  DEFAULT_RETRY_LIMIT,
} from "../../infra/jobs/pgBoss/jobs";
import {
  AppLogger,
  LOGGER_FACTORY,
  type LoggerFactory,
  createConsoleLoggerFactory,
} from "../../infra/logger";

// ===== Telegram update types (MVP minimal) =====
type TgUser = {
  id: number;
  is_bot?: boolean;
  username?: string;
  first_name?: string;
  last_name?: string;
};

type TgChat = {
  id: number;
  type: "private" | "group" | "supergroup" | "channel";
  title?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
};

type TgMessage = {
  message_id: number;
  date: number;
  chat: TgChat;
  from?: TgUser;
  text?: string;
};

type TgCallbackQuery = {
  id: string;
  from: TgUser;
  message?: TgMessage;
  data?: string;
};

type TgUpdate = {
  update_id: number;
  message?: TgMessage;
  edited_message?: TgMessage;
  callback_query?: TgCallbackQuery;
};

type IncomingKind = "message" | "edited_message" | "callback_query";

@Injectable()
export class TelegramUpdateHandler {
  private readonly logger: AppLogger;

  constructor(
    private readonly botRepo: BotRepository,
    private readonly boss: PgBossClient,
    @Inject(LOGGER_FACTORY) loggerFactory?: LoggerFactory
  ) {
    const factory = loggerFactory ?? createConsoleLoggerFactory();
    this.logger = factory(TelegramUpdateHandler.name);
  }

  /**
   * Called by:
   * - bots-webhook.controller.ts (prod webhooks)
   * - optional local polling script/runner (dev)
   */
  async handle(botId: string, update: unknown): Promise<void> {
    // 1) Load bot & basic guards
    const bot = await this.botRepo.findById(botId);
    if (!bot) {
      this.logger.warn(`Bot not found: botId=${botId}`);
      return;
    }
    if (!bot.enabled) {
      return;
    }

    // 2) Parse update (MVP)
    const parsed = this.parseUpdate(update);
    if (!parsed) {
      // Тип апдейта пока не поддерживаем
      return;
    }

    // 3) Build job payload
    // FIXME: Safely serialize raw update to prevent ERR_ASSERTION errors
    // pg-boss requires JSON-serializable payload, but raw update may contain
    // non-serializable data (functions, circular refs, etc.)
    let safeRaw: unknown;
    try {
      safeRaw = JSON.parse(JSON.stringify(update));
    } catch (error) {
      this.logger.warn(
        `Failed to serialize raw update for bot ${botId}, using fallback`,
        {
          error:
            error instanceof Error
              ? { message: error.message, stack: error.stack }
              : error,
          telegramUpdateId: parsed.telegramUpdateId,
        }
      );
      // Fallback: minimal serializable object
      safeRaw = { update_id: parsed.telegramUpdateId };
    }

    const payload: BotHandleUpdatePayload = {
      botId,
      telegramUpdateId: parsed.telegramUpdateId,
      chatId: parsed.chatId,
      userId: parsed.userId,
      messageId: parsed.messageId,
      text: parsed.text,
      callbackData: parsed.callbackData,
      callbackQueryId: parsed.callbackQueryId,
      kind: parsed.kind,
      raw: safeRaw,
    };

    // 4) Enqueue async processing (OpenAI + DB writes, etc.)
    try {
      await this.boss.publish(JOBS.BOT_HANDLE_UPDATE, payload, {
        singletonKey: `${botId}:${parsed.telegramUpdateId}`,
        retryLimit: DEFAULT_RETRY_LIMIT,
      });
    } catch (error) {
      this.logger.error(
        `Failed to publish job for bot ${botId}, update ${parsed.telegramUpdateId}`,
        {
          error:
            error instanceof Error
              ? {
                  message: error.message,
                  stack: error.stack,
                  name: error.name,
                }
              : error,
          payload: {
            botId: payload.botId,
            telegramUpdateId: payload.telegramUpdateId,
            chatId: payload.chatId,
            kind: payload.kind,
          },
        }
      );
      throw error;
    }
  }

  private parseUpdate(update: unknown): null | {
    telegramUpdateId: number;
    kind: IncomingKind;
    chatId: number;
    userId?: number;
    messageId?: number;
    text?: string;
    callbackData?: string;
    callbackQueryId?: string;
  } {
    if (!this.isObject(update)) return null;

    const u = update as Partial<TgUpdate>;

    if (typeof u.update_id !== "number") return null;

    // message
    if (u.message && this.isMessage(u.message)) {
      return {
        telegramUpdateId: u.update_id,
        kind: "message",
        chatId: u.message.chat.id,
        userId: u.message.from?.id,
        messageId: u.message.message_id,
        text: u.message.text,
      };
    }

    // edited_message
    if (u.edited_message && this.isMessage(u.edited_message)) {
      return {
        telegramUpdateId: u.update_id,
        kind: "edited_message",
        chatId: u.edited_message.chat.id,
        userId: u.edited_message.from?.id,
        messageId: u.edited_message.message_id,
        text: u.edited_message.text,
      };
    }

    // callback_query
    if (u.callback_query && this.isCallbackQuery(u.callback_query)) {
      const msg = u.callback_query.message;
      return {
        telegramUpdateId: u.update_id,
        kind: "callback_query",
        chatId: msg?.chat.id ?? 0, // 0 means "unknown" (rare). You can choose to drop if no message/chat.
        userId: u.callback_query.from.id,
        messageId: msg?.message_id,
        callbackData: u.callback_query.data,
        callbackQueryId: u.callback_query.id,
      };
    }

    return null;
  }

  private isMessage(x: unknown): x is TgMessage {
    if (!this.isObject(x)) return false;
    const m = x as Partial<TgMessage>;
    return (
      typeof m.message_id === "number" &&
      typeof m.date === "number" &&
      this.isObject(m.chat) &&
      typeof (m.chat as any).id === "number"
    );
  }

  private isCallbackQuery(x: unknown): x is TgCallbackQuery {
    if (!this.isObject(x)) return false;
    const q = x as Partial<TgCallbackQuery>;
    return (
      typeof q.id === "string" &&
      this.isObject(q.from) &&
      typeof (q.from as any).id === "number"
    );
  }

  private isObject(x: unknown): x is Record<string, unknown> {
    return typeof x === "object" && x !== null;
  }
}
