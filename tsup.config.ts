import { defineConfig } from "tsup";

export default defineConfig({
  target: "node18",
  splitting: true,
  clean: true,
  dts: true,
  name: "next-plugin",
  sourcemap: true,
  format: ["cjs", "esm"],
  entry: ["src/index.ts"],
});
