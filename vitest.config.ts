import { defineVitestConfig } from "@nuxt/test-utils/config"

export default defineVitestConfig({
  test: {
    environment: "nuxt",
    globals: true,
    include: ["tests/unit/**/*.spec.ts", "tests/components/**/*.spec.ts"]
  }
})
