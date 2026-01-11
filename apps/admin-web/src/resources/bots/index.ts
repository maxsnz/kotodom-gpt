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
    canCreate: true,
    canUpdate: true,
    canRead: true,
  },

  api: {
    list: {
      path: "/bots",
      schema: createListResponseSchema(BotResponseSchema),
    },
    item: {
      path: "/bots/:id",
      schema: createItemResponseSchema(BotResponseSchema),
    },
    create: { path: "/bots", schema: z.object({ bot: BotResponseSchema }) },
    update: { path: "/bots/:id", schema: z.object({ bot: BotResponseSchema }) },
    delete: { path: "/bots/:id", schema: z.object({ bot: BotResponseSchema }) },
  },
} satisfies ResourceConfig;

export default resource;
