"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var config = {
    preset: "ts-jest/presets/default-esm",
    testEnvironment: "node",
    extensionsToTreatAsEsm: [".ts"],
    moduleNameMapper: {
        "^(\\.{1,2}/.*)\\.js$": "$1",
    },
    transform: {
        "^.+\\.tsx?$": [
            "ts-jest",
            {
                useESM: true,
            },
        ],
    },
    testMatch: ["**/*.spec.ts", "**/*.test.ts"],
    collectCoverageFrom: [
        "src/**/*.ts",
        "!src/**/*.spec.ts",
        "!src/**/*.test.ts",
        "!src/**/*.d.ts",
        "!src/main.ts",
    ],
    coverageDirectory: "coverage",
    coverageReporters: ["text", "lcov", "html"],
    moduleDirectories: ["node_modules", "<rootDir>/src"],
    testTimeout: 10000,
    transformIgnorePatterns: ["node_modules/(?!(pg-boss)/)"],
};
exports.default = config;
