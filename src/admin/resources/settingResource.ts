import { ComponentLoader, ResourceWithOptions } from "adminjs";
// @ts-expect-error
import { getModelByName } from "@adminjs/prisma";
import prisma from "../../prismaClient";
import gpt from "../../gpt";

// icons https://feathericons.com/
export const createSettingResource = (): ResourceWithOptions => ({
  resource: { model: getModelByName("Setting"), client: prisma },
  options: {
    properties: {
      id: {
        type: "string",
        isVisible: {
          edit: true,
          show: true,
          list: true,
          filter: true,
        },
      },
    },
    actions: {
      edit: {
        // @ts-expect-error
        after: async (
          request: any,
          response: any,
          context: {
            record: any;
            resource: any;
            currentAdmin: any;
            h: any;
          },
        ) => {
          const { record } = context;
          if (record.params.id === "PROXY_URL") {
            await gpt.updateProxyUrl(record.params.value);
          }
          return {
            record: record.toJSON(context.currentAdmin),
            redirectUrl: context.h.resourceUrl({
              resourceId:
                context.resource._decorated?.id() ||
                context.resource.id(),
            }),
            notice: {
              message: "Setting updated",
              type: "success",
            },
          };
        },
      },
    },
  },
});
