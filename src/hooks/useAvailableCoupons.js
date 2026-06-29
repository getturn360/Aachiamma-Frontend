import { useCallback, useEffect, useState } from "react";
import api from "@/api/axios";
import { getCartProductIds } from "@/lib/coupon-utils";

export function useAvailableCoupons(cartItems) {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const productIds = getCartProductIds(cartItems).join(",");

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = productIds ? { productIds } : {};
      const res = await api.get("/api/shop/coupons/available", {
        params,
        skipGlobalLoader: true,
      });
      if (res.data?.success) {
        setCoupons(Array.isArray(res.data.data) ? res.data.data : []);
      } else {
        setCoupons([]);
        setError(res.data?.message || "Failed to load coupons");
      }
    } catch (e) {
      setCoupons([]);
      setError(e?.response?.data?.message || "Failed to load coupons");
    } finally {
      setLoading(false);
    }
  }, [productIds]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { coupons, loading, error, refetch };
}
