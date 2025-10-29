// client/src/components/checkout/ApplyCoupon.jsx
import React, { useState } from "react";
import axios from "axios";

/**
 * Safe API base for shop coupon apply:
 * - runtime window.REACT_APP_API_BASE_URL (preferred)
 * - if running on localhost, default to http://localhost:5000
 * - otherwise use relative '/api/shop/coupons'
 *
 * NOTE: This file deliberately avoids any reference to `process` or `import.meta`.
 */
const API = (() => {
  try {
    if (typeof window !== "undefined" && window.REACT_APP_API_BASE_URL) {
      return String(window.REACT_APP_API_BASE_URL).replace(/\/$/, "") + "/api/shop/coupons";
    }
  } catch (e) {
    /* ignore */
  }

  try {
    if (typeof window !== "undefined") {
      const loc = window.location || {};
      const hostname = loc.hostname || "";
      if (hostname === "localhost" || hostname === "127.0.0.1") {
        return `${loc.protocol || "http:"}//${hostname}:5000/api/shop/coupons`;
      }
    }
  } catch (e) {
    /* ignore */
  }

  return "/api/shop/coupons";
})();

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
      const mobile = window.checkoutPhone || "";
      const res = await axios.post(`${API}/apply`, { code, mobile, cartTotal });
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
