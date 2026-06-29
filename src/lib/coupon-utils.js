const PENDING_COUPON_KEY = "aachiamma_pending_coupon_code";

export function formatCouponLabel(coupon) {
  if (!coupon) return "";
  if (coupon.label) return coupon.label;
  const type = coupon.type || coupon.amountType;
  const value = Number(coupon.value ?? coupon.amount ?? 0);
  if (type === "percent" || type === "percentage") return `${value}% OFF`;
  return `₹${value} OFF`;
}

export function savePendingCouponCode(code) {
  if (!code) return;
  try {
    sessionStorage.setItem(PENDING_COUPON_KEY, String(code).trim().toUpperCase());
  } catch {
    // ignore
  }
}

export function readPendingCouponCode() {
  try {
    const code = sessionStorage.getItem(PENDING_COUPON_KEY);
    return code ? String(code).trim().toUpperCase() : null;
  } catch {
    return null;
  }
}

export function clearPendingCouponCode() {
  try {
    sessionStorage.removeItem(PENDING_COUPON_KEY);
  } catch {
    // ignore
  }
}

export function getCartProductIds(cartItems) {
  const items = Array.isArray(cartItems) ? cartItems : cartItems?.items || [];
  return items
    .map((it) => it?.productId || it?._id || it?.id)
    .filter(Boolean)
    .map(String);
}
