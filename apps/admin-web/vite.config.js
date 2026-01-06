"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vite_1 = require("vite");
var plugin_react_1 = require("@vitejs/plugin-react");
var dotenv_1 = require("dotenv");
var url_1 = require("url");
var path_1 = require("path");
var vite_2 = require("@tailwindcss/vite");
dotenv_1.default.config();
var __filename = (0, url_1.fileURLToPath)(import.meta.url);
var __dirname = (0, path_1.dirname)(__filename);
// https://vite.dev/config/
exports.default = (0, vite_1.defineConfig)({
    root: __dirname,
    plugins: [(0, plugin_react_1.default)(), (0, vite_2.default)()],
    resolve: {
        alias: {
            "@": (0, path_1.resolve)(__dirname, "src"),
        },
    },
    build: {
        outDir: (0, path_1.resolve)(__dirname, "..", "dist", "frontend"),
        emptyOutDir: true,
    },
    server: {
        port: process.env.FRONTEND_PORT
            ? parseInt(process.env.FRONTEND_PORT)
            : 5173,
        proxy: {
            "/api": {
                target: "http://localhost:".concat(process.env.BACKEND_PORT || 3000),
                changeOrigin: true,
                rewrite: function (path) { return path.replace(/^\/api/, "/api"); },
            },
        },
    },
});
