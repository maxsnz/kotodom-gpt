import { z } from "zod";

/**
 * Validates API response data against a Zod schema.
 * Logs validation errors and throws if validation fails.
 *
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Validated data with correct TypeScript type
 * @throws Error if validation fails
 */
export function validateResponse<T extends z.ZodType>(
  schema: T,
  data: unknown
): z.infer<T> {
  const result = schema.safeParse(data);
  if (!result.success) {
    try {
      const parsedErrors = JSON.parse(result.error.message);
      console.error("Response validation failed:", {
        errors: parsedErrors,
        data,
      });
    } catch {
      // fallback to original
      console.error("Response validation failed:", {
        errors: result.error.message,
        data,
      });
    }
    throw new Error(
      `Invalid response format from server: ${result.error.message}`
    );
  }
  return result.data;
}
