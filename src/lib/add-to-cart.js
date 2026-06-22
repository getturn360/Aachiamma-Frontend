import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { notifyCartUpdated } from "@/lib/post-auth-cart";

/**
 * Add to cart for logged-in users (server cart) or guests (localStorage cart).
 */
export function addProductToCart({
  dispatch,
  user,
  productId,
  quantity = 1,
  productObj = null,
}) {
  const userId = user?.id || user?._id || null;

  return dispatch(addToCart({ userId, productId, quantity, productObj })).then(
    (data) => {
      if (data?.payload?.success) {
        if (userId) {
          dispatch(fetchCartItems(userId));
        } else {
          notifyCartUpdated();
        }
      }
      return data;
    }
  );
}
