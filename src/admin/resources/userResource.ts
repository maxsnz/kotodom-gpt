import { ComponentLoader, ResourceWithOptions } from "adminjs";
// @ts-expect-error
import { getModelByName } from "@adminjs/prisma";
import prisma from "../../prismaClient";

export const createUserResource = (): ResourceWithOptions => ({
  resource: { model: getModelByName("User"), client: prisma },
  options: {},
});
