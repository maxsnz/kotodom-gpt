import { userFields } from "./users/fields";
import { botFields } from "./bots/fields";
import { chatFields } from "./chats/fields";
// import { messageFields } from "./messages/fields";
import createResource from "../utils/createResource";
import type { Field } from "../types/fields";
import { botActions } from "./bots/actions";

export type ResourceDefinition = {
  name: string;
  fields: Field[];
};

/**
 * Central registry of all resources in the application.
 *
 * To add a new resource:
 * 1. Create a new folder in resources/ (e.g., resources/admins/)
 * 2. Create fields.ts file with your field definitions (e.g., resources/admins/fields.ts)
 * 3. Import the fields here
 * 4. Add the resource to the resources object below
 *
 * Example:
 * ```typescript
 * import { adminFields } from "./admins/fields";
 *
 * export const resources = {
 *   users: { name: "users", fields: userFields },
 *   admins: { name: "admins", fields: adminFields },
 * } as const;
 * ```
 */
export const resources = {
  users: {
    name: "users",
    fields: userFields,
    actions: [],
  },
  bots: {
    name: "bots",
    fields: botFields,
    actions: botActions,
  },
  chats: {
    name: "chats",
    fields: chatFields,
    actions: [],
  },
  // messages: {
  //   name: "messages",
  //   fields: messageFields,
  // },
} as const;

// Helper function to get all resources for Refine
export const getRefineResources = () => {
  return Object.values(resources).map((resource) =>
    createResource(resource.name)
  );
};

// Helper function to get all routes
export const getAllRoutes = () => {
  return Object.values(resources).map((resource) => ({
    name: resource.name,
    fields: resource.fields,
    actions: resource.actions,
  }));
};

// Helper function to get navigation items
export const getNavigationItems = () => {
  return Object.values(resources).map((resource) => ({
    name: resource.name,
    label: resource.name.charAt(0).toUpperCase() + resource.name.slice(1),
    path: `/cp/${resource.name}`,
  }));
};
