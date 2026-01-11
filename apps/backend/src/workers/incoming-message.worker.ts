import { BotRepository } from "../domain/bots/BotRepository";
import { Bot } from "../domain/bots/Bot";
import { ChatRepository } from "../domain/chats/ChatRepository";
import { Chat } from "../domain/chats/Chat";
import {
  CreateUserMessageInput,
  MessageRepository,
} from "../domain/chats/MessageRepository";
import { createDecimal } from "../infra/db/prisma/decimal";
import { Message } from "../domain/chats/Message";
import { MessageProcessingRepository } from "../domain/message-processing/MessageProcessingRepository";
import { MessageProcessingStatus } from "../domain/message-processing/MessageProcessing";
import {
  BotHandleUpdatePayload,
  MessageProcessingTriggerPayload,
} from "../infra/jobs/pgBoss/jobs";
import { TelegramClient } from "../infra/telegram/telegramClient";
import {
  ErrorType,
  TerminalError,
  classifyError,
} from "../infra/errors/ErrorClassifier";
import {
  MessageProcessor,
  DefaultResponseGenerator,
  DefaultResponseSender,
  LoggerLike,
} from "../domain/message-processing/MessageProcessor";
import { OpenAIClient } from "../infra/openai/openaiClient";
import { PricingInfo } from "../infra/openai/pricing";

export type ProcessBotUpdateDeps = {
  botRepository: BotRepository;
  chatRepository: ChatRepository;
  messageRepository: MessageRepository;
  messageProcessingRepository: MessageProcessingRepository;
  openAIClient: OpenAIClient;
  telegramClientFactory: (token: string) => TelegramClient;
  log?: LoggerLike;
};

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
  const messageProcessor = new MessageProcessor({
    botRepository: deps.botRepository,
    chatRepository: deps.chatRepository,
    messageRepository: deps.messageRepository,
    messageProcessingRepository: deps.messageProcessingRepository,
    responseGenerator: new DefaultResponseGenerator(
      deps.openAIClient,
      deps.chatRepository
    ),
    responseSender: new DefaultResponseSender(
      telegramClientFactory,
      deps.messageProcessingRepository
    ),
    logger,
  });

  await messageProcessor.processUserMessage(userMessageId);
}

export function createProcessBotUpdate(deps: ProcessBotUpdateDeps) {
  const logger = deps.log ?? console;
  const telegramClientFactory = deps.telegramClientFactory;

  async function ensureIncomingMessageSaved(
    deps: ProcessBotUpdateDeps,
    payload: BotHandleUpdatePayload,
    botIdNum: number
  ): Promise<{ bot: Bot; chat: Chat; userMessage: Message }> {
    const bot =
      (await deps.botRepository.findById(payload.botId)) ??
      (() => {
        throw new TerminalError(`Bot not found: ${payload.botId}`);
      })();

    // Check for existing message in old format (with botId) for backward compatibility
    // New messages will have botId: null, so they won't be found here
    // but will be checked in createUserMessage by chatId, tgUserId, and telegramUpdateId
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
      botId: null, // User messages should have botId: null
      text: payload.text ?? "",
      telegramUpdateId: BigInt(payload.telegramUpdateId),
    };

    const userMessage = await deps.messageRepository.createUserMessage(
      userMessageInput
    );

    return { bot, chat, userMessage };
  }

  function extractUserFromRaw(raw: unknown): {
    id?: number;
    username?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
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
          typeof from["first_name"] === "string"
            ? from["first_name"]
            : undefined,
        lastName:
          typeof from["last_name"] === "string" ? from["last_name"] : undefined,
      };
    }

    return null;
  }

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
        // Mark bot error
        const bot = await deps.botRepository.findById(payload.botId);
        if (bot) {
          bot.setError(errorMessage);
          await deps.botRepository.save(bot);
        }
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
  const telegramClientFactory = deps.telegramClientFactory;

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
