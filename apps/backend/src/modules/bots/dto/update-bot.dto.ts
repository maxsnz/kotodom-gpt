import { z } from "zod";

export const TelegramModeSchema = z.enum(["webhook", "polling"]);

export const UpdateBotSchema = z.object({
  name: z.string().min(1, "Name cannot be empty").trim().optional(),
  token: z.string().min(1, "Token cannot be empty").trim().optional(),
  assistantId: z.string().min(1, "Assistant ID cannot be empty").trim().optional(),
  startMessage: z.string().optional(),
  errorMessage: z.string().optional(),
  model: z.string().optional(),
  telegramMode: TelegramModeSchema.optional(),
});

export type UpdateBotDto = z.infer<typeof UpdateBotSchema>;

