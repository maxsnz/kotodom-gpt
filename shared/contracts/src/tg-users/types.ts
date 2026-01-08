import { z } from "zod";
import { UpdateTgUserSchema } from "./schemas";

export type UpdateTgUserDto = z.infer<typeof UpdateTgUserSchema>;