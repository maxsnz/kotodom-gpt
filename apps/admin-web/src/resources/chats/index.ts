import { ChatResponseSchema } from "@shared/contracts/chats";
import { createItemResponseSchema } from "@/utils/responseSchemas";
import fields from "./fields";
import { Resource } from "@kotoadmin/types/resource";
import { createListResponseSchema } from "@/utils/responseSchemas";

const resource = {
  name: "chats",
  label: "Chats",
  fields,
  actions: [],

  routes: {
    list: "chats",
    create: "chats/create",
    edit: "chats/edit/:id",
    show: "chats/:id",
  },

  meta: {
    canDelete: true,
  },

  schemas: {
    list: createListResponseSchema(ChatResponseSchema),
    item: createItemResponseSchema(ChatResponseSchema),
  },
};

export default resource satisfies Resource;
