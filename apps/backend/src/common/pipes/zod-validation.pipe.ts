import { PipeTransform, Injectable, BadRequestException } from "@nestjs/common";
import type { ArgumentMetadata } from "@nestjs/common";
import { z } from "zod";

/**
 * NestJS pipe that validates request body against a Zod schema.
 * Usage: @Body(new ZodValidationPipe(schema)) dto: SchemaType
 */
@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: z.ZodSchema) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    // Only validate body parameters
    if (metadata.type !== "body") {
      return value;
    }

    const result = this.schema.safeParse(value);

    if (!result.success) {
      const errors = this.formatErrors(result.error);
      throw new BadRequestException({
        message: "Validation failed",
        errors,
      });
    }

    return result.data;
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
