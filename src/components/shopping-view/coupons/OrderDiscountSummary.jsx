import { formatCouponLabel } from "@/lib/coupon-utils";

export default function OrderDiscountSummary({
  subtotal = 0,
  coupon = null,
  couponDiscount = 0,
  shippingFee = 0,
  shippingLoading = false,
  isFreeByThreshold = false,
  freeThreshold = 0,
  remainingForFree = 0,
  total = 0,
}) {
  const formatAmount = (value) => `₹${Number(value || 0).toFixed(2)}`;

  return (
    <div className="pt-3">
      <div className="flex items-center justify-between py-2">
        <div className="text-sm text-slate-600">Subtotal</div>
        <div className="text-sm">{formatAmount(subtotal)}</div>
      </div>

      {coupon && couponDiscount > 0 && (
        <div className="flex items-center justify-between py-2">
          <div className="text-sm text-slate-600">
            Coupon{" "}
            <span className="font-medium text-teal-700">
              {coupon.code || coupon.id}
            </span>{" "}
            <span className="text-xs text-slate-400">
              ({formatCouponLabel(coupon)})
            </span>
          </div>
          <div className="text-sm text-green-600">- {formatAmount(couponDiscount)}</div>
        </div>
      )}

      <div className="flex flex-col py-2">
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-600">Shipping</div>
          <div className="text-sm">
            {shippingLoading ? (
              "calculating..."
            ) : isFreeByThreshold ? (
              <span className="text-green-600 font-semibold">Free shipping</span>
            ) : (
              formatAmount(shippingFee)
            )}
          </div>
        </div>

        {freeThreshold > 0 && !isFreeByThreshold && (
          <div className="mt-1 text-xs">
            <span className="text-green-600 font-medium">
              Add ₹{remainingForFree.toFixed(2)} more to get free shipping over ₹
              {freeThreshold}.
            </span>
          </div>
        )}
      </div>

      <div className="border-t mt-3 pt-3 flex items-center justify-between font-semibold text-lg">
        <div>Total</div>
        <div>{formatAmount(total)}</div>
      </div>
    </div>
  );
}
