import { ComponentLoader, ResourceWithOptions } from "adminjs";
// @ts-expect-error
import { getModelByName } from "@adminjs/prisma";
import prisma from "../../prismaClient";
import botsManager from "../../bots";

// icons https://feathericons.com/
export const createBotResource = (): ResourceWithOptions => ({
  resource: { model: getModelByName("Bot"), client: prisma },
  options: {
    listProperties: ["id", "name", "isStarted", "createdAt"],
    sort: {
      sortBy: "id",
      direction: "asc",
    },
    actions: {
      new: {
        // @ts-ignore-next-line
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
          const result = await botsManager.initById(
            context.record.params.id,
          );
          return {
            record: context.record.toJSON(context.currentAdmin),
            redirectUrl: context.h.resourceUrl({
              resourceId:
                context.resource._decorated?.id() ||
                context.resource.id(),
            }),
            notice: result
              ? {
                  message: `Bot [${context.record.params.name}] inited`,
                  type: "success",
                }
              : {
                  message: `Error initing bot [${context.record.params.name}]`,
                  type: "error",
                },
          };
        },
      },
      start: {
        icon: "play-outline",
        actionType: "record",
        component: false,
        // guard: "Start?",
        // @ts-ignore-next-line

        handler: async (
          request: any,
          response: any,
          context: {
            record: any;
            resource: any;
            currentAdmin: any;
            h: any;
          },
        ) => {
          const { record, resource, currentAdmin, h } = context;
          const id = record.params.id;
          const name = record.params.name;
          const result = await botsManager.startById(id);
          return {
            record: record.toJSON(currentAdmin),
            redirectUrl: h.resourceUrl({
              resourceId: resource._decorated?.id() || resource.id(),
            }),
            notice: result
              ? {
                  message: `Bot [${name}] started`,
                  type: "success",
                }
              : {
                  message: `Error starting bot [${name}]`,
                  type: "error",
                },
          };
        },
        // @ts-ignore-next-line

        isVisible: ({ record }: { record: { params: Bot } }) =>
          !record.params.isStarted,
      },
      stop: {
        icon: "stop-circle",
        actionType: "record",
        component: false,
        // guard: "Reject?",
        // @ts-ignore-next-line

        handler: async (
          request: any,
          response: any,
          context: {
            record: any;
            resource: any;
            currentAdmin: any;
            h: any;
          },
        ) => {
          const { record, resource, currentAdmin, h } = context;
          const id = record.params.id;
          const name = record.params.name;
          const result = await botsManager.stopById(id);
          return {
            record: record.toJSON(currentAdmin),
            redirectUrl: h.resourceUrl({
              resourceId: resource._decorated?.id() || resource.id(),
            }),
            notice: result
              ? {
                  message: `Bot [${name}] stopped`,
                  type: "success",
                }
              : {
                  message: `Error stopping bot [${name}]`,
                  type: "error",
                },
          };
        },
        // @ts-ignore-next-line

        isVisible: ({ record }: { record: { params: Bot } }) =>
          record.params.isStarted,
      },
    },
  },
});
