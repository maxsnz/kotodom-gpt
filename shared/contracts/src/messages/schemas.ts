import { z } from "zod";

export const CreateMessageSchema = z.object({
  chatId: z.string().min(1, "Chat ID is required"),
  text: z.string().min(1, "Message text is required"),
  botId: z.number().nullable().optional(),
  tgUserId: z.string().nullable().optional(),
  userMessageId: z.number().nullable().optional(),
});

export const UpdateMessageSchema = z.object({
  text: z.string().min(1, "Message text cannot be empty").optional(),
  chatId: z.string().min(1, "Chat ID cannot be empty").optional(),
  botId: z.number().nullable().optional(),
  tgUserId: z.string().nullable().optional(),
  userMessageId: z.number().nullable().optional(),
});

export type CreateMessageDto = z.infer<typeof CreateMessageSchema>;
export type UpdateMessageDto = z.infer<typeof UpdateMessageSchema>;
