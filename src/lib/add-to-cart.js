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
  toast,
}) {
  const userId = user?.id || user?._id || null;

  return dispatch(addToCart({ userId, productId, quantity, productObj })).then(
    (data) => {
      const payload = data?.payload;
      const success = Boolean(payload?.success || payload?.data);

      if (success) {
        if (userId) {
          dispatch(fetchCartItems(userId));
        } else {
          notifyCartUpdated();
        }

        if (toast) {
          const name = productObj?.title || productObj?.name || "Item";
          const qty = Number(quantity) || 1;
          toast({
            title: "Added to cart",
            description: qty > 1 ? `${name} (×${qty})` : name,
          });
        }
      } else if (toast) {
        toast({
          title: payload?.message || "Failed to add to cart",
          variant: "destructive",
        });
      }

      return data;
    }
  );
}
