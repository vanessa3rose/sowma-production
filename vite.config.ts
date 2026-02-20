import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  server: {
    port: 3000, // frontend port

    watch: {
      usePolling: true,
      interval: 100,
    },

    proxy: {
      "/api": "http://localhost:4000", // backend port
    },
  },
  base: "/",
  plugins: [react()],
});
