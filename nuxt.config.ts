// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-01-01",
  devtools: { enabled: false },
  modules: ["@nuxtjs/tailwindcss"],
  app: {
    head: {
      title: "Femmeres Grants — Grant Discovery for NGOs",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content:
            "Femmeres Grants: Non-refundable grant discovery platform for women-serving NGOs in Gatineau, Quebec.",
        },
      ],
      link: [
        {
          rel: "preconnect",
          href: "https://fonts.googleapis.com",
        },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Fraunces:ital,wght@0,400;0,600;0,700;1,400;1,600&display=swap",
        },
      ],
    },
  },
  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL || "",
  },
  nitro: {
    experimental: {
      openAPI: false,
    },
  },
  // Exclude old project folder from Nuxt's file watching
  ignore: ["femmeresgrants/**", "commerce.framer.media/**", "goClone/**", "memoir.framer.website/**", "docs/**", ".claude/**"],
});
