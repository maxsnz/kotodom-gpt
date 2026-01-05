import { BotRepository } from "../domain/bots/BotRepository";
import { Bot } from "../domain/bots/Bot";
import { ChatRepository } from "../domain/chats/ChatRepository";
import { Chat } from "../domain/chats/Chat";
import {
  CreateBotMessageInput,
  CreateUserMessageInput,
  MessageRepository,
} from "../domain/chats/MessageRepository";
import { Message } from "../domain/chats/Message";
import { MessageProcessingRepository } from "../domain/chats/MessageProcessingRepository";
import { MessageProcessingStatus } from "../domain/chats/MessageProcessing";
import {
  BotHandleUpdatePayload,
  MessageProcessingTriggerPayload,
} from "../infra/jobs/pgBoss/jobs";
import { OpenAIClient } from "../infra/openai/openaiClient";
import { PricingInfo } from "../infra/openai/pricing";
import { TelegramClient } from "../infra/telegram/telegramClient";
import { createDecimal } from "../infra/db/prisma/decimal";

type LoggerLike = {
  info: (msg: string, meta?: Record<string, unknown>) => void;
  error: (msg: string, meta?: Record<string, unknown>) => void;
  warn?: (msg: string, meta?: Record<string, unknown>) => void;
  debug?: (msg: string, meta?: Record<string, unknown>) => void;
};

export enum ErrorType {
  FATAL = "fatal",
  RETRYABLE = "retryable",
  TERMINAL = "terminal",
}

export class TerminalError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TerminalError";
  }
}

export function hasStatusCode(
  error: unknown
): error is { statusCode?: number; status?: number } {
  return (
    typeof error === "object" &&
    error !== null &&
    ("statusCode" in error || "status" in error)
  );
}

export function classifyError(error: unknown): ErrorType {
  const status =
    hasStatusCode(error) && typeof error.statusCode === "number"
      ? error.statusCode
      : hasStatusCode(error) && typeof error.status === "number"
      ? error.status
      : undefined;

  if (status === 401 || status === 403) {
    return ErrorType.FATAL;
  }

  if (status === 429 || (status !== undefined && status >= 500)) {
    return ErrorType.RETRYABLE;
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (
      message.includes("timeout") ||
      message.includes("etimedout") ||
      message.includes("econnreset") ||
      message.includes("rate limit")
    ) {
      return ErrorType.RETRYABLE;
    }

    if (
      message.includes("unauthorized") ||
      message.includes("forbidden") ||
      message.includes("invalid token")
    ) {
      return ErrorType.FATAL;
    }
  }

  return ErrorType.TERMINAL;
}

export type ProcessBotUpdateDeps = {
  botRepository: BotRepository;
  chatRepository: ChatRepository;
  messageRepository: MessageRepository;
  messageProcessingRepository: MessageProcessingRepository;
  openAIClient: OpenAIClient;
  telegramClientFactory?: (token: string) => TelegramClient;
  log?: LoggerLike;
};

type IncomingContext = {
  bot: Bot;
  chat: Chat;
  userMessage: Message;
};

type GenerationResult = IncomingContext & {
  responseText: string;
  pricing: PricingInfo | null;
};

type SaveResult = GenerationResult & {
  botMessage: Message;
};

const DEFAULT_HELP_TEXT = [
  "/start - Start the bot",
  "/help - Show this message",
  "/refresh - Forget current thread",
].join("\n");

/**
 * Core use case: process a user message by its ID.
 * Loads all necessary data from database and processes the message.
 */
