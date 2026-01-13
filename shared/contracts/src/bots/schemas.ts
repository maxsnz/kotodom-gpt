import { z } from "zod";
import { TelegramModeSchema } from "../shared/enums";

export const CreateBotSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  token: z.string().min(1, "Token is required").trim(),
  startMessage: z.string().default(""),
  errorMessage: z.string().default(""),
  model: z.string().default("gpt-4"),
  telegramMode: TelegramModeSchema.default("webhook"),
  prompt: z.string().default(""),
});

export const UpdateBotSchema = z.object({
  name: z.string().min(1, "Name cannot be empty").trim().optional(),
  token: z.string().min(1, "Token cannot be empty").trim().optional(),
  startMessage: z.string().optional(),
  errorMessage: z.string().optional(),
  model: z.string().optional(),
  telegramMode: TelegramModeSchema.optional(),
  enabled: z.boolean().optional(),
  prompt: z.string().optional(),
});
