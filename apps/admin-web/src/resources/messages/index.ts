import {
  MessageResponseSchema,
  SendMessageResponseSchema,
} from "@shared/contracts/messages";
import { createItemResponseSchema } from "@/utils/responseSchemas";
import fields from "./fields";
import { ResourceConfig } from "@kotoadmin/types/resource";
import { createListResponseSchema } from "@/utils/responseSchemas";
import z from "zod";

const key = "messages";

const resource = {
  name: key,
  label: "Messages",
  fields,
  actions: [],

  routes: {
    list: { path: `chats/:chatId/${key}` },
    create: { path: `chats/:chatId/${key}/create` },
    edit: { path: `chats/:chatId/${key}/edit/:id` },
    show: { path: `chats/:chatId/${key}/:id` },
  },

  meta: {
    canDelete: false,
  },

  schemas: {
    list: createListResponseSchema(MessageResponseSchema),
    create: z.object({ message: SendMessageResponseSchema }),
    item: createItemResponseSchema(MessageResponseSchema),
  },

  api: {
    list: "/chats/:chatId/messages",
    create: "/chats/:chatId/messages",
    item: "/chats/:chatId/messages/:id",
  },
} satisfies ResourceConfig;

export default resource;
