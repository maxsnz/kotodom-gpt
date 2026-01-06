"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createResource = void 0;
var createResource = function (resource) {
    return {
        name: resource,
        list: "/".concat(resource),
        create: "/".concat(resource, "/create"),
        edit: "/".concat(resource, "/edit/:id"),
        show: "/".concat(resource, "/:id"),
        meta: {
            canCreate: true,
            canEdit: true,
            canDelete: true,
            canShow: true,
        },
    };
};
exports.createResource = createResource;
exports.default = exports.createResource;
