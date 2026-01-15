import { z } from "zod";
import { TelegramModeSchema } from "../shared/enums";

export const BotResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  startMessage: z.string(),
  errorMessage: z.string(),
  model: z.string(),
  enabled: z.boolean(),
  telegramMode: TelegramModeSchema,
  error: z.string().nullable(),
  ownerUserId: z.string().nullable(),
  prompt: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  token: z.string(),
});

export type BotResponse = z.infer<typeof BotResponseSchema>;
