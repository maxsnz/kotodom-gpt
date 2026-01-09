import { MessageProcessingResponseSchema } from "@shared/contracts/messageProcessing";
import fields from "./fields";
import { Resource } from "@kotoadmin/types/resource";
import {
  createListResponseSchema,
  createItemResponseSchema,
} from "@/utils/responseSchemas";

const resource = {
  name: "message-processing",
  label: "Messages Processing",
  fields,
  actions: [],

  routes: {
    list: "message-processing",
    show: "message-processing/:id",
  },

  meta: {
    canDelete: false,
  },

  schemas: {
    list: createListResponseSchema(MessageProcessingResponseSchema),
    item: createItemResponseSchema(MessageProcessingResponseSchema),
  },
};

export default resource satisfies Resource;
