import { ROUTES } from "@/config/routes";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { notifyCartUpdated } from "@/lib/post-auth-cart";

export const GUEST_CART_MESSAGE =
  "Please login or create an account to add items to cart and purchase multiple products.";

/**
 * Add to cart — logged-in users only. Guests should use Buy Now for single-item checkout.
 */
export function addProductToCart({
  dispatch,
  user,
  navigate,
  productId,
  quantity = 1,
  productObj = null,
  fromPath = "/",
  toast,
}) {
  if (!user) {
    if (toast) {
      toast({
        title: "Login required",
        description: GUEST_CART_MESSAGE,
        variant: "destructive",
      });
    }
    if (navigate) {
      navigate(ROUTES.login, {
        state: { from: { pathname: fromPath || ROUTES.home } },
      });
    }
    return Promise.resolve({ redirectedToLogin: true });
  }

  const userId = user?.id || user?._id || null;

  return dispatch(addToCart({ userId, productId, quantity, productObj })).then(
    (data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(userId));
      }
      return data;
    }
  );
}
