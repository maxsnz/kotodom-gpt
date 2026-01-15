import { BotRepository } from "../bots/BotRepository";
import { ChatRepository } from "../chats/ChatRepository";
import { MessageRepository } from "../chats/MessageRepository";
import { MessageProcessingRepository } from "./MessageProcessingRepository";
import { MessageProcessingStatus } from "./MessageProcessing";
import { Bot } from "../bots/Bot";
import { Chat } from "../chats/Chat";
import { Message } from "../chats/Message";
import { PricingInfo } from "../../infra/openai/pricing";
import { createDecimal } from "../../infra/db/prisma/decimal";
import { TerminalError } from "../../infra/errors/ErrorClassifier";

export type LoggerLike = {
  info: (msg: string, meta?: Record<string, unknown>) => void;
  error: (msg: string, meta?: Record<string, unknown>) => void;
  warn?: (msg: string, meta?: Record<string, unknown>) => void;
  debug?: (msg: string, meta?: Record<string, unknown>) => void;
};

export type IncomingContext = {
  bot: Bot;
  chat: Chat;
  userMessage: Message;
};

export type GenerationResult = IncomingContext & {
  responseText: string;
  pricing: PricingInfo | null;
  rawResponse?: unknown;
};

export type SaveResult = GenerationResult & {
  botMessage: Message;
};

export interface ResponseGenerator {
  generateResponse(
    ctx: IncomingContext,
    botId: number | null,
    userMessageId: number
  ): Promise<GenerationResult>;
}

export interface ResponseSender {
  sendResponse(
    result: SaveResult,
    botId: number | null,
    logger: LoggerLike,
    userMessageId: number,
    chatId?: number
  ): Promise<void>;
  editMessage(
    chatId: number | string,
    messageId: number,
    text: string,
    botToken: string,
    logger: LoggerLike
  ): Promise<void>;
}

export { DefaultResponseGenerator } from "./ResponseGenerator";
export { DefaultResponseSender } from "./ResponseSender";

export interface MessageProcessorDeps {
  botRepository: BotRepository;
  chatRepository: ChatRepository;
  messageRepository: MessageRepository;
  messageProcessingRepository: MessageProcessingRepository;
  responseGenerator: ResponseGenerator;
  responseSender: ResponseSender;
  logger: LoggerLike;
}

/**
 * Core business logic for processing user messages.
 * Orchestrates the entire message processing workflow.
 */
export class MessageProcessor {
  constructor(private readonly deps: MessageProcessorDeps) {}

  /**
   * Process a user message by its ID.
   * This is the main entry point for message processing.
   */
  async processUserMessage(userMessageId: number): Promise<void> {
    // Load user message
    const userMessage = await this.deps.messageRepository.findById(
      userMessageId
    );
    if (!userMessage) {
      throw new TerminalError(`User message not found: ${userMessageId}`);
    }

    if (!userMessage.chatId) {
      throw new TerminalError(`User message has no chatId: ${userMessageId}`);
    }

    // Load chat
    const chat = await this.deps.chatRepository.findById(userMessage.chatId);
    if (!chat) {
      throw new TerminalError(`Chat not found: ${userMessage.chatId}`);
    }

    // Get botId from message or fallback to chat
    const botId = userMessage.botId ?? chat.botId;
    if (!botId) {
      throw new TerminalError(
        `Neither user message nor chat has botId: ${userMessageId}, chatId: ${userMessage.chatId}`
      );
    }

    // Load bot
    const bot = await this.deps.botRepository.findById(String(botId));
    if (!bot) {
      throw new TerminalError(`Bot not found: ${botId}`);
    }

    const incomingCtx: IncomingContext = {
      bot,
      chat,
      userMessage,
    };

    // Step 1: Get or create MessageProcessing record
    const processing =
      await this.deps.messageProcessingRepository.getOrCreateForUserMessage(
        userMessageId
      );

    // Step 2: Check if already completed or terminal - skip processing
    if (processing.status === MessageProcessingStatus.COMPLETED) {
      this.deps.logger.info("Message processing already completed", {
        botId: botId,
        userMessageId,
        status: processing.status,
      });
      return;
    }

    // Step 3: Mark as processing
    await this.deps.messageProcessingRepository.markProcessing(userMessageId);

    // Step 4: Generate response if not already generated
    if (!processing.responseMessageId) {
      const generationResult =
        await this.deps.responseGenerator.generateResponse(
          incomingCtx,
          botId,
          userMessageId
        );

      // Check if message was already created during streaming
      const updatedProcessing =
        await this.deps.messageProcessingRepository.findByUserMessageId(
          userMessageId
        );
    } else {
      // Response already generated, check if it needs to be sent
      if (!processing.responseSentAt) {
        const botMessage =
          await this.deps.messageRepository.findBotResponseForUserMessage(
            userMessageId
          );
        if (botMessage) {
          const saveResult: SaveResult = {
            ...incomingCtx,
            responseText: botMessage.text,
            pricing: null,
            botMessage,
          };

          await this.deps.responseSender.sendResponse(
            saveResult,
            botId,
            this.deps.logger,
            userMessageId
          );
        }
      }
    }

    // Step 6: Mark as completed
    await this.deps.messageProcessingRepository.markCompleted(userMessageId);
  }

  private async saveResponse(
    result: GenerationResult,
    botId: number,
    userMessageId: number
  ): Promise<SaveResult> {
    const existingBotMessage =
      await this.deps.messageRepository.findBotResponseForUserMessage(
        userMessageId
      );

    if (existingBotMessage) {
      return { ...result, botMessage: existingBotMessage };
    }

    if (!result.responseText) {
      throw new TerminalError("Missing response text for bot message");
    }

    const botMessageInput = {
      chatId: result.chat.id,
      botId: botId,
      text: result.responseText,
      price: createDecimal(0), // Price is now stored in MessageProcessing
      userMessageId: result.userMessage.id,
    };

    const botMessage = await this.deps.messageRepository.createBotMessage(
      botMessageInput
    );

    return { ...result, botMessage };
  }
}
