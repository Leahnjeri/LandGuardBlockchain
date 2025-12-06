import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import cesium from "vite-plugin-cesium";
import tailwindcss from "@tailwindcss/vite"; // ✅ handles Cesium automatically
import { resolve } from "path";

export default defineConfig({
  plugins: [
    react(),
    cesium(),
    tailwindcss(), // ✅ instead of manual alias hacks
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 2000, // Cesium bundle is big
  },
});
