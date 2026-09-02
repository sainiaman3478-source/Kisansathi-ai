import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Relative assets work on both GitHub Pages root and /Kisansathi-ai/.
  base: "./",
  plugins: [react()],
});
