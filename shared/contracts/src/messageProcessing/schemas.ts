import { z } from "zod";
import { MessageProcessingStatusSchema } from "../shared/enums";

export const MessageProcessingFiltersSchema = z.object({
  status: MessageProcessingStatusSchema.optional(),
  userMessageId: z.number().int().optional(),
});

export const MessageProcessingPaginationSchema = z.object({
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(20),
});

/**
 * Combined schema for query parameters (filters + pagination)
 */
export const MessageProcessingQuerySchema = MessageProcessingFiltersSchema.merge(
  MessageProcessingPaginationSchema
);