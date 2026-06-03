import React, { useState } from "react";
import api from "@/api/axios";

export default function ApplyCoupon({ cartTotal, onApplied }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const apply = async () => {
    if (!code) {
      alert("Enter coupon code");
      return;
    }
    setLoading(true);
    try {
      const mobile = typeof window !== "undefined" && window.checkoutPhone ? window.checkoutPhone : "";
      const res = await api.post("/api/shop/coupons/apply", { code, mobile, cartTotal });
      if (res.data && res.data.success) {
        onApplied && onApplied(res.data.data);
      } else {
        alert(res.data?.message || "Coupon failed");
      }
    } catch (e) {
      console.error("apply coupon", e);
      alert("Failed to apply coupon: " + (e.response?.data?.message || e.message || ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-4">
      <div className="flex gap-2">
        <input
          className="flex-1 border p-2 rounded"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Coupon code (optional)"
        />
        <button
          className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-60"
          onClick={apply}
          disabled={loading}
        >
          {loading ? "Applying..." : "Apply"}
        </button>
      </div>
    </div>
  );
}
