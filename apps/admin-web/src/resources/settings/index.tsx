import {
  createListResponseSchema,
  createItemResponseSchema,
} from "@/utils/responseSchemas";
import { ResourceConfig } from "@kotoadmin/types/resource";
import { SettingItemSchema } from "@shared/contracts/settings";
import { z } from "zod";
import SettingsList from "@/components/SettingsList";

const key = "settings";

const resource = {
  name: key,
  label: "Settings",
  fields: [],
  actions: [],

  routes: {
    list: { path: `${key}`, component: <SettingsList /> },
  },

  meta: {
    canRead: true,
    canCreate: true,
    canUpdate: true,
    canDelete: true,
  },

  api: {
    list: {
      path: "/settings",
      schema: createListResponseSchema(SettingItemSchema),
    },
    item: {
      path: "/settings/:id",
      schema: createItemResponseSchema(SettingItemSchema),
    },
    create: {
      path: "/settings",
      schema: createListResponseSchema(SettingItemSchema),
    },
    update: {
      path: "/settings",
      schema: createListResponseSchema(SettingItemSchema),
    },
    delete: {
      path: "/settings/:id",
      schema: z.object({ success: z.boolean() }),
    },
  },
} satisfies ResourceConfig;

export default resource;
