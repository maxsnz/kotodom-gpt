import { OpenAIClient } from "../../infra/openai/openaiClient";
import { ChatRepository } from "../chats/ChatRepository";
import { MessageRepository } from "../chats/MessageRepository";
import { TelegramClient } from "../../infra/telegram/telegramClient";
import { TypingActionManager } from "./TypingActionManager";
import {
  IncomingContext,
  GenerationResult,
  ResponseGenerator,
  LoggerLike,
} from "./MessageProcessor";
import { CommandRegistry } from "./commands/CommandHandler";
import {
  StartCommandHandler,
  HelpCommandHandler,
} from "./commands/CommandHandlers";
import { MessageProcessingRepository } from "./MessageProcessingRepository";
import { createDecimal } from "../../infra/db/prisma/decimal";
import { Message } from "../chats/Message";
import { PricingInfo } from "../../infra/openai/pricing";
import { ConversationContextBuilder } from "./ConversationContextBuilder";
import { SettingsRepository } from "../settings/SettingsRepository";
import { TgUserRepository } from "../tg-users/TgUserRepository";

const TELEGRAM_MAX_MESSAGE_LENGTH = 4096;
/**
 * Truncate message text to Telegram's maximum length.
 */
function truncateMessage(
  text: string,
  maxLength: number = TELEGRAM_MAX_MESSAGE_LENGTH
): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength);
}

/**
 * Responsible for generating responses to user messages.
 * Handles both commands and AI-powered responses.
 * For AI responses, uses streaming to update messages in real-time.
 */
export class DefaultResponseGenerator implements ResponseGenerator {
  private commandRegistry: CommandRegistry;

  constructor(
    private readonly openAIClient: OpenAIClient,
    private readonly chatRepository: ChatRepository,
    private readonly messageRepository: MessageRepository,
    private readonly telegramClientFactory: (token: string) => TelegramClient,
    private readonly messageProcessingRepository: MessageProcessingRepository,
    private readonly conversationContextBuilder: ConversationContextBuilder,
    private readonly tgUserRepository: TgUserRepository,
    private readonly logger: LoggerLike
  ) {
    this.commandRegistry = new CommandRegistry();
    this.registerCommandHandlers();
  }

  private registerCommandHandlers(): void {
    this.commandRegistry.register(new StartCommandHandler());
    this.commandRegistry.register(new HelpCommandHandler());
  }

  async generateResponse(
    ctx: IncomingContext,
    botId: number | null,
    userMessageId: number
  ): Promise<GenerationResult> {
    const userMessage = ctx.userMessage;

    const text = userMessage.text;
    const trimmed = text.trim();

    // Try to handle as command first
    const commandHandler = this.commandRegistry.findHandler(trimmed);
    if (commandHandler) {
      return commandHandler.handle(ctx);
    }

    // AI-powered response with streaming
    return this.generateStreamingResponse(ctx, botId, userMessageId);
  }

