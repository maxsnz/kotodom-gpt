import { z } from "zod";
import { UserRoleSchema } from "../shared/enums";

export const LoginResponseSchema = z.object({
  user: z.object({
    id: z.string(),
    email: z.string(),
    role: UserRoleSchema,
  }),
});

export const LogoutResponseSchema = z.object({
  success: z.boolean(),
});

export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type LogoutResponse = z.infer<typeof LogoutResponseSchema>;
