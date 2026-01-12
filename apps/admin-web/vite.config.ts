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
          // --- shared mono packages
          if (id.includes("/shared/contracts/")) return "contracts";
          if (id.includes("/shared/packages/kotoadmin/")) return "kotoadmin";

          // --- vendor splitting
          if (id.includes("node_modules")) {
            // react core
            if (id.includes("/react/") || id.includes("/react-dom/"))
              return "react";

            // router
            if (id.includes("react-router")) return "router";

            // mantine
            if (id.includes("@mantine/")) return "mantine";
            if (id.includes("@emotion/react")) return "emotion";

            // refine
            if (id.includes("@refinedev/")) return "refine";

            // tables
            if (id.includes("mantine-react-table")) return "tables";

            // utilities-ish
            if (
              id.includes("dayjs") ||
              id.includes("zod") ||
              id.includes("clsx")
            )
              return "utils";

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
