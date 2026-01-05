import { z } from "zod";

export const TelegramModeSchema = z.enum(["webhook", "polling"]);

export const CreateBotSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  token: z.string().min(1, "Token is required").trim(),
  assistantId: z.string().min(1, "Assistant ID is required").trim(),
  startMessage: z.string().default(""),
  errorMessage: z.string().default(""),
  model: z.string().default("gpt-4"),
  telegramMode: TelegramModeSchema.default("webhook"),
});

export type CreateBotDto = z.infer<typeof CreateBotSchema>;

