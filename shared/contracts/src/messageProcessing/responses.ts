import { z } from "zod";
import { MessageProcessingStatusSchema } from "../shared/enums";

export const MessageProcessingResponseSchema = z.object({
  id: z.number(),
  userMessageId: z.number(),
  status: MessageProcessingStatusSchema,
  attempts: z.number(),
  lastError: z.string().nullable(),
  lastErrorAt: z.string().datetime().nullable(),
  terminalReason: z.string().nullable(),
  responseMessageId: z.number().nullable(),
  telegramIncomingMessageId: z.number().nullable(),
  telegramOutgoingMessageId: z.number().nullable(),
  telegramUpdateId: z.string().nullable(), // BigInt as string
  responseGeneratedAt: z.string().datetime().nullable(),
  responseSentAt: z.string().datetime().nullable(),
  price: z.string(), // Decimal as string
  rawResponse: z.unknown().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type MessageProcessingResponse = z.infer<
  typeof MessageProcessingResponseSchema
>;
