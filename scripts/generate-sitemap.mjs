import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const solarData = JSON.parse(
  readFileSync(join(root, "src/data/solar-hours.json"), "utf-8")
);

const BASE = "https://electrifyeverythingnow.com";
const today = new Date().toISOString().split("T")[0];

const staticPages = [
  { loc: "/solar", priority: "1.0", changefreq: "weekly" },
  { loc: "/rates", priority: "0.8", changefreq: "monthly" },
  { loc: "/panel-checker", priority: "0.8", changefreq: "monthly" },
  { loc: "/install-guide", priority: "0.6", changefreq: "monthly" },
  { loc: "/solar/how-to-install", priority: "0.8", changefreq: "monthly" },
];

const stateSlugs = Object.entries(solarData).map(([, data]) => {
  return data.name.toLowerCase().replace(/\s+/g, "-");
});

const statePages = stateSlugs.map((slug) => ({
  loc: `/solar/${slug}`,
  priority: "0.7",
  changefreq: "monthly",
}));

const allPages = [...staticPages, ...statePages];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
  .map(
    (p) => `  <url>
    <loc>${BASE}${p.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;

writeFileSync(join(root, "public/sitemap.xml"), xml);
console.log(
  `Generated sitemap.xml with ${allPages.length} URLs (${staticPages.length} static + ${statePages.length} state pages)`
);
