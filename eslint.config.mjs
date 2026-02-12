// @ts-check
import withNuxt from "./.nuxt/eslint.config.mjs"

export default withNuxt(
  {
    ignores: [
      "app/types/database.types.ts"
    ]
  },
  // Your custom configs here
  {
    name: "Custom ESLint Config",
    rules: {
      "vue/block-order": [
        "error",
        {
          order: ["script", "template", "style", "i18n"]
        }
      ],
      "@stylistic/quotes": ["error", "double"]
    }
  }
)
