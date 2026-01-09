import fields from "./fields";
import { ResourceConfig } from "@kotoadmin/types/resource";
import { botActions } from "./actions";
import { z } from "zod";
import { BotResponseSchema } from "@shared/contracts/bots";
import {
  createListResponseSchema,
  createItemResponseSchema,
} from "@/utils/responseSchemas";

const key = "bots";

const resource = {
  name: key,
  label: "Bots",
  fields,
  actions: botActions,

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
    list: createListResponseSchema(BotResponseSchema),
    item: createItemResponseSchema(BotResponseSchema),
    create: z.object({ bot: BotResponseSchema }),
    update: z.object({ bot: BotResponseSchema }),
  },

  api: {
    list: "/bots",
    item: "/bots/:id",
    create: "/bots",
    update: "/bots/:id",
  },
} satisfies ResourceConfig;

export default resource;
