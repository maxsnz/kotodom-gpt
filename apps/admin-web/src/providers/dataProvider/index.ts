import dataProviderBase from "@refinedev/nestjsx-crud";
import type { DataProvider } from "@refinedev/core";
import { createCreate } from "./create";
import { createUpdate } from "./update";
import { createGetOne } from "./getOne";
import { createGetList } from "./getList";

export const dataProvider = (apiUrl: string): DataProvider => {
  const baseDataProvider = dataProviderBase(apiUrl);

  return {
    ...baseDataProvider,
    create: createCreate(apiUrl),
    update: createUpdate(apiUrl),
    getOne: createGetOne(apiUrl),
    getList: createGetList(apiUrl),
  };
};
