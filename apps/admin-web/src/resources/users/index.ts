import { UserResponseSchema } from "@shared/contracts/users";
import { z } from "zod";
import {
  createItemResponseSchema,
  createListResponseSchema,
} from "@/utils/responseSchemas";
import fields from "./fields";
import { Resource } from "@/types/resource";

const resource = {
  name: "users",
  label: "Users",
  fields,
  actions: [],

  // TODO: routes: {
  list: "users",
  create: "users/create",
  edit: "users/edit/:id",
  show: "users/:id",
  // TODO: }

  meta: {
    canDelete: true,
  },

  schemas: {
    list: createListResponseSchema(UserResponseSchema),
    item: createItemResponseSchema(UserResponseSchema),
    create: z.object({ user: UserResponseSchema }),
    update: z.object({ user: UserResponseSchema }),
  },
};

export default resource satisfies Resource;
