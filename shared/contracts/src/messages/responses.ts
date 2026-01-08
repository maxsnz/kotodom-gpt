import { z } from "zod";

export const MessageResponseSchema = z.object({
  id: z.number(),
  chatId: z.string().nullable(),
  tgUserId: z.string().nullable(),
  botId: z.number().nullable(),
  text: z.string(),
  userMessageId: z.number().nullable(),
  createdAt: z.string().datetime(),
});

export const SendMessageInputSchema = z.object({
  text: z.string().min(1, "Message text is required"),
});

export const SendMessageResponseSchema = z.object({
  message: MessageResponseSchema,
  telegramMessageId: z.number(),
});

export type MessageResponse = z.infer<typeof MessageResponseSchema>;
export type SendMessageInput = z.infer<typeof SendMessageInputSchema>;
export type SendMessageResponse = z.infer<typeof SendMessageResponseSchema>;
