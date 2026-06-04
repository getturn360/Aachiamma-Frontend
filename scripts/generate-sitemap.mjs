/**
 * Generates public/sitemap.xml and public/robots.txt using the `sitemap` package.
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
const DEFAULT_API_BASE = "https://aachiamma-backend.fly.dev";

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
const apiBase = (env.VITE_API_BASE || env.VITE_API_URL || env.SITEMAP_API_BASE || DEFAULT_API_BASE)
  .replace(/\/+$/, "");

/** Public storefront routes (no auth/admin/checkout). */
const staticRoutes = [
  { url: "/shop/home", changefreq: "daily", priority: 1.0 },
  { url: "/shop/listing", changefreq: "daily", priority: 0.9 },
  { url: "/shop/about", changefreq: "monthly", priority: 0.7 },
  { url: "/shop/contact", changefreq: "monthly", priority: 0.7 },
  { url: "/shop/faq", changefreq: "monthly", priority: 0.6 },
  { url: "/shop/terms", changefreq: "yearly", priority: 0.4 },
  { url: "/shop/privacy", changefreq: "yearly", priority: 0.4 },
  { url: "/shop/refunds", changefreq: "yearly", priority: 0.4 },
  { url: "/shop/shipping", changefreq: "yearly", priority: 0.4 },
];

async function fetchProductRoutes() {
  try {
    const res = await fetch(`${apiBase}/api/shop/products/get`);
    if (!res.ok) {
      console.warn(`[sitemap] Products API HTTP ${res.status} — static URLs only`);
      return [];
    }
    const json = await res.json();
    const products = Array.isArray(json?.data) ? json.data : [];
    return products
      .filter((p) => p && (p._id || p.id))
      .map((p) => {
        const id = String(p._id || p.id);
        const lastmod = p.updatedAt || p.createdAt;
        return {
          url: `/shop/product/${id}`,
          changefreq: "weekly",
          priority: 0.8,
          ...(lastmod ? { lastmod: new Date(lastmod).toISOString() } : {}),
        };
      });
  } catch (err) {
    console.warn(
      "[sitemap] Could not fetch products:",
      err?.message || err,
      "— static URLs only"
    );
    return [];
  }
}

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
  const productRoutes = await fetchProductRoutes();
  const links = [...staticRoutes, ...productRoutes];

  const sitemapPath = await writeSitemap(links);
  const robotsPath = writeRobots();

  console.log(`[sitemap] Host: ${hostname}`);
  console.log(`[sitemap] URLs: ${links.length} (${staticRoutes.length} static + ${productRoutes.length} products)`);
  console.log(`[sitemap] Wrote ${sitemapPath}`);
  console.log(`[sitemap] Wrote ${robotsPath}`);
}

main().catch((err) => {
  console.error("[sitemap] Failed:", err);
  process.exit(1);
});
