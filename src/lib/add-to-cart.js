import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";

/**
 * Add to cart for logged-in users (API) or guests (localStorage).
 * Does not redirect to login.
 */
export function addProductToCart({
  dispatch,
  user,
  productId,
  quantity = 1,
  productObj = null,
}) {
  const userId = user?.id || user?._id || null;
  return dispatch(
    addToCart({ userId, productId, quantity, productObj })
  ).then((data) => {
    if (data?.payload?.success) {
      dispatch(fetchCartItems(userId));
    }
    return data;
  });
}
