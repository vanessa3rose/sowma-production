import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 5173,
  },
  plugins: [react()],
  test: {
    coverage: {
      provider: "istanbul",
      extension: ".ts",
      target: ["html", "txt"]
    }
  }
});
