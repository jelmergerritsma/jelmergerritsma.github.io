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
    pageTransition: { name: "slide-left", mode: "default" },
    head: {
      viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, viewport-fit=cover",
      meta: [
        { name: "apple-mobile-web-app-capable", content: "yes" },
        { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
        { name: "apple-mobile-web-app-title", content: "30 Seconds" },
        { name: "format-detection", content: "telephone=no" },
        { name: "theme-color", content: "#0f172b" }
      ],
      link: [
        { rel: "apple-touch-icon", href: "/apple-icon-180.png" }
      ]
    }
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
      start_url: "/",
      scope: "/",
      id: "/",
      icons: [
        {
          src: "icon.svg",
          sizes: "any",
          type: "image/svg+xml",
          purpose: "any maskable"
        },
        {
          src: "manifest-icon-192.maskable.png",
          sizes: "192x192",
          type: "image/png",
          purpose: "any maskable"
        },
        {
          src: "manifest-icon-512.maskable.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any maskable"
        },
        {
          src: "apple-icon-180.png",
          sizes: "180x180",
          type: "image/png"
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
