"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMessageResource = void 0;
// @ts-expect-error
var prisma_1 = require("@adminjs/prisma");
var prismaClient_1 = require("../../prismaClient");
// icons https://feathericons.com/
var createMessageResource = function () { return ({
    resource: { model: (0, prisma_1.getModelByName)("Message"), client: prismaClient_1.default },
    options: {
        listProperties: ["createdAt", "text", "price"],
        sort: {
            sortBy: "createdAt",
            direction: "desc",
        },
    },
}); };
exports.createMessageResource = createMessageResource;
