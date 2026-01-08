import { Route } from "react-router-dom";
import BaseListPage from "../components/BaseListPage";
import BaseShowPage from "../components/BaseShowPage";
import BaseEditPage from "../components/BaseEditPage";
import BaseCreatePage from "../components/BaseCreatePage";
import type { Field } from "../types/fields";
import { Action } from "@/types/action";

type ResourceConfig = {
  name: string;
  fields: Field[];
  actions: readonly Action[];
};

export const createRoutes = (config: ResourceConfig | ResourceConfig[]) => {
  const resources = Array.isArray(config) ? config : [config];

  return resources.flatMap(({ name, fields, actions }) => [
    <Route
      key={`${name}-list`}
      path={name}
      element={
        <BaseListPage resource={name} fields={fields} actions={actions} />
      }
    />,
    <Route
      key={`${name}-create`}
      path={`${name}/create`}
      element={<BaseCreatePage resource={name} fields={fields} />}
    />,
    <Route
      key={`${name}-edit`}
      path={`${name}/edit/:id`}
      element={<BaseEditPage resource={name} fields={fields} />}
    />,
    <Route
      key={`${name}-show`}
      path={`${name}/:id`}
      element={<BaseShowPage resource={name} fields={fields} />}
    />,
  ]);
};
