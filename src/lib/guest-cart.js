export const GUEST_CART_KEY = "guest_cart_v1";

function variantCore(v) {
  if (!v) return null;
  return {
    label: v.label ?? null,
    price: v.price ?? null,
    salePrice: v.salePrice ?? null,
  };
}

export function variantsMatch(a, b) {
  if (!a && !b) return true;
  if (!a || !b) return false;
  try {
    return JSON.stringify(variantCore(a)) === JSON.stringify(variantCore(b));
  } catch {
    return false;
  }
}

function computeUnitPrice(productObj = {}, selectedVariant = null) {
  const sv = selectedVariant || {};
  const p = productObj || {};
  const vSale = Number(sv.salePrice || 0);
  if (vSale > 0) return vSale;
  const vPrice = Number(sv.price || 0);
  if (vPrice > 0) return vPrice;
  const pSale = Number(p.salePrice || 0);
  if (pSale > 0) return pSale;
  const pPrice = Number(p.price || 0);
  if (pPrice > 0) return pPrice;
  return 0;
}

export function normalizeGuestCartItem(it = {}) {
  const unit = Number(it.unitPriceSaved || it.salePrice || it.price || 0);
  const qty = Number(it.quantity || 1);
  return {
    productId: it.productId,
    title: it.title || "",
    image: it.image || "",
    quantity: qty,
    selectedVariant: it.selectedVariant || null,
    unitPriceSaved: unit,
    price: unit,
    salePrice: unit,
    totalPrice: unit * qty,
  };
}

export function loadGuestCart() {
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    if (!raw) return { items: [], grandTotal: 0 };
    const parsed = JSON.parse(raw);
    const items = Array.isArray(parsed?.items)
      ? parsed.items.map(normalizeGuestCartItem)
      : [];
    const grandTotal = items.reduce((s, it) => s + Number(it.totalPrice || 0), 0);
    return { items, grandTotal };
  } catch {
    return { items: [], grandTotal: 0 };
  }
}

export function saveGuestCart(items) {
  const normalized = (items || []).map(normalizeGuestCartItem);
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify({ items: normalized }));
  const grandTotal = normalized.reduce((s, it) => s + Number(it.totalPrice || 0), 0);
  return { items: normalized, grandTotal };
}

export function addGuestCartItem({ productId, quantity = 1, productObj = {} }) {
  const { items } = loadGuestCart();
  const selectedVariant = productObj.selectedVariant || null;
  const unitPrice = computeUnitPrice(productObj, selectedVariant);
  const existingIndex = items.findIndex(
    (it) =>
      String(it.productId) === String(productId) &&
      variantsMatch(it.selectedVariant, selectedVariant)
  );

  if (existingIndex > -1) {
    items[existingIndex].quantity =
      (items[existingIndex].quantity || 0) + Number(quantity || 1);
    if (unitPrice > 0) {
      items[existingIndex].unitPriceSaved = unitPrice;
      items[existingIndex].price = unitPrice;
      items[existingIndex].salePrice = unitPrice;
    }
    if (productObj.title) items[existingIndex].title = productObj.title;
    if (productObj.image) items[existingIndex].image = productObj.image;
  } else {
    items.push(
      normalizeGuestCartItem({
        productId,
        quantity: Number(quantity || 1),
        title: productObj.title || "",
        image: productObj.image || "",
        selectedVariant: selectedVariant
          ? {
              label: selectedVariant.label ?? null,
              price: selectedVariant.price ?? null,
              salePrice: selectedVariant.salePrice ?? null,
              meta: selectedVariant.meta || {},
            }
          : null,
        unitPriceSaved: unitPrice,
        price: unitPrice,
        salePrice: unitPrice,
      })
    );
  }

  return saveGuestCart(items);
}

export function updateGuestCartQuantity({ productId, quantity, selectedVariant = null }) {
  const { items } = loadGuestCart();
  const idx = items.findIndex(
    (it) =>
      String(it.productId) === String(productId) &&
      variantsMatch(it.selectedVariant, selectedVariant)
  );
  if (idx === -1) return { items, grandTotal: 0, success: false };
  items[idx].quantity = Number(quantity);
  return { ...saveGuestCart(items), success: true };
}

export function deleteGuestCartItem({ productId, selectedVariant = null }) {
  const { items } = loadGuestCart();
  const next = items.filter(
    (it) =>
      !(
        String(it.productId) === String(productId) &&
        variantsMatch(it.selectedVariant, selectedVariant)
      )
  );
  if (next.length === items.length) return { items, grandTotal: 0, success: false };
  return { ...saveGuestCart(next), success: true };
}

export function clearGuestCartStorage() {
  try {
    localStorage.removeItem(GUEST_CART_KEY);
  } catch {
    // ignore
  }
}
