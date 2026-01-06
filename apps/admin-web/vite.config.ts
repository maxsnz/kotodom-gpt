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
    },
  },

  build: {
    outDir: resolve(__dirname, "..", "dist", "frontend"),
    emptyOutDir: true,
  },

  server: {
    port: process.env.FRONTEND_PORT
      ? parseInt(process.env.FRONTEND_PORT)
      : 5173,
    proxy: {
      "/api": {
        target: `http://localhost:${process.env.BACKEND_PORT || 3000}`,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "/api"),
      },
    },
  },
});
