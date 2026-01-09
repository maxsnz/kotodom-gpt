import {
  createListResponseSchema,
  createItemResponseSchema,
} from "@/utils/responseSchemas";
import { TgUserResponseSchema } from "@shared/contracts/tg-users";
import fields from "./fields";
import { z } from "zod";
import { Resource } from "@kotoadmin/types/resource";

const resource = {
  name: "tg-users",
  label: "Telegram Users",
  fields,
  actions: [],

  routes: {
    list: "tg-users",
    edit: "tg-users/edit/:id",
    show: "tg-users/:id",
  },

  meta: {
    canDelete: true,
  },

  schemas: {
    list: createListResponseSchema(TgUserResponseSchema),
    item: createItemResponseSchema(TgUserResponseSchema),
    update: z.object({ user: TgUserResponseSchema }),
  },
};

export default resource satisfies Resource;
