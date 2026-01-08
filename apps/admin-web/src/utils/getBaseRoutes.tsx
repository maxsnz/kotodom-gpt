import { Route } from "react-router-dom";
import BaseListPage from "../components/BaseListPage";
import BaseShowPage from "../components/BaseShowPage";
import BaseEditPage from "../components/BaseEditPage";
import BaseCreatePage from "../components/BaseCreatePage";
import { Resource } from "@/types/resource";

const getBaseRoutes = (resource: Resource) => (
  <>
    {resource.list && (
      <Route
        key={`${resource.name}-list`}
        path={resource.list}
        element={<BaseListPage resource={resource} />}
      />
    )}

    {resource.create && (
      <Route
        key={`${resource.name}-create`}
        path={resource.create}
        element={<BaseCreatePage resource={resource} />}
      />
    )}

    {resource.edit && (
      <Route
        key={`${resource.name}-edit`}
        path={resource.edit}
        element={<BaseEditPage resource={resource} />}
      />
    )}

    {resource.show && (
      <Route
        key={`${resource.name}-show`}
        path={resource.show}
        element={<BaseShowPage resource={resource} />}
      />
    )}
  </>
);

export default getBaseRoutes;