async function processUserMessage(
  deps: ProcessBotUpdateDeps,
  userMessageId: number,
  logger: LoggerLike,
  telegramClientFactory: (token: string) => TelegramClient
): Promise<void> {
  // Load user message
  const userMessage = await deps.messageRepository.findById(userMessageId);
  if (!userMessage) {
    throw new TerminalError(`User message not found: ${userMessageId}`);
  }

  if (!userMessage.botId) {
    throw new TerminalError(`User message has no botId: ${userMessageId}`);
  }

  if (!userMessage.chatId) {
    throw new TerminalError(`User message has no chatId: ${userMessageId}`);
  }

  // Load bot
  const bot = await deps.botRepository.findById(String(userMessage.botId));
  if (!bot) {
    throw new TerminalError(`Bot not found: ${userMessage.botId}`);
  }

  // Load chat
  const chat = await deps.chatRepository.findById(userMessage.chatId);
  if (!chat) {
    throw new TerminalError(`Chat not found: ${userMessage.chatId}`);
  }

  const incomingCtx: IncomingContext = {
    bot,
    chat,
    userMessage,
  };

  // Step 1: Get or create MessageProcessing record
  const processing =
    await deps.messageProcessingRepository.getOrCreateForUserMessage(
      userMessageId
    );

  // Step 2: Check if already completed or terminal - skip processing
  if (
    processing.status === MessageProcessingStatus.COMPLETED ||
    processing.status === MessageProcessingStatus.TERMINAL
  ) {
    logger.info("Message processing already completed or terminal", {
      botId: userMessage.botId,
      userMessageId,
      status: processing.status,
    });
    return;
  }

  // Step 3: Mark as processing
  await deps.messageProcessingRepository.markProcessing(userMessageId);

  // Step 4: Generate response if not already generated
  if (!processing.responseMessageId) {
    const generationResult = await ensureResponseGeneratedFromDB(
      deps,
      incomingCtx,
      userMessage.botId
    );
    const saveResult = await ensureResponseSaved(
      deps,
      generationResult,
      userMessage.botId,
      userMessageId
    );

    // Mark response as generated with price if available
    const price =
      generationResult.pricing?.totalCost !== undefined
        ? createDecimal(generationResult.pricing.totalCost)
        : undefined;
    await deps.messageProcessingRepository.markResponseGenerated(
      userMessageId,
      saveResult.botMessage.id,
      price
    );

    // Step 5: Send response (we know it's not sent yet since we just generated it)
    await ensureResponseSentFromDB(
      deps,
      saveResult,
      userMessage.botId,
      telegramClientFactory,
      logger,
      userMessageId
    );
  } else {
    // Response already generated, check if it needs to be sent
    if (!processing.responseSentAt) {
      const botMessage =
        await deps.messageRepository.findBotResponseForUserMessage(
          userMessageId
        );
      if (botMessage) {
        await ensureResponseSentFromDB(
          deps,
          {
            bot: incomingCtx.bot,
            chat: incomingCtx.chat,
            userMessage: incomingCtx.userMessage,
            responseText: botMessage.text,
            pricing: null,
            botMessage,
          },
          userMessage.botId,
          telegramClientFactory,
          logger,
          userMessageId
        );
      }
    }
  }

  // Step 6: Mark as completed
  await deps.messageProcessingRepository.markCompleted(userMessageId);
}

export function createProcessBotUpdate(deps: ProcessBotUpdateDeps) {
  const logger = deps.log ?? console;
  const telegramClientFactory =
    deps.telegramClientFactory ??
    ((token: string) => new TelegramClient({ token }));

  return async function processBotUpdate(
    payload: BotHandleUpdatePayload
  ): Promise<void> {
    const botIdNum = parseInt(payload.botId, 10);
    if (Number.isNaN(botIdNum)) {
      throw new TerminalError(`Invalid botId: ${payload.botId}`);
    }

    // Handle callback_query: just acknowledge and return (no message processing)
    if (payload.kind === "callback_query" && payload.callbackQueryId) {
      const bot = await deps.botRepository.findById(payload.botId);
      if (!bot) {
        throw new TerminalError(`Bot not found: ${payload.botId}`);
      }

      const telegramClient = telegramClientFactory(bot.token);
      await telegramClient.answerCallbackQuery({
        callbackQueryId: payload.callbackQueryId,
      });

      logger.info("Callback query answered", {
        botId: payload.botId,
        callbackQueryId: payload.callbackQueryId,
        callbackData: payload.callbackData,
      });
      return;
    }

    try {
      // Step 1: Ensure incoming message is saved (idempotent)
      const incomingCtx = await ensureIncomingMessageSaved(
        deps,
        payload,
        botIdNum
      );

      // Update telegram IDs if available
      if (payload.messageId || payload.telegramUpdateId) {
        await deps.messageProcessingRepository.updateTelegramIds(
          incomingCtx.userMessage.id,
          payload.messageId,
          payload.telegramUpdateId
            ? BigInt(payload.telegramUpdateId)
            : undefined
        );
      }

      // Step 2: Process the message using shared logic
      await processUserMessage(
        deps,
        incomingCtx.userMessage.id,
        logger,
        telegramClientFactory
      );
    } catch (error) {
      const errorType = classifyError(error);
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);

      // Try to get user message ID for error tracking
      let userMessageId: number | null = null;
      try {
        const existingMessage =
          await deps.messageRepository.findByTelegramUpdate(
            botIdNum,
            payload.telegramUpdateId
          );
        if (existingMessage) {
          userMessageId = existingMessage.id;
        }
      } catch {
        // Ignore errors when trying to find message for error tracking
      }

      if (errorType === ErrorType.TERMINAL || errorType === ErrorType.FATAL) {
        if (userMessageId) {
          await deps.messageProcessingRepository.markTerminal(
            userMessageId,
            errorMessage
          );
        }
        await markBotError(deps.botRepository, payload.botId, error);
        logger.error("Terminal/fatal error in processBotUpdate", {
          botId: payload.botId,
          telegramUpdateId: payload.telegramUpdateId,
          userMessageId,
          error:
            error instanceof Error
              ? { message: error.message, stack: error.stack }
              : error,
        });
        throw new TerminalError(errorMessage);
      }

      // Retryable error - mark as failed but let pg-boss retry
      if (userMessageId) {
        await deps.messageProcessingRepository.markFailed(
          userMessageId,
          errorMessage
        );
      }

      logger.error("Retryable error in processBotUpdate", {
        botId: payload.botId,
        telegramUpdateId: payload.telegramUpdateId,
        userMessageId,
        error:
          error instanceof Error
            ? { message: error.message, stack: error.stack }
            : error,
      });

      throw error;
    }
  };
}

