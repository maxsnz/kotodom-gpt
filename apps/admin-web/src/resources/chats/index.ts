import { ChatResponseSchema } from "@shared/contracts/chats";
import { createItemResponseSchema } from "@/utils/responseSchemas";
import fields from "./fields";
import { ResourceConfig } from "@kotoadmin/types/resource";
import { createListResponseSchema } from "@/utils/responseSchemas";
import z from "zod";

const key = "chats";

const resource = {
  name: key,
  label: "Chats",
  fields,
  actions: [],

  routes: {
    list: { path: `${key}` },
    create: { path: `${key}/create` },
    edit: { path: `${key}/edit/:id` },
    show: { path: `${key}/:id` },
  },

  meta: {
    canDelete: true,
  },

  schemas: {
    list: createListResponseSchema(ChatResponseSchema),
    item: createItemResponseSchema(ChatResponseSchema),
    update: z.object({ chat: ChatResponseSchema }),
  },

  api: {
    list: "/chats",
    item: "/chats/:id",
    update: "/chats/:id",
  },
} satisfies ResourceConfig;

export default resource;
