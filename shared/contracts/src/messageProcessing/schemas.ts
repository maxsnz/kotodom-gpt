import { z } from "zod";
import { MessageProcessingStatusSchema } from "../shared/enums";

export const MessageProcessingFiltersSchema = z.object({
  status: z
    .string()
    .optional()
    .transform((val): string | string[] | undefined => {
      if (!val) return undefined;
      // Support comma-separated statuses: "FAILED,TERMINAL"
      if (val.includes(",")) {
        const statuses = val
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s.length > 0);
        // Validate each status
        const validStatuses = statuses.filter(
          (s) => MessageProcessingStatusSchema.safeParse(s).success
        );
        return validStatuses.length > 0 ? validStatuses : undefined;
      }
      // Single status - validate it
      if (MessageProcessingStatusSchema.safeParse(val).success) {
        return val;
      }
      return undefined;
    }),
  userMessageId: z.number().int().optional(),
});

export const MessageProcessingPaginationSchema = z.object({
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(20),
});

/**
 * Combined schema for query parameters (filters + pagination)
 */
export const MessageProcessingQuerySchema =
  MessageProcessingFiltersSchema.merge(MessageProcessingPaginationSchema);
