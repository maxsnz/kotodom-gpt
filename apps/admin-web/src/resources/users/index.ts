import { UserResponseSchema } from "@shared/contracts/users";
import { z } from "zod";
import {
  createItemResponseSchema,
  createListResponseSchema,
} from "@/utils/responseSchemas";
import fields from "./fields";
import { ResourceConfig } from "@kotoadmin/types/resource";

const key = "users";

const resource = {
  name: key,
  label: "Users",
  fields,
  actions: [],

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
    list: createListResponseSchema(UserResponseSchema),
    item: createItemResponseSchema(UserResponseSchema),
    create: z.object({ user: UserResponseSchema }),
    update: z.object({ user: UserResponseSchema }),
  },

  api: {
    list: "/users",
    item: "/users/:id",
    create: "/users",
    update: "/users/:id",
  },
} satisfies ResourceConfig;

export default resource;
