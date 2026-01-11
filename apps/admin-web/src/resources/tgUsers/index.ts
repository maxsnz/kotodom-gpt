import {
  createListResponseSchema,
  createItemResponseSchema,
} from "@/utils/responseSchemas";
import { TgUserResponseSchema } from "@shared/contracts/tg-users";
import fields from "./fields";
import { z } from "zod";
import { ResourceConfig } from "@kotoadmin/types/resource";

const key = "tg-users";

const resource = {
  name: key,
  label: "Telegram Users",
  fields,
  actions: [],

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
  },
} satisfies ResourceConfig;

export default resource;
