import {
  MessageResponseSchema,
  SendMessageResponseSchema,
  ChatMessagesListResponseSchema,
  MessagesListResponseSchema,
} from "@shared/contracts/messages";
import { createItemResponseSchema } from "@/utils/responseSchemas";
import fields from "./fields";
import { ResourceConfig } from "@kotoadmin/types/resource";
// import { createListResponseSchema } from "@/utils/responseSchemas";
import MessagesList from "@/components/MessagesList";
import z from "zod";

const key = "messages";

const resource = {
  name: key,
  label: "Messages",
  fields,
  actions: [],

  routes: {
    list: { path: `${key}` },
    chat: { path: `chats/:chatId/${key}`, component: <MessagesList /> },
    // show: { path: `${key}/:id` },
  },

  meta: {
    canRead: false,
  },

  api: {
    chat: {
      path: "/chats/:chatId/messages",
      schema: ChatMessagesListResponseSchema,
    },
    list: {
      path: "/messages",
      schema: MessagesListResponseSchema,
    },
    create: {
      path: "/chats/:chatId/messages",
      schema: z.object({ message: SendMessageResponseSchema }),
    },
    item: {
      path: "/chats/:chatId/messages/:id",
      schema: createItemResponseSchema(MessageResponseSchema),
    },
  },
} satisfies ResourceConfig;

export default resource;
