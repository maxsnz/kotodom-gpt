import { z } from "zod";

export const ChatResponseSchema = z.object({
  id: z.string(),
  telegramChatId: z.string(),
  botId: z.number().nullable(),
  tgUserId: z.string(),
  threadId: z.string().nullable(),
  name: z.string().nullable(),
  createdAt: z.string().datetime(),
});

export type ChatResponse = z.infer<typeof ChatResponseSchema>;
