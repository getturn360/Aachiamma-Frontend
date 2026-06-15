import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { ROUTES } from "@/config/routes";

/**
 * Login-only add to cart. Guests are redirected to sign in with the item stored
 * as pendingCartItem in sessionStorage for post-login merge.
 */
export function addProductToCart({
  dispatch,
  user,
  navigate,
  productId,
  quantity = 1,
  productObj = null,
  fromPath,
}) {
  const userId = user?.id || user?._id || null;

  if (!userId) {
    try {
      sessionStorage.setItem(
        "pendingCartItem",
        JSON.stringify({ productId, quantity, productObj })
      );
    } catch (e) {
      console.error("pendingCartItem storage error", e);
    }

    if (navigate) {
      const pathname =
        fromPath ||
        (typeof window !== "undefined" ? window.location.pathname : ROUTES.home);
      navigate(ROUTES.login, { state: { from: { pathname } } });
    }

    return Promise.resolve({ redirectedToLogin: true });
  }

  return dispatch(addToCart({ userId, productId, quantity, productObj })).then(
    (data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(userId));
      }
      return data;
    }
  );
}
