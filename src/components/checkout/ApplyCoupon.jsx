import React, { useState } from "react";
import axios from "axios";


const API_BASE_RAW = (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE || "").replace(/\/$/, "");
function buildUrl(path = "/apply") {

  if (!path.startsWith("/")) path = `/${path}`;
  if (API_BASE_RAW) {

    if (API_BASE_RAW.includes("/api")) {
      return `${API_BASE_RAW}${path}`;
    }
    return `${API_BASE_RAW}/api/shop/coupons${path}`;
  }

  return `/api/shop/coupons${path}`;
}

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
      const mobile = (typeof window !== "undefined" && window.checkoutPhone) ? window.checkoutPhone : "";
      const endpoint = buildUrl("/apply");
      const res = await axios.post(endpoint, { code, mobile, cartTotal });
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
