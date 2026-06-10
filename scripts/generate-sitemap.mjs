/**
 * Generates public/sitemap.xml and public/robots.txt using the `sitemap` package.
 * Static storefront pages only (no per-product URLs).
 * Run: npm run sitemap (or automatically before build)
 */
import {
  createWriteStream,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { pipeline } from "stream/promises";
import { Readable } from "stream";
import { SitemapStream } from "sitemap";

const __dirname = dirname(fileURLToPath(import.meta.url));
const clientRoot = join(__dirname, "..");
const publicDir = join(clientRoot, "public");

const DEFAULT_HOSTNAME = "https://aachiammafoods.com";

function loadEnvFile(filename) {
  const path = join(clientRoot, filename);
  if (!existsSync(path)) return {};
  const out = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

const env = { ...loadEnvFile(".env"), ...process.env };

const hostname = (env.VITE_SITE_URL || env.SITEMAP_HOSTNAME || DEFAULT_HOSTNAME)
  .replace(/\/+$/, "");

/** Public storefront routes only (no auth/admin/checkout/product detail pages). */
const staticRoutes = [
  { url: "/", changefreq: "daily", priority: 1.0 },
  { url: "/listing", changefreq: "daily", priority: 0.9 },
  { url: "/about", changefreq: "monthly", priority: 0.7 },
  { url: "/contact", changefreq: "monthly", priority: 0.7 },
  { url: "/faq", changefreq: "monthly", priority: 0.6 },
  { url: "/terms", changefreq: "yearly", priority: 0.4 },
  { url: "/privacy", changefreq: "yearly", priority: 0.4 },
  { url: "/refunds", changefreq: "yearly", priority: 0.4 },
  { url: "/shipping", changefreq: "yearly", priority: 0.4 },
];

async function writeSitemap(links) {
  mkdirSync(publicDir, { recursive: true });
  const outPath = join(publicDir, "sitemap.xml");
  const stream = new SitemapStream({ hostname });
  const writeStream = createWriteStream(outPath);
  await pipeline(Readable.from(links).pipe(stream), writeStream);
  return outPath;
}

function writeRobots() {
  const outPath = join(publicDir, "robots.txt");
  const body = `User-agent: *
Allow: /

Sitemap: ${hostname}/sitemap.xml
`;
  mkdirSync(publicDir, { recursive: true });
  writeFileSync(outPath, body, "utf8");
  return outPath;
}

async function main() {
  const sitemapPath = await writeSitemap(staticRoutes);
  const robotsPath = writeRobots();

  console.log(`[sitemap] Host: ${hostname}`);
  console.log(`[sitemap] URLs: ${staticRoutes.length} (static pages only)`);
  console.log(`[sitemap] Wrote ${sitemapPath}`);
  console.log(`[sitemap] Wrote ${robotsPath}`);
}

main().catch((err) => {
  console.error("[sitemap] Failed:", err);
  process.exit(1);
});
