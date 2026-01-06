"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
var pino_1 = require("pino");
var env_1 = require("../../apps/backend/src/config/env");
var package_json_1 = require("../../package.json");
var isProd = env_1.default.NODE_ENV === "production";
var targets = [];
if (env_1.default.LOGTAIL_TOKEN) {
    targets.push({
        target: "@logtail/pino",
        options: {
            sourceToken: env_1.default.LOGTAIL_TOKEN,
            options: {
                endpoint: env_1.default.LOGTAIL_SOURCE,
            },
        },
        level: "info",
    });
}
targets.push({
    target: "pino-pretty",
    level: isProd ? "error" : "debug",
    options: {
        colorize: true,
        translateTime: "HH:MM:ss",
        ignore: "pid,hostname",
    },
});
exports.logger = (0, pino_1.default)({
    level: isProd ? "info" : "debug",
    timestamp: pino_1.default.stdTimeFunctions.isoTime,
    base: {
        app: package_json_1.default.name,
        version: package_json_1.default.version,
        env: env_1.default.NODE_ENV,
    },
}, pino_1.default.transport({
    targets: targets,
}));
