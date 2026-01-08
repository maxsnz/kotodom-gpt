import { z } from "zod";
import { LoginSchema } from "./schemas";

export type LoginDto = z.infer<typeof LoginSchema>;
