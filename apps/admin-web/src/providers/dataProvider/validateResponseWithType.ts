import { validateResponse } from "@/utils/validateResponse";
import { z } from "zod";

// Helper function to validate response with proper typing
export const validateResponseWithType = <T>(
  schema: z.ZodTypeAny | undefined,
  data: unknown
): T => {
  if (!schema) {
    throw new Error("Schema is required");
  }
  return validateResponse(schema, data) as T;
};
