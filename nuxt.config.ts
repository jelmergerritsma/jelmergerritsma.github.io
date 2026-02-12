// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({

  modules: [
    "@nuxt/eslint",
    "@nuxt/ui",
    "@nuxt/hints",
    "@nuxtjs/supabase",
    "@nuxtjs/i18n",
    "@vite-pwa/nuxt"
  ],
  ssr: false,

  imports: {
    dirs: ["types"]
  },

  devtools: {
    enabled: false
  },

  app: {
    pageTransition: { name: "slide-left", mode: "default" }
  },

  css: ["~/assets/css/main.css"],

  runtimeConfig: {
    public: {
      workspaceUrl: "jelmergerritsma.github.io"
    }
  },

  routeRules: {
    "/": { prerender: true }
  },

  compatibilityDate: "2025-01-15",

  eslint: {
    config: {
      stylistic: {
        commaDangle: "never",
        braceStyle: "1tbs"
      }
    }
  },

  i18n: {
    locales: [
      { code: "en", name: "English" },
      { code: "nl", name: "Nederlands" }
    ],
    defaultLocale: "nl",
    strategy: "no_prefix"
  },

  pwa: {
    registerType: "autoUpdate",
    manifest: {
      name: "30 Seconds",
      short_name: "30Sec",
      description: "The ultimate 30 Seconds word guessing game",
      theme_color: "#0f172b",
      background_color: "#0f172b",
      display: "standalone",
      orientation: "portrait",
      icons: [
        {
          src: "pwa-192x192.png",
          sizes: "192x192",
          type: "image/png"
        },
        {
          src: "pwa-512x512.png",
          sizes: "512x512",
          type: "image/png"
        },
        {
          src: "pwa-512x512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any maskable"
        }
      ]
    },
    workbox: {
      navigateFallback: "/",
      globPatterns: ["**/*.{js,css,html,png,svg,ico}"]
    },
    devOptions: {
      enabled: false
    }
  },

  supabase: {
    redirectOptions: {
      login: "/login",
      callback: "/confirm",
      exclude: ["/", "/admin"]
    },
    cookieOptions: {
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
      secure: false
    }
  }

})
