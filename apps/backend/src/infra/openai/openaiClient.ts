import { Inject, Injectable } from "@nestjs/common";
import OpenAI from "openai";
import fetch from "node-fetch";
import { HttpsProxyAgent } from "https-proxy-agent";
import { TextContentBlock } from "openai/resources/beta/threads/messages";
import { env } from "../../config/env";
import { SettingsRepository } from "../../domain/settings/SettingsRepository";
import {
  calculateOpenAICost,
  extractModelFromAssistant,
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
  assistantId: string;
  threadId?: string;
  messageText: string;
  model?: string;
}

export interface GetAnswerResult {
  answer: string;
  pricing: PricingInfo | null;
  threadId: string;
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
   * Create a new OpenAI thread
   */
  async createThread(): Promise<string> {
    try {
      const thread = await this.client.beta.threads.create();
      this.logger.debug(`Created new thread: ${thread.id}`);
      return thread.id;
    } catch (error) {
      this.logger.error(`Failed to create thread: ${error}`);
      throw new Error(`Failed to create OpenAI thread: ${error}`);
    }
  }

  /**
   * Check the status of a run
   */
  private async checkRunStatus(
    threadId: string,
    runId: string
  ): Promise<{ status: string; error?: any }> {
    try {
      const run = await this.client.beta.threads.runs.retrieve(threadId, runId);
      if (run.status === "failed") {
        this.logger.error(`Run failed: ${JSON.stringify(run.last_error)}`);
        return { status: run.status, error: run.last_error };
      }
      return { status: run.status };
    } catch (error) {
      this.logger.error(`Failed to check run status: ${error}`);
      throw error;
    }
  }

  /**
   * Wait for a run to complete, polling every 500ms
   */
  private async waitForRunCompletion(
    threadId: string,
    runId: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const interval = setInterval(async () => {
        try {
          const { status, error } = await this.checkRunStatus(threadId, runId);
          if (status === "completed") {
            clearInterval(interval);
            resolve();
          } else if (status === "failed") {
            clearInterval(interval);
            reject(
              new Error(
                `OpenAI run failed: ${error?.message || JSON.stringify(error)}`
              )
            );
          }
        } catch (error) {
          clearInterval(interval);
          reject(error);
        }
      }, 500);
    });
  }

  /**
   * Extract text content from message list
   */
  private extractTextFromMessage(
    messages: OpenAI.Beta.Threads.Messages.MessagesPage
  ): string | null {
    if (messages.data.length === 0) {
      return null;
    }

    const firstMessage = messages.data[0];
    const textBlock = firstMessage.content.find(
      (item): item is TextContentBlock => item.type === "text"
    );

    return textBlock?.text.value || null;
  }

  /**
   * Get answer from OpenAI assistant
   */
  async getAnswer(params: GetAnswerParams): Promise<GetAnswerResult> {
    const {
      assistantId,
      threadId: providedThreadId,
      messageText,
      model,
    } = params;

    let threadId = providedThreadId;

    try {
      // Create thread if not provided
      if (!threadId) {
        threadId = await this.createThread();
        this.logger.debug(`Using new thread: ${threadId}`);
      } else {
        this.logger.debug(`Using existing thread: ${threadId}`);
      }

      // Create message in thread
      await this.client.beta.threads.messages.create(threadId, {
        role: "user",
        content: messageText,
      });

      // Create run configuration
      const runConfig: {
        assistant_id: string;
        model?: string;
      } = {
        assistant_id: assistantId,
      };

      // Override model if provided
      if (model) {
        runConfig.model = model;
      }

      // Create and start run
      const run = await this.client.beta.threads.runs.create(
        threadId,
        runConfig
      );
      const runId = run.id;

      this.logger.debug(`Created run ${runId} for thread ${threadId}`);

      // Wait for run to complete
      await this.waitForRunCompletion(threadId, runId);

      // Get completed run to access usage information
      const completedRun = await this.client.beta.threads.runs.retrieve(
        threadId,
        runId
      );

      // Get messages from thread
      const messages = await this.client.beta.threads.messages.list(threadId);

      // Extract text from first message (assistant's response)
      const answerText = this.extractTextFromMessage(messages);

      if (!answerText) {
        this.logger.warn(
          `No text content found in response for thread ${threadId}`
        );
        return {
          answer: "no answer from chatGPT",
          pricing: null,
          threadId,
        };
      }

      // Calculate pricing if usage information is available
      let pricing: PricingInfo | null = null;
      if (completedRun.usage) {
        this.logger.debug(
          `Raw usage data: ${JSON.stringify(completedRun.usage, null, 2)}`
        );

        // Use provided model or extract from assistant
        const modelToUse =
          model || (await extractModelFromAssistant(assistantId, this.client));

        const usage: TokenUsage = {
          prompt_tokens: completedRun.usage.prompt_tokens,
          completion_tokens: completedRun.usage.completion_tokens,
          total_tokens: completedRun.usage.total_tokens,
        };

        pricing = calculateOpenAICost(modelToUse, usage);

        this.logger.info(
          `Model: ${modelToUse}${model ? " (overridden)" : ""}, Usage: ${
            usage.total_tokens
          } tokens (${usage.prompt_tokens} input + ${
            usage.completion_tokens
          } output), Cost: $${pricing.totalCost.toFixed(6)}`
        );
      } else {
        this.logger.warn(
          `No usage information available for pricing calculation in thread ${threadId}`
        );
      }

      return {
        answer: answerText,
        pricing,
        threadId,
      };
    } catch (error) {
      this.logger.error(`Failed to get answer from OpenAI: ${error}`, {
        stack: error instanceof Error ? error.stack : undefined,
      });

      // Re-throw with more context
      if (error instanceof Error) {
        throw new Error(
          `OpenAI API error: ${error.message}. ThreadId: ${threadId || "none"}`
        );
      }
      throw error;
    }
  }
}
