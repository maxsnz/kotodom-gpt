import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import tailwindcss from "@tailwindcss/vite";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  root: __dirname,
  plugins: [react(), tailwindcss()],

  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      "@shared/contracts": resolve(__dirname, "../../shared/contracts/src"),
      "@kotoadmin": resolve(__dirname, "../../shared/packages/kotoadmin/src"),
    },
  },

  build: {
    outDir: resolve(__dirname, "../../dist-admin-web"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("/shared/contracts/")) return "contracts";
          if (id.includes("/shared/packages/kotoadmin/")) return "kotoadmin";

          if (id.includes("node_modules")) {
            if (
              id.includes("node_modules/react/") ||
              id.includes("node_modules/react-dom/") ||
              id.includes("node_modules/scheduler/") ||
              id.includes("react/jsx-runtime") ||
              id.includes("react/jsx-dev-runtime")
            ) {
              return "react";
            }

            return "vendor";
          }
        },
      },
    },
  },

  server: {
    allowedHosts: [".ngrok-free.dev"],
    port: process.env.FRONTEND_PORT
      ? parseInt(process.env.FRONTEND_PORT)
      : 5173,
    proxy: {
      "^/(api|telegram)": {
        target: `http://localhost:${process.env.BACKEND_PORT || 3000}`,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "/api"),
      },
    },
  },
});
