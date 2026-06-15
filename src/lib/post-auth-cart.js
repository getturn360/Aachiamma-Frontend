import { addToCart, fetchCartItems, clearGuestCart } from "@/store/shop/cart-slice";

export const CART_UPDATED_EVENT = "cart:updated";

export function notifyCartUpdated() {
  try {
    window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT));
  } catch (e) {
    console.error("notifyCartUpdated error", e);
  }
}

/**
 * Merges pendingCartItem after login/register, refreshes cart in Redux, and
 * notifies the header to re-fetch without a full page reload.
 */
export async function mergePendingCartItem(dispatch, loggedInUser) {
  const userId = loggedInUser?.id || loggedInUser?._id;
  if (!userId) return false;

  let merged = false;

  try {
    const pendingItemStr = sessionStorage.getItem("pendingCartItem");
    if (pendingItemStr) {
      const pendingItem = JSON.parse(pendingItemStr);
      await dispatch(
        addToCart({
          userId,
          productId: pendingItem.productId,
          quantity: pendingItem.quantity,
          productObj: pendingItem.productObj,
        })
      ).unwrap();
      sessionStorage.removeItem("pendingCartItem");
      merged = true;
    }
  } catch (e) {
    console.error("Error processing pending cart item:", e);
  }

  try {
    await dispatch(fetchCartItems(userId)).unwrap();
    dispatch(clearGuestCart());
    notifyCartUpdated();
  } catch (e) {
    console.error("Error refreshing cart after auth:", e);
  }

  return merged;
}
