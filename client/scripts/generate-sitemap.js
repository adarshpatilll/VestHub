import fs from "fs";
import { SitemapStream, streamToPromise } from "sitemap";
import { createWriteStream } from "fs";
import path from "path";

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
   "/account",
   "/reset-password",
   "/new-password",
];

// Base URL
const BASE_URL = "https://finstack.tech";

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
   fs.writeFileSync(
      path.resolve("client/public/sitemap.xml"),
      sitemap.toString(),
   );
   console.log("✅ Sitemap generated at /public/sitemap.xml");
}

generateSitemap();
