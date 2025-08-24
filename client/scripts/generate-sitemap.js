import fs from "fs";
import { SitemapStream, streamToPromise } from "sitemap";
import path from "path";

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

   // ✅ Save directly into public/
   fs.writeFileSync(
      path.resolve("client/public/sitemap.xml"),
      sitemap.toString(),
   );

   console.log("✅ Sitemap generated at /public/sitemap.xml");
}

generateSitemap();
