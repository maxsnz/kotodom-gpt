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
    canDelete: false,
  },

  schemas: {
    list: createListResponseSchema(MessageProcessingResponseSchema),
    item: createItemResponseSchema(MessageProcessingResponseSchema),
  },

  api: {
    list: "/message-processing",
    item: "/message-processing/:id",
  },
} satisfies ResourceConfig;

export default resource;
