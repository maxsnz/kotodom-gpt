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

export interface GetAnswerParams {
  prompt: string;
  messageText: string;
  model: string;
}

export interface GetAnswerResult {
  answer: string;
  pricing: PricingInfo | null;
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
    const { prompt, messageText, model } = params;

    try {
      this.logger.debug(`Creating response with model: ${model}`);

      // Create response using Responses API
      // Responses API is stateless - each call is independent
      const response = await this.client.responses.create({
        model: model,
        instructions: prompt,
        input: messageText,
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
}
