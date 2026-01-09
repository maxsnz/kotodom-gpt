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
  },

  schemas: {
    list: createListResponseSchema(TgUserResponseSchema),
    item: createItemResponseSchema(TgUserResponseSchema),
    update: z.object({ user: TgUserResponseSchema }),
  },

  api: {
    list: "/tg-users",
    item: "/tg-users/:id",
    update: "/tg-users/:id",
  },
} satisfies ResourceConfig;

export default resource;
