import { z } from "zod";

export const UserRoleSchema = z.enum(["ADMIN", "MANAGER", "USER"]);

export const CreateUserSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: UserRoleSchema,
});

export type CreateUserDto = z.infer<typeof CreateUserSchema>;

