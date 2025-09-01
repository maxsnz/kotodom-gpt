import { TextContentBlock } from "openai/resources/beta/threads/messages";
import gpt from ".";
import prisma from "../prismaClient";
import {
  calculateOpenAICost,
  extractModelFromAssistant,
  type TokenUsage,
} from "../utils/openaiPricing";

const checkThread = async (threadId: string, runId: string) => {
  const run = await gpt.instance.beta.threads.runs.retrieve(
    threadId,
    runId,
  );
  if (run.status === "failed") {
    console.error(run.last_error);
    return [run.status, run.last_error];
  }
  return [run.status];
};

const waitThreadCompleted = (
  threadId: string,
  runId: string,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      try {
        const [status, error] = await checkThread(threadId, runId);
        if (status === "completed") {
          clearInterval(interval);
          resolve();
        } else if (status === "failed") {
          clearInterval(interval);
          reject(error);
        }
      } catch (error) {
        clearInterval(interval);
        reject(error);
      }
    }, 500);
  });
};

interface GetAnswerResult {
  answer: string;
  pricing: {
    model: string;
    inputTokens: number;
    outputTokens: number;
    inputCost: number;
    outputCost: number;
    totalCost: number;
  } | null;
}

const getAnswer = async (
  assistantId: string,
  threadId: string,
  messageText: string,
  model?: string, // Optional model override
): Promise<GetAnswerResult> => {
  const message = await gpt.instance.beta.threads.messages.create(
    threadId,
    {
      role: "user",
      content: messageText,
    },
  );
  const runConfig: {
    assistant_id: string;
    model?: string;
  } = {
    assistant_id: assistantId,
    // instructions: getInstructions(username),
  };

  // Override model if provided
  if (model) {
    runConfig.model = model;
  }

  const run = await gpt.instance.beta.threads.runs.create(
    threadId,
    runConfig,
  );
  const runId = run.id;

  await waitThreadCompleted(threadId, runId);

  // Get the completed run to access usage information
  const completedRun = await gpt.instance.beta.threads.runs.retrieve(
    threadId,
    runId,
  );

  const messages = await gpt.instance.beta.threads.messages.list(
    threadId,
  );

  const mText = messages.data[0].content.find(
    (item): item is TextContentBlock => item.type === "text",
  );

  if (!mText) {
    return {
      answer: "no answer from chatGPT",
      pricing: null,
    };
  }

  const answer = mText.text.value || "no answer from chatGPT";

  // Calculate pricing if usage information is available
  let pricing = null;
  if (completedRun.usage) {
    console.log(
      "[OpenAI] Raw usage data:",
      JSON.stringify(completedRun.usage, null, 2),
    );

    // Use provided model or extract from assistant
    const modelToUse =
      model ||
      (await extractModelFromAssistant(assistantId, gpt.instance));
    const usage: TokenUsage = {
      prompt_tokens: completedRun.usage.prompt_tokens,
      completion_tokens: completedRun.usage.completion_tokens,
      total_tokens: completedRun.usage.total_tokens,
    };
    pricing = calculateOpenAICost(modelToUse, usage);
    console.log(
      `[OpenAI] Model: ${modelToUse}${
        model ? " (overridden)" : ""
      }, Usage: ${usage.total_tokens} tokens (${
        usage.prompt_tokens
      } input + ${
        usage.completion_tokens
      } output), Cost: $${pricing.totalCost.toFixed(6)}`,
    );
  } else {
    console.log(
      "[OpenAI] No usage information available for pricing calculation",
    );
    console.log(
      "[OpenAI] Completed run data:",
      JSON.stringify(completedRun, null, 2),
    );
  }

  return {
    answer,
    pricing,
  };
};

export default getAnswer;
