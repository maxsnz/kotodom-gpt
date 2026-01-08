import { z } from "zod";
import { UserRoleSchema, UserStatusSchema } from "../shared/enums";

export const CreateUserSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: UserRoleSchema,
  status: UserStatusSchema.optional().default("ACTIVE"),
});

export const UpdateUserSchema = z.object({
  email: z.string().email("Invalid email format").optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .optional(),
  role: UserRoleSchema.optional(),
  status: UserStatusSchema.optional(),
});

export const UserFiltersSchema = z.object({
  role: UserRoleSchema.optional(),
  status: UserStatusSchema.optional(),
  email: z.string().optional(),
});

export const UserPaginationSchema = z.object({
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(20),
});
