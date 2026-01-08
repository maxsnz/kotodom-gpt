import { z } from "zod";
import { UserRoleSchema, UserStatusSchema } from "../shared/enums";

export const UserResponseSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  role: UserRoleSchema,
  status: UserStatusSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const UsersListResponseSchema = z.object({
  data: z.array(UserResponseSchema),
  total: z.number().int().min(0),
  page: z.number().int().min(1),
  limit: z.number().int().min(1),
  totalPages: z.number().int().min(0),
});

export const UserDetailResponseSchema = z.object({
  user: UserResponseSchema,
});

export const UserCreateResponseSchema = z.object({
  user: UserResponseSchema,
});

export const UserUpdateResponseSchema = z.object({
  user: UserResponseSchema,
});

export const UserDeleteResponseSchema = z.object({
  success: z.boolean(),
});

// Types
export type UserResponse = z.infer<typeof UserResponseSchema>;
export type UsersListResponse = z.infer<typeof UsersListResponseSchema>;
export type UserDetailResponse = z.infer<typeof UserDetailResponseSchema>;
export type UserCreateResponse = z.infer<typeof UserCreateResponseSchema>;
export type UserUpdateResponse = z.infer<typeof UserUpdateResponseSchema>;
export type UserDeleteResponse = z.infer<typeof UserDeleteResponseSchema>;
