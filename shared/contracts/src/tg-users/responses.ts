import { z } from "zod";

export const TgUserResponseSchema = z.object({
  id: z.string(),
  username: z.string().nullable(),
  name: z.string().nullable(),
  fullName: z.string().nullable(),
  createdAt: z.string().datetime(),
});

export const TgUsersListResponseSchema = z.object({
  data: z.array(TgUserResponseSchema),
});

export const TgUserDetailResponseSchema = z.object({
  data: TgUserResponseSchema,
});

export const TgUserUpdateResponseSchema = z.object({
  data: TgUserResponseSchema,
});

export const TgUserDeleteResponseSchema = z.object({
  success: z.boolean(),
});

// Types
export type TgUserResponse = z.infer<typeof TgUserResponseSchema>;
export type TgUsersListResponse = z.infer<typeof TgUsersListResponseSchema>;
export type TgUserDetailResponse = z.infer<typeof TgUserDetailResponseSchema>;
export type TgUserUpdateResponse = z.infer<typeof TgUserUpdateResponseSchema>;
export type TgUserDeleteResponse = z.infer<typeof TgUserDeleteResponseSchema>;