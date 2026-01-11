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
    canCreate: true,
    canUpdate: true,
    canRead: true,
  },

  api: {
    list: {
      path: "/users",
      schema: createListResponseSchema(UserResponseSchema),
    },
    item: {
      path: "/users/:id",
      schema: createItemResponseSchema(UserResponseSchema),
    },
    create: { path: "/users", schema: z.object({ user: UserResponseSchema }) },
    update: {
      path: "/users/:id",
      schema: z.object({ user: UserResponseSchema }),
    },
    delete: {
      path: "/users/:id",
      schema: z.object({ user: UserResponseSchema }),
    },
  },
} satisfies ResourceConfig;

export default resource;
