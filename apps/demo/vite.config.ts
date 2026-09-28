import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@excelat/react": path.resolve(__dirname, "../../packages/react/src"),
    },
  },
  server: {
    port: 5173,
    open: false,
  },
});
