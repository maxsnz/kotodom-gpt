import { z } from "zod";

export const UserRoleSchema = z.enum(["ADMIN", "MANAGER", "USER"]);
export const UserStatusSchema = z.enum(["ACTIVE", "DISABLED"]);

export const UpdateUserSchema = z.object({
  email: z.string().email("Invalid email format").optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .optional(),
  role: UserRoleSchema.optional(),
  status: UserStatusSchema.optional(),
});

export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
