import { z } from "zod";

// Schema for list responses (array of items)
export const createListResponseSchema = <T extends z.ZodType>(itemSchema: T) =>
  z.object({
    data: z.array(itemSchema),
    total: z.number().optional(),
    meta: z.record(z.string(), z.unknown()).optional(),
  });

// Schema for single item responses
export const createItemResponseSchema = <T extends z.ZodType>(itemSchema: T) =>
  z.object({
    data: itemSchema,
  });
