import { z } from "zod";

/**
 * Schema for creating/updating settings
 * Accepts an object with key-value pairs (at least one key required)
 */
export const UpdateSettingsSchema = z
  .record(z.string(), z.string())
  .refine((obj) => Object.keys(obj).length > 0, {
    message: "At least one setting must be provided",
  });

/**
 * Schema for a single setting id-value pair
 */
export const SettingItemSchema = z.object({
  id: z.string().min(1, "Id cannot be empty"),
  value: z.string(),
});
