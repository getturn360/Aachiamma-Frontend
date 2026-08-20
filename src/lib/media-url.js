/**
 * Upgrade http:// media URLs to https:// to avoid Mixed Content warnings
 * on HTTPS pages (Chrome auto-upgrades, but still logs the warning).
 */
export function secureMediaUrl(url) {
  if (typeof url !== "string" || !url) return url;
  if (url.startsWith("http://")) {
    return `https://${url.slice(7)}`;
  }
  return url;
}

function isPlainObject(value) {
  if (!value || typeof value !== "object") return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

/** Recursively rewrite http:// strings in API JSON payloads. */
export function secureMediaDeep(value) {
  if (typeof value === "string") return secureMediaUrl(value);
  if (Array.isArray(value)) return value.map(secureMediaDeep);
  if (isPlainObject(value)) {
    for (const key of Object.keys(value)) {
      value[key] = secureMediaDeep(value[key]);
    }
  }
  return value;
}
