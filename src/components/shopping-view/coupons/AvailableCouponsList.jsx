import { Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCouponLabel, savePendingCouponCode } from "@/lib/coupon-utils";

const ACCENT = "#08665F";

function StatusChip({ coupon, isLoggedIn, mode }) {
  if (!isLoggedIn) {
    return (
      <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-800">
        Login to apply
      </span>
    );
  }
  if (!coupon.applicableToCart) {
    return (
      <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
        Not for these items
      </span>
    );
  }
  if (mode === "checkout") {
    return (
      <span className="inline-flex items-center rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-medium text-teal-800">
        Applicable
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-medium text-teal-800">
      Applicable
    </span>
  );
}

export default function AvailableCouponsList({
  coupons = [],
  mode = "cart",
  selectedCode = "",
  appliedCode = "",
  onSelect,
  isLoggedIn = false,
  loading = false,
}) {
  if (loading) {
    return (
      <p className="text-xs text-slate-500 py-2">Loading offers…</p>
    );
  }

  if (!coupons.length) {
    return null;
  }

  const handleTap = (coupon) => {
    const code = coupon.code;
    if (mode === "cart") {
      savePendingCouponCode(code);
    }
    onSelect?.(code, coupon);
  };

  const isHorizontal = mode === "cart";

  return (
    <div
      className={cn(
        "gap-2.5",
        isHorizontal
          ? "flex overflow-x-auto pb-1 -mx-1 px-1 snap-x snap-mandatory scrollbar-thin"
          : "flex flex-col"
      )}
    >
      {coupons.map((coupon) => {
        const code = coupon.code;
        const isSelected = selectedCode && selectedCode.toUpperCase() === code?.toUpperCase();
        const isApplied = appliedCode && appliedCode.toUpperCase() === code?.toUpperCase();
        const disabled = mode === "checkout" && isLoggedIn && !coupon.applicableToCart;

        return (
          <button
            key={coupon._id || code}
            type="button"
            disabled={disabled}
            onClick={() => handleTap(coupon)}
            className={cn(
              "text-left rounded-lg border bg-white transition-all shrink-0",
              isHorizontal ? "min-w-[200px] max-w-[220px] snap-start p-3" : "w-full p-3",
              isSelected || isApplied
                ? "border-[#08665F] ring-1 ring-[#08665F]/30 shadow-sm"
                : "border-slate-200 hover:border-slate-300 hover:shadow-sm",
              disabled && "opacity-50 cursor-not-allowed hover:shadow-none hover:border-slate-200"
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <Tag className="h-3.5 w-3.5 shrink-0" style={{ color: ACCENT }} />
                <span className="text-sm font-semibold text-slate-900 truncate">
                  {coupon.name || code}
                </span>
              </div>
              <span
                className="shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold text-white"
                style={{ backgroundColor: ACCENT }}
              >
                {formatCouponLabel(coupon)}
              </span>
            </div>

            <div className="mt-2 flex items-center justify-between gap-2">
              <code className="text-[11px] font-mono text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded">
                {code}
              </code>
              <StatusChip coupon={coupon} isLoggedIn={isLoggedIn} mode={mode} />
            </div>

            {mode === "cart" && isSelected && (
              <p className="mt-2 text-[10px] text-teal-700">
                Apply this code at checkout
              </p>
            )}
          </button>
        );
      })}
    </div>
  );
}
