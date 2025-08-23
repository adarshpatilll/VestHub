import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

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
            theme_color: "#F0B100", // yellow
            background_color: "#181818", // dark background
            display: "standalone",
            start_url: "/", // ensure app starts at root
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
            globPatterns: ["**/*.{js,css,html,png,svg}"],
         },
      }),
   ],
});