/**
 * Handler for message processing trigger (retry) jobs.
 * Uses minimal payload with userMessageId and loads all data from DB.
 */
export function createProcessMessageTrigger(deps: ProcessBotUpdateDeps) {
  const logger = deps.log ?? console;
  const telegramClientFactory =
    deps.telegramClientFactory ??
    ((token: string) => new TelegramClient({ token }));

  return async function processMessageTrigger(
    payload: MessageProcessingTriggerPayload
  ): Promise<void> {
    try {
      await processUserMessage(
        deps,
        payload.userMessageId,
        logger,
        telegramClientFactory
      );
    } catch (error) {
      const errorType = classifyError(error);
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);

      if (errorType === ErrorType.TERMINAL || errorType === ErrorType.FATAL) {
        await deps.messageProcessingRepository.markTerminal(
          payload.userMessageId,
          errorMessage
        );
        logger.error("Terminal/fatal error in processMessageTrigger", {
          userMessageId: payload.userMessageId,
          error:
            error instanceof Error
              ? { message: error.message, stack: error.stack }
              : error,
        });
        throw new TerminalError(errorMessage);
      }

      // Retryable error - mark as failed but let pg-boss retry
      await deps.messageProcessingRepository.markFailed(
        payload.userMessageId,
        errorMessage
      );

      logger.error("Retryable error in processMessageTrigger", {
        userMessageId: payload.userMessageId,
        error:
          error instanceof Error
            ? { message: error.message, stack: error.stack }
            : error,
      });

      throw error;
    }
  };
}

async function ensureIncomingMessageSaved(
  deps: ProcessBotUpdateDeps,
  payload: BotHandleUpdatePayload,
  botIdNum: number
): Promise<IncomingContext> {
  const bot =
    (await deps.botRepository.findById(payload.botId)) ??
    (() => {
      throw new TerminalError(`Bot not found: ${payload.botId}`);
    })();

  const existingMessage = await deps.messageRepository.findByTelegramUpdate(
    botIdNum,
    payload.telegramUpdateId
  );

  if (existingMessage) {
    const chat =
      existingMessage.chatId &&
      (await deps.chatRepository.findById(existingMessage.chatId));
    if (!chat) {
      throw new TerminalError("Chat not found for existing message");
    }

    return {
      bot,
      chat,
      userMessage: existingMessage,
    };
  }

  const rawUser = extractUserFromRaw(payload.raw);
  const userId =
    payload.userId ??
    rawUser?.id ??
    (() => {
      throw new TerminalError("Missing userId in update");
    })();

  const tgUser = await deps.chatRepository.findOrCreateUser(BigInt(userId), {
    username: rawUser?.username,
    firstName: rawUser?.firstName,
    lastName: rawUser?.lastName,
  });

  const chatId = `${payload.chatId}${botIdNum}`;
  const telegramChatId = BigInt(payload.chatId);
  const chat = await deps.chatRepository.findOrCreateChat(
    chatId,
    tgUser.id,
    botIdNum,
    telegramChatId
  );

  const userMessageInput: CreateUserMessageInput = {
    chatId: chat.id,
    tgUserId: tgUser.id,
    botId: botIdNum,
    text: payload.text ?? "",
    telegramUpdateId: BigInt(payload.telegramUpdateId),
  };

  const userMessage = await deps.messageRepository.createUserMessage(
    userMessageInput
  );

  return { bot, chat, userMessage };
}

async function ensureResponseGenerated(
  deps: ProcessBotUpdateDeps,
  payload: BotHandleUpdatePayload,
  ctx: IncomingContext,
  botIdNum: number
): Promise<GenerationResult> {
  const messageText = payload.text ?? "";
  return ensureResponseGeneratedFromDB(deps, ctx, botIdNum, messageText);
}

