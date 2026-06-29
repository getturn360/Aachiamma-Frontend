import { addToCart } from "@/store/shop/cart-slice";
import { notifyCartUpdated } from "@/lib/post-auth-cart";

const DESKTOP_CART_TOAST_DURATION = 6000;

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
        if (!userId) {
          notifyCartUpdated();
        }

        if (toast) {
          const name = productObj?.title || productObj?.name || "Item";
          const qty = Number(quantity) || 1;
          toast({
            title: "Added to cart",
            description: qty > 1 ? `${name} (×${qty})` : name,
            duration: DESKTOP_CART_TOAST_DURATION,
            variant: "cart",
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
