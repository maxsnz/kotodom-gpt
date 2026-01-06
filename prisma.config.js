"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var config_1 = require("prisma/config");
require("dotenv/config");
exports.default = (0, config_1.defineConfig)({
    datasource: {
        url: (0, config_1.env)("DATABASE_URL"),
    },
    migrations: {
        seed: "tsx apps/backend/src/infra/db/prisma/seed.ts",
    },
    schema: "./apps/backend/src/infra/db/prisma/schema.prisma",
});
