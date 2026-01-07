import { z } from "zod";
import { TelegramModeSchema } from "../shared/enums";

export const CreateBotSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  token: z.string().min(1, "Token is required").trim(),
  assistantId: z.string().min(1, "Assistant ID is required").trim(),
  startMessage: z.string().default(""),
  errorMessage: z.string().default(""),
  model: z.string().default("gpt-4"),
  telegramMode: TelegramModeSchema.default("webhook"),
});

export const UpdateBotSchema = z.object({
  name: z.string().min(1, "Name cannot be empty").trim().optional(),
  token: z.string().min(1, "Token cannot be empty").trim().optional(),
  assistantId: z.string().min(1, "Assistant ID cannot be empty").trim().optional(),
  startMessage: z.string().optional(),
  errorMessage: z.string().optional(),
  model: z.string().optional(),
  telegramMode: TelegramModeSchema.optional(),
  enabled: z.boolean().optional(),
});
