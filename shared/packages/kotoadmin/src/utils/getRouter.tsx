import { Route } from "react-router-dom";
import BaseListPage from "../components/BaseListPage";
import BaseShowPage from "../components/BaseShowPage";
import BaseEditPage from "../components/BaseEditPage";
import BaseCreatePage from "../components/BaseCreatePage";
import { Resource } from "../types/resource";
import ResourceStore from "./resourceStore";

const getRouter = (resource: Resource, resourceStore: ResourceStore) => (
  <>
    {Object.keys(resource.routes).map((key) => {
      const route = resource.routes[key];
      if (route.component) {
        return (
          <Route
            key={`${resource.name}-${key}`}
            path={route.path}
            element={route.component}
          />
        );
      } else if (key === "list") {
        return (
          <Route
            key={`${resource.name}-${key}`}
            path={route.path}
            element={<BaseListPage resource={resource} />}
          />
        );
      } else if (key === "create") {
        return (
          <Route
            key={`${resource.name}-${key}`}
            path={route.path}
            element={<BaseCreatePage resource={resource} />}
          />
        );
      } else if (key === "edit") {
        return (
          <Route
            key={`${resource.name}-${key}`}
            path={route.path}
            element={<BaseEditPage resource={resource} />}
          />
        );
      } else if (key === "show") {
        return (
          <Route
            key={`${resource.name}-${key}`}
            path={route.path}
            element={
              <BaseShowPage resource={resource} resourceStore={resourceStore} />
            }
          />
        );
      } else return null;
    })}
  </>
);

export default getRouter;
