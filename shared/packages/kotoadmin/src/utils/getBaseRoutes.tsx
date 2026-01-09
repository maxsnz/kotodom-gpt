import { Route } from "react-router-dom";
import BaseListPage from "../components/BaseListPage";
import BaseShowPage from "../components/BaseShowPage";
import BaseEditPage from "../components/BaseEditPage";
import BaseCreatePage from "../components/BaseCreatePage";
import { Resource } from "../types/resource";

const getBaseRoutes = (resource: Resource) => (
  <>
    {resource.routes.list && (
      <Route
        key={`${resource.name}-list`}
        path={resource.routes.list}
        element={<BaseListPage resource={resource} />}
      />
    )}

    {resource.routes.create && (
      <Route
        key={`${resource.name}-create`}
        path={resource.routes.create}
        element={<BaseCreatePage resource={resource} />}
      />
    )}

    {resource.routes.edit && (
      <Route
        key={`${resource.name}-edit`}
        path={resource.routes.edit}
        element={<BaseEditPage resource={resource} />}
      />
    )}

    {resource.routes.show && (
      <Route
        key={`${resource.name}-show`}
        path={resource.routes.show}
        element={<BaseShowPage resource={resource} />}
      />
    )}
  </>
);

export default getBaseRoutes;
