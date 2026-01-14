import { MessageRepository } from "../chats/MessageRepository";
import { Message } from "../chats/Message";
import { encoding_for_model, get_encoding } from "tiktoken";
import { SettingsRepository } from "../settings/SettingsRepository";

const DEFAULT_MAX_CONTEXT_TOKENS = 5000;

/**
 * Service responsible for building conversation context with token limiting.
 * Collects recent messages from the conversation and limits them by token count.
 */
export class ConversationContextBuilder {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly settingsRepository: SettingsRepository
  ) {}

  /**
   * Builds conversation context for the given chat, excluding the current user message.
   * Starts from most recent messages and adds them until token limit is reached.
   *
   * @param chatId - Chat identifier
   * @param model - Model name to use for token counting
   * @param excludeMessageId - Message ID to exclude from context (usually the current user message)
   * @returns Array of message objects with role and content for OpenAI API
   */
  async buildContext(
    chatId: string,
    model: string,
    excludeMessageId?: number
  ): Promise<Array<{ role: "user" | "assistant"; content: string }>> {
    // Get max context tokens from settings
    const maxContextTokensSetting = await this.settingsRepository.getSetting(
      "MAX_CONTEXT_TOKENS"
    );
    const maxContextTokens = maxContextTokensSetting
      ? parseInt(maxContextTokensSetting, 10) || DEFAULT_MAX_CONTEXT_TOKENS
      : DEFAULT_MAX_CONTEXT_TOKENS;

    // Get all messages from the chat
    const allMessages = await this.messageRepository.findByChatId(chatId);

    // Filter out the message to exclude and sort by creation time (newest first)
    let messages = allMessages
      .filter((msg) => msg.id !== excludeMessageId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // newest first

    const context: Array<{ role: "user" | "assistant"; content: string }> = [];
    let totalTokens = 0;

    // Try to add messages starting from the newest
    for (const message of messages) {
      const messageObj = this.messageToContextFormat(message);
      if (!messageObj) continue;

      // Calculate tokens for this message
      const messageTokens = this.countTokens(messageObj.content, model);

      // Check if adding this message would exceed the limit
      if (totalTokens + messageTokens > maxContextTokens) {
        break; // Stop adding messages if limit would be exceeded
      }

      // Add message to context (at the beginning since we're going backwards)
      context.unshift(messageObj);
      totalTokens += messageTokens;
    }

    return context;
  }

  /**
   * Converts a Message entity to OpenAI API format
   */
  private messageToContextFormat(
    message: Message
  ): { role: "user" | "assistant"; content: string } | null {
    // User message: has tgUserId but no botId
    if (message.tgUserId && !message.botId) {
      return {
        role: "user",
        content: message.text,
      };
    }

    // Assistant (bot) message: has botId but no tgUserId
    if (message.botId && !message.tgUserId) {
      return {
        role: "assistant",
        content: message.text,
      };
    }

    // Skip admin messages or other types
    return null;
  }

  /**
   * Counts tokens for a given text using tiktoken with model-specific encoding
   */
  private countTokens(text: string, model: string): number {
    try {
      // Try to use model-specific encoding
      const encoding = encoding_for_model(model as any);
      const tokens = encoding.encode(text);
      encoding.free();
      return tokens.length;
    } catch (error) {
      // Fallback to cl100k_base if model is not supported
      try {
        const encoding = get_encoding("cl100k_base");
        const tokens = encoding.encode(text);
        encoding.free();
        return tokens.length;
      } catch (fallbackError) {
        // Final fallback: rough estimation if tiktoken fails completely
        // This is a very rough approximation: ~4 characters per token for English text
        console.warn(
          "Failed to count tokens with tiktoken, using fallback estimation",
          { model, error, fallbackError }
        );
        return Math.ceil(text.length / 4);
      }
    }
  }
}
