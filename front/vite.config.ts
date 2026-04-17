import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";

if (!process.env.VITE_PORT) throw new Error("process.env.VITE_PORT não configurado");

export default defineConfig({
  server: {
    port: +process.env.VITE_PORT,
    strictPort: true,
  },
  plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
});
