import fields from "./fields";
import { Resource } from "@kotoadmin/types/resource";
import { botActions } from "./actions";
import { z } from "zod";
import { BotResponseSchema } from "@shared/contracts/bots";
import {
  createListResponseSchema,
  createItemResponseSchema,
} from "@/utils/responseSchemas";

const resource = {
  name: "bots",
  label: "Bots",
  fields,
  actions: botActions,

  routes: {
    list: "bots",
    create: "bots/create",
    edit: "bots/edit/:id",
    show: "bots/:id",
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
};

export default resource satisfies Resource;
