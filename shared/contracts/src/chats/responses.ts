import { z } from "zod";

export const ChatResponseSchema = z.object({
  id: z.string(),
  telegramChatId: z.string(),
  botId: z.number().nullable(),
  tgUserId: z.string(),
  name: z.string().nullable(),
  createdAt: z.string().datetime(),
  lastResponseId: z.string().nullable(),
});

export type ChatResponse = z.infer<typeof ChatResponseSchema>;
