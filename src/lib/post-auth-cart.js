import { addToCart, fetchCartItems, clearGuestCart } from "@/store/shop/cart-slice";
import { loadGuestCart } from "@/lib/guest-cart";

export const CART_UPDATED_EVENT = "cart:updated";

export function notifyCartUpdated() {
  try {
    window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT));
  } catch (e) {
    console.error("notifyCartUpdated error", e);
  }
}

/**
 * Merges guest cart + pendingCartItem after login/register, then refreshes server cart.
 */
export async function mergePendingCartItem(dispatch, loggedInUser) {
  const userId = loggedInUser?.id || loggedInUser?._id;
  if (!userId) return false;

  let merged = false;

  try {
    const guest = loadGuestCart();
    if (guest.items?.length) {
      for (const item of guest.items) {
        await dispatch(
          addToCart({
            userId,
            productId: item.productId,
            quantity: item.quantity || 1,
            productObj: {
              title: item.title,
              image: item.image,
              price: item.price,
              salePrice: item.salePrice,
              selectedVariant: item.selectedVariant,
            },
          })
        ).unwrap();
        merged = true;
      }
    }
  } catch (e) {
    console.error("Error merging guest cart:", e);
  }

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
