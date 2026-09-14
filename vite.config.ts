import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [react(), tailwindcss(), cloudflare()],
  server: {
    watch: {
      usePolling: process.env.VITE_USE_POLLING === "true" || process.env.CHOKIDAR_USEPOLLING === "true",
      interval: 300,
    },
  },
});
