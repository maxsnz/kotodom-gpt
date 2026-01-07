import { z } from "zod";
import { LoginSchema, CreateUserSchema, UpdateUserSchema } from "./schemas";

export type LoginDto = z.infer<typeof LoginSchema>;
export type CreateUserDto = z.infer<typeof CreateUserSchema>;
export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