  private async generateStreamingResponse(
    ctx: IncomingContext,
    botId: number | null,
    userMessageId: number
  ): Promise<GenerationResult> {
    const { bot, chat, userMessage } = ctx;
    const telegramChatId = Number(chat.telegramChatId);
    const telegramClient = this.telegramClientFactory(bot.token);
    const typingManager = new TypingActionManager();

    let accumulatedText = "";
    let botMessage: Message | null = null;
    let telegramMessageId: number | null = null;
    let finalPricing: PricingInfo | null = null;
    let currentUpdatePromise: Promise<void> | null = null; // Track current update operation
    let updateTimer: NodeJS.Timeout | null = null; // Debounce timer for updates
    const UPDATE_DEBOUNCE_MS = 1000; // Update at most once per second
    const MIN_CHARS_FOR_UPDATE = 20; // Minimum characters before creating/updating message

    // Function to update message in DB and Telegram
    const updateMessage = async (text: string): Promise<void> => {
      if (!botMessage || telegramMessageId === null) {
        return;
      }

      const truncatedText = truncateMessage(text);

      // Fast check: skip update if text is identical to current (avoid unnecessary DB/API calls)
      if (botMessage.text === truncatedText) {
        return;
      }

      // Update message in DB
      botMessage.updateText(truncatedText);
      await this.messageRepository.save(botMessage);

      // Edit message in Telegram
      try {
        await telegramClient.editMessageText({
          chatId: telegramChatId.toString(),
          messageId: telegramMessageId,
          text: truncatedText,
        });
      } catch (error) {
        // Log but don't fail - message already sent
        this.logger.warn?.(
          `Failed to edit message ${telegramMessageId}: ${error}`,
          {
            chatId: telegramChatId,
            messageId: telegramMessageId,
            error: error instanceof Error ? error.message : String(error),
          }
        );
      }
    };

    // Function to create and send first message
    const createFirstMessage = async (): Promise<void> => {
      if (!botId) {
        throw new Error(
          `Cannot create bot message: botId is null for userMessageId ${userMessageId}`
        );
      }

      const truncatedText = truncateMessage(accumulatedText);
      botMessage = await this.messageRepository.createBotMessage({
        chatId: chat.id,
        botId: botId,
        text: truncatedText,
        price: createDecimal(0),
        userMessageId: userMessage.id,
      });

      // Send message to Telegram
      const sendResult = await telegramClient.sendMessage({
        chatId: telegramChatId.toString(),
        text: truncatedText,
      });

      telegramMessageId = sendResult.messageId;

      // Mark response as generated and sent
      await this.messageProcessingRepository.markResponseGenerated(
        userMessageId,
        botMessage.id
      );
      await this.messageProcessingRepository.markResponseSent(
        userMessageId,
        telegramMessageId
      );

      // Stop TYPING after first message is sent
      typingManager.stopTyping();
    };

    // Function to schedule debounced update
    const scheduleUpdate = (): void => {
      // Clear existing timer
      if (updateTimer) {
        clearTimeout(updateTimer);
        updateTimer = null;
      }

      // Schedule new update after debounce delay
      updateTimer = setTimeout(async () => {
        updateTimer = null;

        // Wait for current update to complete
        if (currentUpdatePromise) {
          await currentUpdatePromise;
        }

        // Update with current accumulated text
        if (botMessage && telegramMessageId !== null) {
          currentUpdatePromise = updateMessage(accumulatedText);
          await currentUpdatePromise;
          currentUpdatePromise = null;
        }
      }, UPDATE_DEBOUNCE_MS);
    };

    // Function to immediately process pending update (for final update)
    const processPendingUpdate = async (): Promise<void> => {
      // Clear any pending timer
      if (updateTimer) {
        clearTimeout(updateTimer);
        updateTimer = null;
      }

      // Wait for current update to complete
      if (currentUpdatePromise) {
        await currentUpdatePromise;
      }

      // Update with current accumulated text
      if (botMessage && telegramMessageId !== null) {
        currentUpdatePromise = updateMessage(accumulatedText);
        await currentUpdatePromise;
        currentUpdatePromise = null;
      }
    };

    try {
      // Start TYPING action immediately
      typingManager.startTyping(telegramChatId, telegramClient, this.logger);

      // Build conversation context (excluding current user message)
      const conversationContext =
        await this.conversationContextBuilder.buildContext(
          chat.id,
          bot.model,
          userMessage.id
        );

      // Load user to get their name
      const tgUser = await this.tgUserRepository.findById(chat.tgUserId);
      const userName = tgUser
        ? tgUser.fullName ?? tgUser.name ?? undefined
        : undefined;

      // Start streaming from OpenAI
      await this.openAIClient.streamAnswer(
        {
          prompt: bot.prompt,
          messageText: userMessage.text,
          conversationContext,
          model: bot.model,
          user: userName ?? "No name",
          previousResponseId: chat.lastResponseId,
        },
        {
          onChunk: async (textDelta: string) => {
            accumulatedText += textDelta;

            // Wait for any pending update to complete before creating message
            if (currentUpdatePromise) {
              await currentUpdatePromise;
            }

            // Create message on first chunk that meets minimum character requirement
            if (
              !botMessage &&
              accumulatedText.trim().length >= MIN_CHARS_FOR_UPDATE
            ) {
              await createFirstMessage();

              // After first message is created, schedule update if more text accumulated
              if (accumulatedText.trim().length > botMessage!.text.length) {
                scheduleUpdate();
              }
            } else if (botMessage && telegramMessageId !== null) {
              // For subsequent chunks, schedule debounced update only if enough characters
              if (accumulatedText.trim().length >= MIN_CHARS_FOR_UPDATE) {
                scheduleUpdate();
              }
            }
          },
          onComplete: async (
            pricingInfo: PricingInfo | null,
            responseId: string,
            rawResponse: unknown
          ) => {
            finalPricing = pricingInfo;
            if (currentUpdatePromise) {
              await currentUpdatePromise;
            }

            // Create message immediately if not created yet (even if less than MIN_CHARS_FOR_UPDATE)
            if (!botMessage && accumulatedText.trim().length > 0) {
              // Wait for any pending update to complete before creating message

              await createFirstMessage();
            }

            // Wait for any pending update to complete
            await processPendingUpdate();

            // Final update with complete accumulated text (always, even if less than MIN_CHARS_FOR_UPDATE)
            if (botMessage && telegramMessageId !== null) {
              await updateMessage(accumulatedText);
            }

            // Final update with complete accumulated text (only if different from current)
            // This ensures the final state is saved even if last chunk didn't trigger update
            if (botMessage && telegramMessageId !== null) {
              await updateMessage(accumulatedText);
            }

            // Update pricing and rawResponse in MessageProcessing if available
            if (botMessage) {
              const price =
                pricingInfo && pricingInfo.totalCost !== undefined
                  ? createDecimal(pricingInfo.totalCost)
                  : undefined;
              await this.messageProcessingRepository.markResponseGenerated(
                userMessageId,
                botMessage.id,
                price,
                rawResponse
              );
            }

            // Save response ID to chat for next request
            chat.updateLastResponseId(responseId);
          },
        }
      );

      await this.chatRepository.save(chat);

      return {
        bot,
        chat,
        userMessage,
        responseText: accumulatedText,
        pricing: finalPricing,
        rawResponse: undefined, // rawResponse is saved in onComplete callback
      };
    } catch (error) {
      // Ensure TYPING stops on error
      typingManager.stopTyping();

      // Clear timer on error
      if (updateTimer) {
        clearTimeout(updateTimer);
        updateTimer = null;
      }

      this.logger.error(`Failed to generate streaming response: ${error}`, {
        botId,
        userMessageId,
        stack: error instanceof Error ? error.stack : undefined,
      });

      throw error;
    } finally {
      // Ensure TYPING always stops
      typingManager.stopTyping();

      // Clear timer
      if (updateTimer) {
        clearTimeout(updateTimer);
        updateTimer = null;
      }
    }
  }
}
