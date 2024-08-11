import { TextContentBlock } from "openai/resources/beta/threads/messages";
import gpt from ".";
import prisma from "../prismaClient";

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

const getAnswer = async (
  assistantId: string,
  threadId: string,
  messageText: string,
): Promise<string> => {
  const message = await gpt.instance.beta.threads.messages.create(
    threadId,
    {
      role: "user",
      content: messageText,
    },
  );
  const run = await gpt.instance.beta.threads.runs.create(threadId, {
    assistant_id: assistantId,
    // instructions: getInstructions(username),
  });
  const runId = run.id;

  await waitThreadCompleted(threadId, runId);

  const messages = await gpt.instance.beta.threads.messages.list(
    threadId,
  );

  const mText = messages.data[0].content.find(
    (item): item is TextContentBlock => item.type === "text",
  );

  if (!mText) {
    return "no answer from chatGPT";
  }

  const answer = mText.text.value || "no answer from chatGPT";

  return answer;
};

export default getAnswer;
