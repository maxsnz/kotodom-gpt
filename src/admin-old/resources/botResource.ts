import { ComponentLoader, ResourceWithOptions } from "adminjs";
import { getModelByName } from "@adminjs/prisma";
import prisma from "../../prismaClient";
import botsManager from "../../bots";
import { AdminJSHandler } from "../../types/adminjs";

// icons https://feathericons.com/
// Available OpenAI models (excluding very expensive ones)
const AVAILABLE_MODELS = [
  { value: "gpt-4o-mini", label: "GPT-4o Mini (Cheapest)" },
  { value: "gpt-4.1-nano", label: "GPT-4.1 Nano" },
  { value: "gpt-4.1-mini", label: "GPT-4.1 Mini" },
  { value: "gpt-4o", label: "GPT-4o (High Quality)" },
  { value: "gpt-4.1", label: "GPT-4.1 (Premium)" },
  { value: "gpt-5-nano", label: "GPT-5 Nano (Latest)" },
  { value: "gpt-5-mini", label: "GPT-5 Mini (Latest)" },
];

export const createBotResource = (): ResourceWithOptions => ({
  resource: { model: getModelByName("Bot"), client: prisma },
  options: {
    listProperties: ["id", "name", "model", "isStarted", "createdAt"],
    sort: {
      sortBy: "id",
      direction: "asc",
    },
    properties: {
      model: {
        availableValues: AVAILABLE_MODELS,
        isVisible: {
          list: true,
          filter: true,
          show: true,
          edit: true,
        },
      },
    },
    actions: {
      new: {
        // @ts-ignore-next-line
        after: async (
          request: unknown,
          response: unknown,
          context: {
            record: {
              params: { id: number; name: string };
              toJSON: (admin: unknown) => unknown;
            };
            resource: {
              _decorated?: { id: () => string };
              id: () => string;
            };
            currentAdmin: unknown;
            h: {
              resourceUrl: (options: { resourceId: string }) => string;
            };
          }
        ) => {
          const result = await botsManager.initById(context.record.params.id);
          return {
            record: context.record.toJSON(context.currentAdmin),
            redirectUrl: context.h.resourceUrl({
              resourceId:
                context.resource._decorated?.id() || context.resource.id(),
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
          request: unknown,
          response: unknown,
          context: {
            record: {
              params: { id: number; name: string };
              toJSON: (admin: unknown) => unknown;
            };
            resource: {
              _decorated?: { id: () => string };
              id: () => string;
            };
            currentAdmin: unknown;
            h: {
              resourceUrl: (options: { resourceId: string }) => string;
            };
          }
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
          request: unknown,
          response: unknown,
          context: {
            record: {
              params: { id: number; name: string };
              toJSON: (admin: unknown) => unknown;
            };
            resource: {
              _decorated?: { id: () => string };
              id: () => string;
            };
            currentAdmin: unknown;
            h: {
              resourceUrl: (options: { resourceId: string }) => string;
            };
          }
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
