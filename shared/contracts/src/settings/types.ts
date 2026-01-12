import { z } from "zod";
import { UpdateSettingsSchema } from "./schemas";

export type UpdateSettingsDto = z.infer<typeof UpdateSettingsSchema>;
