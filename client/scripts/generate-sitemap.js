import fs from "fs";
import { SitemapStream, streamToPromise } from "sitemap";
import path from "path";
import { fileURLToPath } from "url";

// ✅ Fix for __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// List all public routes
const routes = [
   "/",
   "/login",
   "/register",
   "/funds",
   "/funds/view-funds",
   "/funds/edit-funds",
   "/funds/add-fund",
   "/funds/shared-funds",
   "/funds/shared-funds/:senderId",
   "/account",
   "/reset-password",
   "/new-password",
];

// Base URL
const BASE_URL = "https://www.finstack.tech";

async function generateSitemap() {
   const sitemapStream = new SitemapStream({ hostname: BASE_URL });

   routes.forEach((route) => {
      sitemapStream.write({
         url: route.replace(":senderId", ""),
         changefreq: "weekly",
         priority: 0.8,
      });
   });

   sitemapStream.end();

   const sitemap = await streamToPromise(sitemapStream);

   // ✅ Always inside client/public
   const outputPath = path.resolve(__dirname, "../public/sitemap.xml");
   fs.writeFileSync(outputPath, sitemap.toString());

   console.log(`✅ Sitemap generated at ${outputPath}`);
}

generateSitemap();
