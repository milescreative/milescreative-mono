import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    "index": "src/index.ts",
    "utils/ip": "src/utils/ip.ts"
  },
  format: ["cjs", "esm"],
  dts: true,
  clean: true,
});
