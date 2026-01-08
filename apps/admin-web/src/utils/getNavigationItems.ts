import { Resource } from "@/types/resource";

// Helper function to get navigation items
export const getNavigationItems = (resources: Resource[]) => {
  return resources.map((resource) => ({
    name: resource.name,
    label: resource.label,
    path: `/cp/${resource.list}`,
  }));
};
