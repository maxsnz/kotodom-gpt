import { ComponentLoader, ResourceWithOptions } from "adminjs";
// @ts-expect-error
import { getModelByName } from "@adminjs/prisma";
import prisma from "../../prismaClient";
import Components from "../components";

export const createUserResource = (): ResourceWithOptions => ({
  resource: { model: getModelByName("User"), client: prisma },
  options: {
    actions: {
      showChats: {
        icon: "MessageSquare",
        actionType: "record",
        component: Components.ShowUserChats,
        handler: async (request, response, context) => {
          if (!context.record) {
            throw new Error("Record not found");
          }
          return {
            record: context.record.toJSON(context.currentAdmin),
          };
        },
      },
    },
  },
});
