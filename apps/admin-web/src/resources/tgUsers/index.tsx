import {
  createListResponseSchema,
  createItemResponseSchema,
} from "@/utils/responseSchemas";
import { TgUserResponseSchema } from "@shared/contracts/tg-users";
import fields from "./fields";
import { z } from "zod";
import { ActionContext } from "@kotoadmin/types/action";
import { IconMessage } from "@tabler/icons-react";
import { config } from "@/config";
import { ResourceConfig } from "@kotoadmin/types/resource";
import { ChatResponseSchema } from "@shared/contracts/chats";

const key = "tg-users";

const resource = {
  name: key,
  label: "Telegram Users",
  fields,
  actions: [
    {
      name: "View Chats",
      action: async (record: any, context: ActionContext) => {
        context.navigate(`${config.basePath}/tg-users/${record.id}/chats`, {
          replace: true,
        });
      },
      available: (record: any) => {
        return !!record?.id;
      },
      icon: <IconMessage size={16} />,
    },
  ],

  routes: {
    list: { path: `${key}` },
    edit: { path: `${key}/edit/:id` },
    show: { path: `${key}/:id` },
  },

  meta: {
    canDelete: true,
    canRead: true,
    canUpdate: true,
  },

  api: {
    list: {
      path: "/tg-users",
      schema: createListResponseSchema(TgUserResponseSchema),
    },
    item: {
      path: "/tg-users/:id",
      schema: createItemResponseSchema(TgUserResponseSchema),
    },
    update: {
      path: "/tg-users/:id",
      schema: z.object({ user: TgUserResponseSchema }),
    },
    delete: {
      path: "/tg-users/:id",
      schema: z.object({ user: TgUserResponseSchema }),
    },
    chats: {
      path: "/tg-users/:id/chats",
      schema: createListResponseSchema(ChatResponseSchema),
    },
  },
} satisfies ResourceConfig;

export default resource;
