import { z } from "zod";
import { CreateBotSchema, UpdateBotSchema } from "./schemas";

export type CreateBotDto = z.infer<typeof CreateBotSchema>;
export type UpdateBotDto = z.infer<typeof UpdateBotSchema>;
