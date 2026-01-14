import { Inject, Injectable } from "@nestjs/common";
import OpenAI from "openai";
import fetch from "node-fetch";
import { HttpsProxyAgent } from "https-proxy-agent";
import { env } from "../../config/env";
import { SettingsRepository } from "../../domain/settings/SettingsRepository";
import {
  calculateOpenAICost,
  type TokenUsage,
  type PricingInfo,
} from "./pricing";
import {
  AppLogger,
  LOGGER_FACTORY,
  type LoggerFactory,
  createConsoleLoggerFactory,
} from "../logger";

export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

export interface GetAnswerParams {
  prompt: string;
  messageText: string;
  conversationContext?: ConversationMessage[];
  model: string;
  user?: string;
}

export interface GetAnswerResult {
  answer: string;
  pricing: PricingInfo | null;
}

export interface StreamAnswerParams {
  prompt: string;
  messageText: string;
  conversationContext?: ConversationMessage[];
  model: string;
  user?: string;
}

export interface StreamAnswerCallbacks {
  onChunk: (textDelta: string) => void;
  onComplete: (pricing: PricingInfo | null) => void;
}

@Injectable()
export class OpenAIClient {
  private readonly logger: AppLogger;
  private readonly client: OpenAI;

  constructor(
    private readonly settingsRepository: SettingsRepository,
    @Inject(LOGGER_FACTORY) createLogger?: LoggerFactory
  ) {
    const factory = createLogger ?? createConsoleLoggerFactory();
    this.logger = factory(OpenAIClient.name);
    this.client = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
      // @ts-expect-error - fetch override for proxy support
      fetch: this.createFetch(),
    });
  }

  private createFetch() {
    return async (url: string, init?: any) => {
      const proxyUrl = await this.settingsRepository.getSetting("PROXY_URL");
      if (proxyUrl) {
        const agent = new HttpsProxyAgent(proxyUrl);
        return fetch(url, { ...init, agent });
      }
      return fetch(url, init);
    };
  }

  /**
   * Get answer from OpenAI using Responses API
   * Responses API is stateless - no threads or conversations needed
   */
  async getAnswer(params: GetAnswerParams): Promise<GetAnswerResult> {
    const { prompt, messageText, conversationContext, model, user } = params;

    try {
      this.logger.debug(`Creating response with model: ${model}`);

      // Prepare input with conversation context
      let input = messageText;
      if (conversationContext && conversationContext.length > 0) {
        // Format conversation context for OpenAI API
        const contextText = conversationContext
          .map(
            (msg) =>
              `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`
          )
          .join("\n\n");
        input = `${contextText}\n\nUser: ${messageText}`;
      }

      // Create response using Responses API
      // Responses API is stateless - each call is independent
      const response = await this.client.responses.create({
        model: model,
        instructions: prompt,
        input: input,
        max_output_tokens: 800,
        ...(params.user && { user: params.user }),
      });

      // Extract answer text
      const answerText = response.output_text;

      if (!answerText) {
        this.logger.warn(`No text content found in response`);
        return {
          answer: "no answer from chatGPT",
          pricing: null,
        };
      }

      this.logger.info(`OpenAI response: ${answerText}`);

      // Calculate pricing if usage information is available
      let pricing: PricingInfo | null = null;
      if (response.usage) {
        this.logger.debug(
          `Raw usage data: ${JSON.stringify(response.usage, null, 2)}`
        );

        const usage: TokenUsage = {
          input_tokens: response.usage.input_tokens,
          output_tokens: response.usage.output_tokens,
          total_tokens: response.usage.total_tokens,
        };

        pricing = calculateOpenAICost(model, usage);

        this.logger.info(
          `Model: ${model}, Usage: ${usage.total_tokens} tokens (${
            usage.input_tokens
          } input + ${
            usage.output_tokens
          } output), Cost: $${pricing.totalCost.toFixed(6)}`
        );
      } else {
        this.logger.warn(
          `No usage information available for pricing calculation`
        );
      }

      return {
        answer: answerText,
        pricing,
      };
    } catch (error) {
      this.logger.error(`Failed to get answer from OpenAI: ${error}`, {
        stack: error instanceof Error ? error.stack : undefined,
      });

      // Re-throw with more context
      if (error instanceof Error) {
        throw new Error(`OpenAI API error: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Stream answer from OpenAI using Responses API with streaming enabled.
   * Calls onChunk for each text delta and onComplete when finished.
   */
  async streamAnswer(
    params: StreamAnswerParams,
    callbacks: StreamAnswerCallbacks
  ): Promise<void> {
    const { prompt, messageText, conversationContext, model, user } = params;

    try {
      this.logger.debug(`Creating streaming response with model: ${model}`);

      // Prepare input with conversation context
      let input = messageText;
      if (conversationContext && conversationContext.length > 0) {
        // Format conversation context for OpenAI API
        const contextText = conversationContext
          .map(
            (msg) =>
              `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`
          )
          .join("\n\n");
        input = `${contextText}\n\nUser: ${messageText}`;
      }

      // Create streaming response using Responses API
      const stream = await this.client.responses.create({
        model: model,
        instructions: prompt,
        input: input,
        stream: true,
        ...(params.user && { user: params.user }),
      });

      let accumulatedText = "";
      let usage: TokenUsage | null = null;

      // Process streaming events
      for await (const event of stream) {
        const eventAny = event as any;

        // Handle text delta events
        if (event.type === "response.output_text.delta") {
          const delta = eventAny.delta || "";
          if (delta) {
            accumulatedText += delta;
            // Await to ensure chunks are processed sequentially
            await callbacks.onChunk(delta);
          }
        }

        // Handle completion event with usage information
        // Usage information comes in response.done event (not in typed events, need to check manually)
        const eventType = eventAny.type as string;
        if (
          eventType === "response.done" ||
          eventType === "response.completed"
        ) {
          if (eventAny.response?.usage) {
            usage = {
              input_tokens: eventAny.response.usage.input_tokens,
              output_tokens: eventAny.response.usage.output_tokens,
              total_tokens: eventAny.response.usage.total_tokens,
            };
          }
        }

        // Also check if usage is directly on the event (some API versions)
        if (eventAny.usage && !usage) {
          usage = {
            input_tokens: eventAny.usage.input_tokens,
            output_tokens: eventAny.usage.output_tokens,
            total_tokens: eventAny.usage.total_tokens,
          };
        }
      }

      // Calculate pricing if usage information is available
      let pricing: PricingInfo | null = null;
      if (usage) {
        this.logger.debug(`Raw usage data: ${JSON.stringify(usage, null, 2)}`);

        pricing = calculateOpenAICost(model, usage);

        this.logger.info(
          `Model: ${model}, Usage: ${usage.total_tokens} tokens (${
            usage.input_tokens
          } input + ${
            usage.output_tokens
          } output), Cost: $${pricing.totalCost.toFixed(6)}`
        );
      } else {
        this.logger.warn(
          `No usage information available for pricing calculation`
        );
      }

      this.logger.info(`OpenAI streaming response: ${accumulatedText}`);

      // Call completion callback with pricing
      callbacks.onComplete(pricing);
    } catch (error) {
      this.logger.error(`Failed to stream answer from OpenAI: ${error}`, {
        stack: error instanceof Error ? error.stack : undefined,
      });

      // Re-throw with more context
      if (error instanceof Error) {
        throw new Error(`OpenAI API streaming error: ${error.message}`);
      }
      throw error;
    }
  }
}
