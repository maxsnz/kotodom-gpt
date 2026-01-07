import { z } from "zod";

export const UserRoleSchema = z.enum(["ADMIN", "MANAGER", "USER"]);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const UserStatusSchema = z.enum(["ACTIVE", "DISABLED"]);
export type UserStatus = z.infer<typeof UserStatusSchema>;

export const TelegramModeSchema = z.enum(["webhook", "polling"]);
export type TelegramMode = z.infer<typeof TelegramModeSchema>;
