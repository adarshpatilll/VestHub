import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import removeConsole from "vite-plugin-remove-console";

// https://vitejs.dev/config/
export default defineConfig({
   plugins: [
      react(),
      tailwindcss(),
      VitePWA({
         registerType: "autoUpdate",
         injectRegister: "auto",
         includeAssets: ["favicon.svg", "robots.txt", "icons/*.png"],
         manifest: {
            name: "VestHub",
            short_name: "VestHub",
            description: "Manage your mutual funds",
            theme_color: "#F0B100",
            background_color: "#181818",
            display: "standalone",
            start_url: "/",
            icons: [
               {
                  src: "icons/icon-192.png",
                  sizes: "192x192",
                  type: "image/png",
               },
               {
                  src: "icons/icon-512.png",
                  sizes: "512x512",
                  type: "image/png",
               },
            ],
         },
         workbox: {
            navigateFallback: "/index.html",
            globPatterns: ["**/*.{js,css,html,png,svg}"],
         },
      }),
   ],
   build: {
      minify: "terser",
      terserOptions: {
         compress: {
            drop_console: true,
            drop_debugger: true,
         },
      },
   },
});
