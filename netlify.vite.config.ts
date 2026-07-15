import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  root: "netlify",
  plugins: [react()],
  build: {
    outDir: "../netlify-dist",
    emptyOutDir: true,
  },
});
