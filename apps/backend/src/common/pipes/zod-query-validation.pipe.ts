import { PipeTransform, Injectable, BadRequestException } from "@nestjs/common";
import type { ArgumentMetadata } from "@nestjs/common";
import { z } from "zod";

/**
 * NestJS pipe that validates query parameters against a Zod schema.
 * Automatically converts string query params to appropriate types (numbers, booleans, etc.)
 * Usage: @Query(new ZodQueryValidationPipe(schema)) dto: SchemaType
 */
@Injectable()
export class ZodQueryValidationPipe implements PipeTransform {
  constructor(private schema: z.ZodSchema) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    // Only validate query parameters
    if (metadata.type !== "query") {
      return value;
    }

    // Query parameters come as strings from URL, need to preprocess them
    const preprocessed = this.preprocessQueryParams(value as Record<string, unknown>);

    const result = this.schema.safeParse(preprocessed);

    if (!result.success) {
      const errors = this.formatErrors(result.error);
      throw new BadRequestException({
        message: "Query validation failed",
        errors,
      });
    }

    return result.data;
  }

  /**
   * Preprocess query parameters: convert string numbers to numbers, string booleans to booleans
   */
  private preprocessQueryParams(
    params: Record<string, unknown>
  ): Record<string, unknown> {
    const processed: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null || value === "") {
        continue; // Skip empty values, let Zod handle optional/defaults
      }

      // Try to convert to number if it looks like a number
      if (typeof value === "string" && /^-?\d+$/.test(value)) {
        const num = parseInt(value, 10);
        if (!Number.isNaN(num)) {
          processed[key] = num;
          continue;
        }
      }

      // Try to convert to boolean
      if (typeof value === "string" && (value === "true" || value === "false")) {
        processed[key] = value === "true";
        continue;
      }

      // Keep as string for enum/string validation
      processed[key] = value;
    }

    return processed;
  }

  private formatErrors(error: z.ZodError): Record<string, string[]> {
    const errors: Record<string, string[]> = {};

    for (const issue of error.issues) {
      const path = issue.path.join(".") || "root";
      if (!errors[path]) {
        errors[path] = [];
      }
      errors[path].push(issue.message);
    }

    return errors;
  }
}