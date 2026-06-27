import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      // server-only 는 테스트(node/jsdom)에서 import 시 throw 하므로 빈 모듈로 대체.
      "server-only": fileURLToPath(new URL("./src/test/empty-module.ts", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
