import { z } from "zod";

export const UpdateTgUserSchema = z.object({
  username: z.string().nullable().optional(),
  name: z.string().nullable().optional(),
  fullName: z.string().nullable().optional(),
});