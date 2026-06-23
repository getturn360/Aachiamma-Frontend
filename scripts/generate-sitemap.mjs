/**
 * Generates public/sitemap.xml and public/robots.txt using the `sitemap` package.
 * Includes static storefront pages and every shop-visible product URL.
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

const apiBase = (
  env.SITEMAP_API_BASE ||
  env.VITE_API_BASE ||
  env.VITE_API_URL ||
  DEFAULT_API_BASE
).replace(/\/+$/, "");

/** Public storefront routes. */
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

async function fetchProductRoutes() {
  try {
    const url = `${apiBase}/api/shop/products/get?sortBy=title-atoz`;
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText}`);
    }

    const json = await res.json();
    const products = Array.isArray(json?.data) ? json.data : [];

    return products
      .filter((p) => p?._id)
      .map((p) => ({
        url: `/product/${p._id}`,
        changefreq: "weekly",
        priority: 0.8,
        lastmod: p.updatedAt ? new Date(p.updatedAt).toISOString() : undefined,
      }));
  } catch (err) {
    console.warn(
      `[sitemap] Could not fetch products from ${apiBase}:`,
      err?.message || err
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
Disallow: /wp-admin/
Disallow: /wp-login.php
Disallow: /cart/
Disallow: /my-account/
Disallow: /?add-to-cart=*
Disallow: /*?orderby=
Disallow: /*?filter_*
Allow: /wp-content/uploads/

# --- Google (search + AI Overviews) ---
User-agent: Googlebot
Allow: /
User-agent: Google-Extended
Allow: /

# --- Bing (search + Copilot) ---
User-agent: Bingbot
Allow: /

# --- OpenAI (training + ChatGPT Search) ---
User-agent: GPTBot
Allow: /
User-agent: OAI-SearchBot
Allow: /
User-agent: ChatGPT-User
Allow: /

# --- Anthropic (Claude crawling + live search) ---
User-agent: ClaudeBot
Allow: /
User-agent: Claude-User
Allow: /
User-agent: Claude-SearchBot
Allow: /

# --- Perplexity ---
User-agent: PerplexityBot
Allow: /

# --- Apple (Siri / Apple Intelligence) ---
User-agent: Applebot
Allow: /
User-agent: Applebot-Extended
Allow: /

# --- Common Crawl (powers many AI models, incl. open-source) ---
User-agent: CCBot
Allow: /

# --- Amazon (Alexa) ---
User-agent: Amazonbot
Allow: /

# --- Sitemaps for discovery ---
Sitemap: ${hostname}/sitemap.xml
`;
  mkdirSync(publicDir, { recursive: true });
  writeFileSync(outPath, body, "utf8");
  return outPath;
}

async function main() {
  const productRoutes = await fetchProductRoutes();
  const allRoutes = [...staticRoutes, ...productRoutes];
  const sitemapPath = await writeSitemap(allRoutes);
  const robotsPath = writeRobots();

  console.log(`[sitemap] Host: ${hostname}`);
  console.log(`[sitemap] API: ${apiBase}`);
  console.log(
    `[sitemap] URLs: ${allRoutes.length} (${staticRoutes.length} static + ${productRoutes.length} products)`
  );
  console.log(`[sitemap] Wrote ${sitemapPath}`);
  console.log(`[sitemap] Wrote ${robotsPath}`);
}

main().catch((err) => {
  console.error("[sitemap] Failed:", err);
  process.exit(1);
});
