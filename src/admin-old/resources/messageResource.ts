import { ComponentLoader, ResourceWithOptions } from "adminjs";
// @ts-expect-error
import { getModelByName } from "@adminjs/prisma";
import prisma from "../../prismaClient";

// icons https://feathericons.com/
export const createMessageResource = (): ResourceWithOptions => ({
  resource: { model: getModelByName("Message"), client: prisma },
  options: {
    listProperties: ["createdAt", "text", "price"],
    sort: {
      sortBy: "createdAt",
      direction: "desc",
    },
  },
});
