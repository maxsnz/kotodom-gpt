import { z } from "zod";
import { BotResponseSchema } from "@shared/contracts/bots";
import { UserResponseSchema } from "@shared/contracts/users";
import {
  ChatResponseSchema,
  MessageResponseSchema,
} from "@shared/contracts/chats";

// Schema for list responses (array of items)
const createListResponseSchema = <T extends z.ZodType>(itemSchema: T) =>
  z.object({
    data: z.array(itemSchema),
    total: z.number().optional(),
    meta: z.record(z.string(), z.unknown()).optional(),
  });

// Schema for single item responses
const createItemResponseSchema = <T extends z.ZodType>(itemSchema: T) =>
  z.object({
    data: itemSchema,
  });

// Schema for create/update responses (wrapped in object)
// TODO: ?? not used
const createWrappedResponseSchema = <T extends z.ZodType>(itemSchema: T) =>
  z.object({
    bot: itemSchema.optional(),
    user: itemSchema.optional(),
  });

export const responseSchemas = {
  // List responses
  bots: {
    list: createListResponseSchema(BotResponseSchema),
    item: createItemResponseSchema(BotResponseSchema),
    create: z.object({ bot: BotResponseSchema }),
    update: z.object({ bot: BotResponseSchema }),
  },
  users: {
    list: createListResponseSchema(UserResponseSchema),
    item: createItemResponseSchema(UserResponseSchema),
    create: z.object({ user: UserResponseSchema }),
    update: z.object({ user: UserResponseSchema }),
  },
  chats: {
    list: createListResponseSchema(ChatResponseSchema),
    item: createItemResponseSchema(ChatResponseSchema),
    messages: createListResponseSchema(MessageResponseSchema),
  },
} as const;

export type ResponseSchemas = typeof responseSchemas;
