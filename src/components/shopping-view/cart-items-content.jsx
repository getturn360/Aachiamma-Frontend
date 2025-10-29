import { Minus, Plus, Trash } from "lucide-react";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import { deleteCartItem, updateCartQuantity } from "@/store/shop/cart-slice";
import { useToast } from "../ui/use-toast";

function UserCartItemsContent({
  cartItem,
  onInc,
  onDec,
  onDelete,
  disableQuantity = false,
}) {
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart || {});
  const { productList } = useSelector((state) => state.shopProducts || {});
  const dispatch = useDispatch();
  const { toast } = useToast();

  const productMeta =
    productList && Array.isArray(productList)
      ? productList.find(
        (p) => p._id === cartItem?.productId || p?.id === cartItem?.productId
      )
      : null;

  // Determine selected variant (if any) stored on cartItem
  const selectedVariant = cartItem?.selectedVariant || cartItem?.variant || null;

  // Prefer selectedVariant prices first, then saved cartItem price, then fallback
  const priceToUse =
    selectedVariant && Number(selectedVariant.salePrice) > 0
      ? Number(selectedVariant.salePrice)
      : selectedVariant
        ? Number(selectedVariant.price || 0)
        : cartItem?.salePrice && cartItem.salePrice > 0
          ? Number(cartItem.salePrice)
          : Number(cartItem?.price || 0);

  const formatINR = (value) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(
      Number(value || 0)
    );

  const isInReduxCart =
    cartItems &&
    Array.isArray(cartItems.items) &&
    cartItems.items.some((it) => it.productId === cartItem.productId);

  // get the selectedVariant object for dispatch (send null if none)
  const selectedVariantForDispatch = selectedVariant;

  const handlePlus = () => {
    if (disableQuantity) return;
    if (typeof onInc === "function") return onInc(cartItem);

    dispatch(
      updateCartQuantity({
        userId: user?.id,
        productId: cartItem?.productId,
        quantity: (cartItem?.quantity || 1) + 1,
        selectedVariant: selectedVariantForDispatch,
      })
    ).then((data) => {
      if (data?.payload?.success) toast({ title: "Cart updated" });
    });
  };

  const handleMinus = () => {
    if (disableQuantity) return;
    if (typeof onDec === "function") return onDec(cartItem);

    const newQty = (cartItem?.quantity || 1) - 1;
    if (newQty < 1) return;
    dispatch(
      updateCartQuantity({
        userId: user?.id,
        productId: cartItem?.productId,
        quantity: newQty,
        selectedVariant: selectedVariantForDispatch,
      })
    ).then((data) => {
      if (data?.payload?.success) toast({ title: "Cart updated" });
    });
  };

  const handleDelete = () => {
    if (typeof onDelete === "function") return onDelete(cartItem);

    dispatch(
      deleteCartItem({
        userId: user?.id,
        productId: cartItem?.productId,
        selectedVariant: selectedVariantForDispatch,
      })
    ).then((data) => {
      if (data?.payload?.success) toast({ title: "Item removed" });
    });
  };

  return (
    <div
      className="flex items-center gap-4 p-5 rounded-2xl border border-gray-200 
      bg-gradient-to-br from-white to-gray-50 shadow-md
      transition transform ease-in-out relative group"
    >
      {/* Product Image */}
      <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center shadow-inner">
        <img
          src={cartItem?.image || productMeta?.image}
          alt={cartItem?.title || productMeta?.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Product Details */}
      <div className="flex-1">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 text-base">
              {cartItem?.title || productMeta?.title || "Product"}
            </h3>
            <p className="text-sm text-gray-500">
              {cartItem?.variantLabel || selectedVariant?.label || cartItem?.variant?.label || productMeta?.variant || ""}
            </p>
          </div>

          {/* Price + Delete */}
          <div className="text-right">
            <div className="font-bold text-lg text-gray-800">
              {formatINR(priceToUse * (cartItem?.quantity || 1))}
            </div>
            <div className="text-xs text-gray-500">
              ({formatINR(priceToUse)} × {cartItem?.quantity || 1})
            </div>
            {(typeof onDelete === "function" || isInReduxCart) && (
              <Trash
                onClick={handleDelete}
                className="cursor-pointer mt-2 text-gray-400 hover:text-white 
                opacity-80 group-hover:opacity-100 transition-all duration-300 
                p-1.5 rounded-full hover:bg-red-500 hover:scale-110 shadow-md"
                size={32}
              />
            )}
          </div>
        </div>

        {/* Modern premium quantity control — width fits content, +/- hover only */}
        <div className="mt-4">
          <div
            role="group"
            aria-label="Quantity selector"
            className="inline-flex items-center gap-2 w-fit rounded-lg border border-slate-100 bg-white/60 backdrop-blur-sm px-2 py-1 shadow-md"
          >
            {/* Decrease */}
            <button
              onClick={handleMinus}
              disabled={disableQuantity || (cartItem?.quantity || 1) <= 1}
              aria-label="Decrease quantity"
              title="Decrease"
              className={`flex items-center justify-center p-2 rounded-md transition-transform transition-colors transform hover:scale-105 hover:bg-slate-100 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-1
        ${disableQuantity || (cartItem?.quantity || 1) <= 1 ? "opacity-50 pointer-events-none" : "cursor-pointer"}`}
            >
              <Minus className="w-5 h-5 text-slate-700 transition-colors hover:text-slate-900" />
            </button>

            {/* Quantity display */}
            <div
              className="px-4 py-1 text-sm font-medium text-gray-700 min-w-[44px] text-center"
              aria-live="polite"
              aria-atomic="true"
            >
              {cartItem?.quantity || 1}
            </div>

            {/* Increase */}
            <button
              onClick={handlePlus}
              disabled={disableQuantity}
              aria-label="Increase quantity"
              title="Increase"
              className={`flex items-center justify-center p-2 rounded-md transition-transform transition-colors transform hover:scale-105 hover:bg-slate-100 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-1
        ${disableQuantity ? "opacity-50 pointer-events-none" : "cursor-pointer"}`}
            >
              <Plus className="w-5 h-5 text-slate-700 transition-colors hover:text-slate-900" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default UserCartItemsContent;
