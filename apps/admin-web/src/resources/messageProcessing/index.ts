import { MessageProcessingResponseSchema } from "@shared/contracts/messageProcessing";
import fields from "./fields";
import { ResourceConfig } from "@kotoadmin/types/resource";
import {
  createListResponseSchema,
  createItemResponseSchema,
} from "@/utils/responseSchemas";

const key = "message-processing";

const resource = {
  name: key,
  label: "Messages Processing",
  fields,
  actions: [],

  routes: {
    list: { path: `${key}` },
    show: { path: `${key}/:id` },
  },

  meta: {
    canRead: true,
  },

  api: {
    list: {
      path: "/message-processing",
      schema: createListResponseSchema(MessageProcessingResponseSchema),
    },
    item: {
      path: "/message-processing/:id",
      schema: createItemResponseSchema(MessageProcessingResponseSchema),
    },
  },
} satisfies ResourceConfig;

export default resource;
