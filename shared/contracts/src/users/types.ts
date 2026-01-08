import { z } from "zod";
import {
  CreateUserSchema,
  UpdateUserSchema,
  UserFiltersSchema,
  UserPaginationSchema,
} from "./schemas";

export type CreateUserDto = z.infer<typeof CreateUserSchema>;
export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
export type UserFiltersDto = z.infer<typeof UserFiltersSchema>;
export type UserPaginationDto = z.infer<typeof UserPaginationSchema>;
