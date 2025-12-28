import { ComponentLoader, ResourceWithOptions } from "adminjs";
// @ts-expect-error
import { getModelByName } from "@adminjs/prisma";
import prisma from "../../prismaClient";
import Components from "../components";
import botsManager from "../../bots";

// icons https://feathericons.com/
export const createChatResource = (): ResourceWithOptions => ({
  resource: { model: getModelByName("Chat"), client: prisma },
  options: {
    sort: {
      sortBy: "createdAt",
      direction: "desc",
    },
    actions: {
      sendMessage: {
        icon: "MessageSquare",
        actionType: "record",
        component: Components.SendMessage,
        handler: async (request, response, context) => {
          if (!context.record) {
            throw new Error("Record not found");
          }
          return {
            record: context.record.toJSON(context.currentAdmin),
          };
        },
      },
      refreshThread: {
        icon: "Feather",
        actionType: "record",
        component: false,
        guard: "Refresh?",
        // @ts-ignore-next-line
        handler: async (
          request: any,
          response: any,
          context: {
            record: any;
            resource: any;
            currentAdmin: any;
            h: any;
          }
        ) => {
          const { record, resource, currentAdmin, h } = context;
          const id = record.params.id;

          await prisma.chat.update({
            where: {
              id,
            },
            data: {
              threadId: "",
            },
          });

          return {
            record: record.toJSON(currentAdmin),
            redirectUrl: h.resourceUrl({
              resourceId: resource._decorated?.id() || resource.id(),
            }),
            notice: {
              message: `Refreshed`,
              type: "success",
            },
          };
        },
      },
      showMessages: {
        icon: "Archive",
        actionType: "record",
        component: Components.ShowMessages,
        handler: async (request, response, context) => {
          return {
            record: context.record?.toJSON(context.currentAdmin),
          };
        },
      },
    },
  },
});