async function ensureResponseGeneratedFromDB(
  deps: ProcessBotUpdateDeps,
  ctx: IncomingContext,
  botIdNum: number,
  messageText?: string
): Promise<GenerationResult> {
  const userMessage = ctx.userMessage;
  const chat = ctx.chat;
  const bot = ctx.bot;

  const text = messageText ?? userMessage.text;
  const trimmed = text.trim();

  // Commands
  if (trimmed === "/start") {
    return {
      bot,
      chat,
      userMessage,
      responseText: bot.startMessage,
      pricing: null,
    };
  }

  if (trimmed === "/help") {
    return {
      bot,
      chat,
      userMessage,
      responseText: DEFAULT_HELP_TEXT,
      pricing: null,
    };
  }

  if (trimmed === "/refresh") {
    chat.setThreadId(null);
    await deps.chatRepository.save(chat);

    return {
      bot,
      chat,
      userMessage,
      responseText: "success",
      pricing: null,
    };
  }

  const openAiResult = await deps.openAIClient.getAnswer({
    assistantId: bot.assistantId,
    threadId: chat.threadId ?? undefined,
    messageText: text,
    model: bot.model,
  });

  chat.setThreadId(openAiResult.threadId);
  await deps.chatRepository.save(chat);

  return {
    bot,
    chat,
    userMessage,
    responseText: openAiResult.answer,
    pricing: openAiResult.pricing,
  };
}

async function ensureResponseSaved(
  deps: ProcessBotUpdateDeps,
  result: GenerationResult,
  botIdNum: number,
  userMessageId: number
): Promise<SaveResult> {
  const existingBotMessage =
    await deps.messageRepository.findBotResponseForUserMessage(userMessageId);

  if (existingBotMessage) {
    return { ...result, botMessage: existingBotMessage };
  }

  if (!result.responseText) {
    throw new TerminalError("Missing response text for bot message");
  }

  const botMessageInput: CreateBotMessageInput = {
    chatId: result.chat.id,
    botId: botIdNum,
    text: result.responseText,
    price: createDecimal(0), // Price is now stored in MessageProcessing
    userMessageId: result.userMessage.id,
  };

  const botMessage = await deps.messageRepository.createBotMessage(
    botMessageInput
  );

  return { ...result, botMessage };
}

async function ensureResponseSent(
  deps: ProcessBotUpdateDeps,
  payload: BotHandleUpdatePayload,
  result: SaveResult,
  botIdNum: number,
  telegramClientFactory: (token: string) => TelegramClient,
  logger: LoggerLike,
  userMessageId: number
): Promise<void> {
  await ensureResponseSentFromDB(
    deps,
    result,
    botIdNum,
    telegramClientFactory,
    logger,
    userMessageId,
    payload.chatId
  );
}

async function ensureResponseSentFromDB(
  deps: ProcessBotUpdateDeps,
  result: SaveResult,
  botIdNum: number,
  telegramClientFactory: (token: string) => TelegramClient,
  logger: LoggerLike,
  userMessageId: number,
  chatId?: number
): Promise<void> {
  const bot = result.bot;
  const chat = result.chat;
  const telegramChatId = chatId ?? Number(chat.telegramChatId);
  const telegramClient = telegramClientFactory(bot.token);

  const sendResult = await telegramClient.sendMessage({
    chatId: telegramChatId.toString(),
    text: result.botMessage.text,
  });

  await deps.messageProcessingRepository.markResponseSent(
    userMessageId,
    sendResult.messageId
  );

  logger.info("Response sent to Telegram", {
    botId: botIdNum,
    chatId: telegramChatId,
    telegramMessageId: sendResult.messageId,
    userMessageId,
  });
}

async function markBotError(
  botRepository: BotRepository,
  botId: string,
  error: unknown
): Promise<void> {
  const bot = await botRepository.findById(botId);
  if (!bot) {
    return;
  }

  const errorMessage =
    error instanceof Error ? error.message : JSON.stringify(error);
  bot.setError(errorMessage);
  await botRepository.save(bot);
}

function extractUserFromRaw(raw: unknown): {
  id?: number;
  username?: string;
  firstName?: string;
  lastName?: string;
} | null {
  if (typeof raw !== "object" || raw === null) {
    return null;
  }

  const candidate = raw as Record<string, unknown>;
  const message = candidate["message"] as Record<string, unknown> | undefined;
  const from = message?.["from"] as Record<string, unknown> | undefined;

  if (from && typeof from["id"] === "number") {
    return {
      id: from["id"],
      username:
        typeof from["username"] === "string" ? from["username"] : undefined,
      firstName:
        typeof from["first_name"] === "string" ? from["first_name"] : undefined,
      lastName:
        typeof from["last_name"] === "string" ? from["last_name"] : undefined,
    };
  }

  return null;
}
