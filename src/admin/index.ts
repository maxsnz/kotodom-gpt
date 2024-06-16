import { Bot } from "@prisma/client";
// @ts-ignore-next-line
import { Database, Resource, getModelByName } from "@adminjs/prisma";
import prisma from "../prismaClient";
import botsManager from "../bots";

export const adminOptions = {
  resources: [
    {
      resource: { model: getModelByName("User"), client: prisma },
      options: {},
    },
    {
      resource: { model: getModelByName("Bot"), client: prisma },
      options: {
        actions: {
          new: {
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
                  resourceId:
                    resource._decorated?.id() || resource.id(),
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
            isVisible: ({ record }: { record: { params: Bot } }) =>
              !record.params.isStarted,
          },
          stop: {
            icon: "stop-circle",
            actionType: "record",
            component: false,
            // guard: "Reject?",
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
                  resourceId:
                    resource._decorated?.id() || resource.id(),
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
            isVisible: ({ record }: { record: { params: Bot } }) =>
              record.params.isStarted,
          },
        },
      },
    },
    {
      resource: { model: getModelByName("Chat"), client: prisma },
      options: {},
    },
    {
      resource: { model: getModelByName("Message"), client: prisma },
      options: {},
    },
    {
      resource: { model: getModelByName("Setting"), client: prisma },
      options: {
        properties: {
          id: {
            type: "string",
            isVisible: {
              // new: true,
              edit: true,
              show: true,
              list: true,
              filter: true,
            },
          },
        },
      },
    },
  ],
};
