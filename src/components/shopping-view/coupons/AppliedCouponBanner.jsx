import { CheckCircle2, X } from "lucide-react";
import { formatCouponLabel } from "@/lib/coupon-utils";

export default function AppliedCouponBanner({ coupon, discount, onRemove }) {
  if (!coupon) return null;

  const code = coupon.code || coupon.id || "COUPON";
  const label = formatCouponLabel(coupon);

  return (
    <div className="mt-3 flex items-center gap-3 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2.5">
      <CheckCircle2 className="h-5 w-5 shrink-0 text-teal-700" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-teal-900">
          {code} applied — {label}
        </p>
        <p className="text-xs text-teal-700">
          You save ₹{Number(discount || 0).toFixed(2)}
        </p>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="shrink-0 rounded-md p-1 text-teal-700 hover:bg-teal-100 transition"
        aria-label="Remove coupon"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
