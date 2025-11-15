// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  modules: [
    "@nuxt/eslint",
    "@nuxt/fonts",
    "vuetify-nuxt-module",
    "@nuxtjs/google-fonts",
    "@pinia/nuxt",
    "nuxt-auth-utils",
    "@vueuse/nuxt",
  ],
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL,
      mediaBaseUrl: process.env.NUXT_PUBLIC_MEDIA_BASE_URL,
      googleClientId: process.env.NUXT_PUBLIC_GOOGLE_CLIENT_ID,
    },
  },
  app: {
    pageTransition: false,
    layoutTransition: false,
    head: {
      title: 'NillTech',
      link: [
        {
          rel: "icon",
          type: "images/png",
          href: "/logo.png",
        }
      ],
      script: [
        {
          src: "https://accounts.google.com/gsi/client",
          async: true,
          defer: true,
        },
        // Google Analytics (GLOBAL)
        {
          src: "https://www.googletagmanager.com/gtag/js?id=G-BHL4B6XSH4",
          async: true,
        },
        {
          children: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-BHL4B6XSH4');
        `,
          type: "text/javascript",
        } as any,
      ],
    },
  },
  routeRules: {
    "/": { prerender: true },
    "/auth/**": { ssr: false },
    "/freelancer/**": { ssr: false },
    "/client/**": { ssr: false },
    "/admin/**": { ssr: false },
  },
  vuetify: {
    moduleOptions: {
      /* module specific options */
      styles: { configFile: "./public/styles.scss" },
      disableModernSassCompiler: false,
    },
    vuetifyOptions: "./vuetify.config.ts",
  },
  googleFonts: {
    families: {
      Inter: [400, 700],
      Poppins: [400, 500, 700],
    },
    display: "swap",
    prefetch: true,
    preconnect: true,
  },
  features: {
    inlineStyles: false,
  },
});
