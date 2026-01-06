"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNavigationItems = exports.getAllRoutes = exports.getRefineResources = exports.resources = void 0;
var fields_1 = require("./users/fields");
var fields_2 = require("./admins/fields");
var createResource_1 = require("../utils/createResource");
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
exports.resources = {
    users: {
        name: "users",
        fields: fields_1.userFields,
    },
    admins: {
        name: "admins",
        fields: fields_2.adminFields,
    },
};
// Helper function to get all resources for Refine
var getRefineResources = function () {
    return Object.values(exports.resources).map(function (resource) {
        return (0, createResource_1.default)(resource.name);
    });
};
exports.getRefineResources = getRefineResources;
// Helper function to get all routes
var getAllRoutes = function () {
    return Object.values(exports.resources).map(function (resource) { return ({
        name: resource.name,
        fields: resource.fields,
    }); });
};
exports.getAllRoutes = getAllRoutes;
// Helper function to get navigation items
var getNavigationItems = function () {
    return Object.values(exports.resources).map(function (resource) { return ({
        name: resource.name,
        label: resource.name.charAt(0).toUpperCase() + resource.name.slice(1),
        path: "/admin/".concat(resource.name),
    }); });
};
exports.getNavigationItems = getNavigationItems;
