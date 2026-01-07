import { z } from "zod";
import { UserRoleSchema, UserStatusSchema } from "../shared/enums";

export const LoginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export const CreateUserSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: UserRoleSchema,
});

export const UpdateUserSchema = z.object({
  email: z.string().email("Invalid email format").optional(),
  password: z.string().min(8, "Password must be at least 8 characters").optional(),
  role: UserRoleSchema.optional(),
  status: UserStatusSchema.optional(),
});
