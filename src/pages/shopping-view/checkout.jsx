// client/src/pages/shopping-view/checkout.jsx
// (full file — minimal edits limited to address selection logic / Address render + coupon percentage recalculation + immediate delete)

import Address from "@/components/shopping-view/address";
import img from "../../assets/account.jpg";
import razorpayLogo from "@/assets/razorpay-icon.png";
import { useDispatch, useSelector } from "react-redux";
import UserCartItemsContent from "@/components/shopping-view/cart-items-content";
import { Button } from "@/components/ui/button";
import { useState, useMemo, useEffect, useRef } from "react";
import { createNewOrder, capturePayment } from "@/store/shop/order-slice";
import { useToast } from "@/components/ui/use-toast";
import { useLocation, useNavigate } from "react-router-dom";
import { deleteCartItem, fetchCartItems } from "@/store/shop/cart-slice";
import ConfirmDialog from "@/components/ui/confirm-dialog";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

import axios from "axios";

const PRIMARY_COLOR = "#08665F";
const PRIMARY_HOVER = "#064e4a";

function PrimaryButton({ children, className = "", style = {}, ...props }) {
  const baseStyle = {
    backgroundColor: PRIMARY_COLOR,
    color: "#fff",
    borderColor: "transparent",
  };
  return (
    <Button
      {...props}
      className={className}
      style={{
        ...baseStyle,
        ...style,
      }}
      onMouseEnter={(e) => {
        try {
          e.currentTarget.style.backgroundColor = PRIMARY_HOVER;
        } catch { }
        if (props.onMouseEnter) props.onMouseEnter(e);
      }}
      onMouseLeave={(e) => {
        try {
          e.currentTarget.style.backgroundColor = PRIMARY_COLOR;
        } catch { }
        if (props.onMouseLeave) props.onMouseLeave(e);
      }}
    >
      {children}
    </Button>
  );
}

function RazorpayLogo({ imgSrc }) {
  const [loaded, setLoaded] = useState(true);

  return (
    <div className="flex items-center">
      {imgSrc && loaded ? (
        <img
          src={imgSrc}
          alt="Razorpay"
          className="h-8 object-contain"
          onError={() => setLoaded(false)}
          onLoad={() => setLoaded(true)}
        />
      ) : (
        <svg className="h-8 w-auto" viewBox="0 0 48 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="48" height="24" rx="4" fill="#fff" />
          <path d="M6 20L12 8H16L20 20H16L14 13L12 20H6Z" fill={PRIMARY_COLOR} />
        </svg>
      )}
    </div>
  );
}

export default function ShoppingCheckout() {
  const { cartItems } = useSelector((state) => state.shopCart || {});
  const { user } = useSelector((state) => state.auth || {});
  // rename setter to avoid shadowing when passing wrapper
  const [currentSelectedAddress, setCurrentSelectedAddressState] = useState(null);
  const [addressForm, setAddressForm] = useState({});
  const [isPaymentStart, setIsPaymemntStart] = useState(false);
  const dispatch = useDispatch();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const buyNowItems = location.state?.items;
  const isBuyNow =
    !!(location.state?.buyNow && Array.isArray(buyNowItems) && buyNowItems.length > 0);

  const [chosenItems, setChosenItems] = useState([]);

  useEffect(() => {
    if (isBuyNow) {
      setChosenItems(buyNowItems.map((it) => ({ ...it, quantity: it.quantity || 1 })));
    } else {
      const arr = cartItems && Array.isArray(cartItems.items) ? cartItems.items : [];
      // create shallow copies so React state changes reliably
      setChosenItems(arr.map((it) => ({ ...(it || {}), quantity: it?.quantity || 1 })));
    }
  }, [isBuyNow, buyNowItems, cartItems]);

  const totalCartAmount = useMemo(() => {
    if (!chosenItems || chosenItems.length === 0) return 0;
    return chosenItems.reduce((sum, currentItem) => {
      const priceToUse =
        currentItem?.salePrice && currentItem.salePrice > 0
          ? currentItem.salePrice
          : currentItem.price || 0;
      const qty = currentItem?.quantity || 1;
      return sum + priceToUse * qty;
    }, 0);
  }, [chosenItems]);

  const handleQtyChange = (productId, action) => {
    if (!isBuyNow) return;
    setChosenItems((prev) =>
      prev.map((item) => {
        if (item.productId === productId) {
          let newQty = item.quantity || 1;
          if (action === "inc") newQty++;
          if (action === "dec" && newQty > 1) newQty--;
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  // Immediate delete (no alert) for checkout UI — optimistic update
  const handleDeleteFromCart = (item) => {
    if (!item) return;
    // Optimistic UI update: remove from chosenItems immediately
    setChosenItems((prev) =>
      prev.filter((i) => {
        // compare by productId + selectedVariant JSON to avoid removing wrong variant
        const sameId = String(i.productId) === String(item.productId);
        const aVar = JSON.stringify(i.selectedVariant || null);
        const bVar = JSON.stringify(item.selectedVariant || null);
        return !(sameId && aVar === bVar);
      })
    );

    if (isBuyNow) {
      toast({ title: "Item removed from order" });
      return;
    }

    // not buyNow: tell backend to remove; include selectedVariant if available
    const selVar = item.selectedVariant || null;
    try {
      dispatch(deleteCartItem({ userId: user?.id || user?._id || null, productId: item.productId, selectedVariant: selVar }))
        .then((res) => {
          // backend may or may not return updated cart; force fetch for logged-in users to sync
          if (user) {
            try {
              dispatch(fetchCartItems(user?.id || user?._id));
            } catch (e) { }
          }
          if (res?.payload?.success) {
            toast({ title: "Item removed from cart" });
          } else {
            // if deletion failed on server, show warning but keep optimistic removal (you may re-sync)
            toast({ title: res?.payload?.message || "Removed locally (server may differ)", variant: "destructive" });
          }
        })
        .catch((e) => {
          console.error("deleteCartItem error:", e);
          // on network error, we already removed locally — best effort: inform user
          toast({ title: "Removed locally (server request failed)", variant: "destructive" });
        });
    } catch (e) {
      console.error("delete dispatch error:", e);
    }
  };

  // keep confirm dialog state (unused for immediate delete) in case you want to re-enable elsewhere
  const [deleteDialog, setDeleteDialog] = useState({ open: false, item: null });
  const openDeleteConfirm = (item) => setDeleteDialog({ open: true, item });
  const closeDeleteConfirm = () => setDeleteDialog({ open: false, item: null });
  const performDelete = () => {
    const item = deleteDialog.item;
    if (!item) return closeDeleteConfirm();
    try {
      handleDeleteFromCart(item);
    } catch (e) {
      console.error("performDelete error", e);
      toast({ title: "Could not remove item", variant: "destructive" });
    } finally {
      closeDeleteConfirm();
    }
  };

  const [guestAddress, setGuestAddress] = useState({});
  useEffect(() => {
    if (!user) {
      const raw = localStorage.getItem("guest_address_v1");
      if (raw) setGuestAddress(JSON.parse(raw));
    }
  }, [user]);

  const [addressModal, setAddressModal] = useState({
    open: false,
    type: null,
    title: "",
    message: "",
  });

  const openAddressModal = (type) => {
    if (type === "select") {
      setAddressModal({
        open: true,
        type: "select",
        title: "Address required",
        message: "Please add or select a delivery address before proceeding to payment.",
      });
    } else {
      setAddressModal({
        open: true,
        type: "fill",
        title: "Billing details required",
        message: "Please enter your billing details (first name, phone, street, city, postcode) before checkout.",
      });
    }
  };

  const loadRazorpayScript = () =>
    new Promise((resolve, reject) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => reject(new Error("Razorpay SDK failed to load"));
      document.body.appendChild(script);
    });

  const [couponApplied, setCouponApplied] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [inlineCouponCode, setInlineCouponCode] = useState("");
  const [applyingInlineCoupon, setApplyingInlineCoupon] = useState(false);
  const [couponError, setCouponError] = useState(null);
  const [couponErrorProducts, setCouponErrorProducts] = useState([]);
  const couponInputRef = useRef(null);

  const API_BASE = (() => {
    try {
      if (typeof window !== "undefined" && window.REACT_APP_API_BASE_URL) {
        return String(window.REACT_APP_API_BASE_URL).replace(/\/$/, "") + "/api";
      }
    } catch (e) { /* ignore */ }
    try {
      if (typeof window !== "undefined") {
        const loc = window.location || {};
        const hostname = loc.hostname || "";
        if (hostname === "localhost" || hostname === "127.0.0.1") {
          return `${loc.protocol || "http:"}//${hostname}:5000/api`;
        }
      }
    } catch (e) { /* ignore */ }
    return "/api";
  })();

  function buildApiPath(pathWithoutApiPrefix) {
    const cleanPath = pathWithoutApiPrefix.startsWith("/") ? pathWithoutApiPrefix : "/" + pathWithoutApiPrefix;
    const base = axios.defaults.baseURL || "";
    try {
      if (base) {
        const b = base.endsWith("/") ? base.slice(0, -1) : base;
        if (b.includes("/api")) return `${b}${cleanPath}`;
        return `${b}/api${cleanPath}`;
      }
      return `/api${cleanPath}`;
    } catch (e) {
      return `/api${cleanPath}`;
    }
  }

  useEffect(() => {
    // if currentSelectedAddress is an object -> fill form
    if (currentSelectedAddress && typeof currentSelectedAddress === "object" && Object.keys(currentSelectedAddress).length > 0) {
      setAddressForm(currentSelectedAddress);
      return;
    }

    if (user) {
      const list = user.addresses || user.addressList || [];
      if (currentSelectedAddress && (typeof currentSelectedAddress === "string" || typeof currentSelectedAddress === "number")) {
        const found = Array.isArray(list) ? list.find((a) => String(a._id) === String(currentSelectedAddress) || String(a.id) === String(currentSelectedAddress)) : null;
        if (found) {
          setAddressForm(found);
          return;
        }
      }
      if (guestAddress && Object.keys(guestAddress).length > 0) {
        setAddressForm(guestAddress);
        return;
      }
      if (Array.isArray(list) && list.length > 0) {
        setAddressForm(list[0]);
        // set default selected address if not already selected
        if (!currentSelectedAddress) {
          try {
            setCurrentSelectedAddressState(list[0]);
          } catch (e) { }
        }
        return;
      }
      setAddressForm({});
      return;
    } else {
      setAddressForm(guestAddress || {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, guestAddress, currentSelectedAddress]);

  useEffect(() => {
    try {
      const phone = addressForm?.phone || "";
      window.checkoutPhone = phone || "";
    } catch (e) { }
  }, [addressForm]);

  const onCouponApplied = (data) => {
    if (!data) {
      setCouponApplied(null);
      setCouponDiscount(0);
      return;
    }
    // Server might return { coupon, discount } OR a coupon object directly.
    const couponObj = data.coupon || (data.coupon ? null : data);
    setCouponApplied(couponObj || null);
    setCouponDiscount(Number(data.discount || 0));
    toast({ title: "Coupon applied", description: `Discount ₹${Number(data.discount || 0)}` });
    setCouponError(null);
    setCouponErrorProducts([]);
  };

  const applyCouponInline = async (code) => {
    if (!code) {
      setCouponError("Enter coupon code");
      setCouponErrorProducts([]);
      if (couponInputRef.current) couponInputRef.current.focus();
      return;
    }

    // ---------- NEW: require address saved / billing filled before allowing coupon ----------
    try {
      if (user) {
        // for logged-in users require a saved address id/object (addressForm populated with saved address)
        const hasSavedAddress = addressForm && (addressForm._id || addressForm.id);
        if (!hasSavedAddress) {
          setCouponError("Please select/save a delivery address before applying coupon.");
          setCouponErrorProducts([]);
          if (couponInputRef.current) try { couponInputRef.current.focus(); } catch { }
          return;
        }
      } else {
        // for guests require billing fields filled
        const hasGuestBilling =
          addressForm &&
          (addressForm.firstName || addressForm.name) &&
          (addressForm.phone || addressForm.whatsapp) &&
          (addressForm.streetAddress || addressForm.address) &&
          addressForm.city &&
          (addressForm.postcode || addressForm.pincode);
        if (!hasGuestBilling) {
          setCouponError("Please fill billing details before applying coupon.");
          setCouponErrorProducts([]);
          if (couponInputRef.current) try { couponInputRef.current.focus(); } catch { }
          return;
        }
      }
    } catch (e) {
      console.error("address-check-before-coupon error", e);
      // fallback: continue to try applying coupon (but prefer being strict)
    }
    // ---------------------------------------------------------------------------------------

    setApplyingInlineCoupon(true);
    try {
      const mobile = addressForm?.phone || "";
      const payloadCartItems = Array.isArray(chosenItems)
        ? chosenItems.map((it) => ({
          productId: it.productId || it._id || it.id,
          name: it.title || it.name || "",
          quantity: it.quantity || 1,
        }))
        : [];

      const res = await axios.post(`${API_BASE}/shop/coupons/apply`, {
        code,
        mobile,
        cartTotal: totalCartAmount,
        cartItems: payloadCartItems,
      });

      if (res.data && res.data.success) {
        onCouponApplied(res.data.data);
      } else {
        const serverMsg = res.data?.message;
        const msg = serverMsg ? `${serverMsg}` : `not applicable`;
        setCouponError(`Coupon "${code}": ${msg}`);

        const serverList =
          res.data?.data?.inapplicableProducts ||
          res.data?.data?.notApplicableProducts ||
          res.data?.data?.inapplicable ||
          res.data?.inapplicableProducts ||
          res.data?.notApplicableProducts ||
          null;

        if (Array.isArray(serverList) && serverList.length > 0) {
          const names = serverList.map((p) => (typeof p === "string" ? p : p?.title || p?.name || p?.productName || "Unnamed product"));
          setCouponErrorProducts(names);
        } else {
          setCouponErrorProducts([]);
        }
      }
    } catch (e) {
      console.error("apply coupon inline error", e);
      const serverMsg = e?.response?.data?.message;
      const msg = serverMsg ? `${serverMsg}` : `not applicable (network error)`;
      setCouponError(`Coupon "${code}": ${msg}`);

      const serverList =
        e?.response?.data?.inapplicableProducts ||
        e?.response?.data?.notApplicableProducts ||
        e?.response?.data?.inapplicable ||
        null;

      if (Array.isArray(serverList) && serverList.length > 0) {
        const names = serverList.map((p) => (typeof p === "string" ? p : p?.title || p?.name || p?.productName || "Unnamed product"));
        setCouponErrorProducts(names);
      } else {
        setCouponErrorProducts([]);
      }
    } finally {
      setApplyingInlineCoupon(false);
    }
  };

  // Recompute adjusted totals using couponDiscount (which may be recalculated below)
  const adjustedTotal = useMemo(() => {
    const sub = Number(totalCartAmount || 0);
    const disc = Number(couponDiscount || 0);
    const total = Math.max(0, sub - disc);
    return { subtotal: sub, discount: disc, total };
  }, [chosenItems, totalCartAmount, couponDiscount]);

  // --- NEW: recalculate couponDiscount when couponApplied is percentage-based and subtotal changes ---
  useEffect(() => {
    if (!couponApplied) return;

    try {
      let disc = 0;
      const c = couponApplied;

      const pickKey = (obj, keys) => {
        for (let k of keys) {
          if (obj && Object.prototype.hasOwnProperty.call(obj, k) && obj[k] != null) return obj[k];
        }
        return null;
      };

      const pctKeys = ["percent", "percentage", "discountPercentage", "discountPercent", "amountPercent", "valuePercent"];
      const amtKeys = ["discount", "amount", "value", "fixedAmount", "fixed"];

      const amountType = pickKey(c, ["amountType", "type", "mode"]);
      if (amountType && /percent|percentage/i.test(String(amountType))) {
        const maybePercent = pickKey(c, ["amount", "value", "discount", ...pctKeys]);
        const numPct = Number(maybePercent || 0);
        disc = Number(((adjustedTotal.subtotal * numPct) / 100).toFixed(2));
      } else {
        const foundPct = pickKey(c, pctKeys);
        if (foundPct != null) {
          const numPct = Number(foundPct || 0);
          disc = Number(((adjustedTotal.subtotal * numPct) / 100).toFixed(2));
        } else {
          const foundAmt = pickKey(c, amtKeys);
          if (foundAmt != null && Number(foundAmt) > 0) {
            disc = Number(foundAmt);
          } else {
            if (typeof couponApplied === "number") {
              disc = Number(couponApplied);
            } else {
              disc = Number(couponDiscount || 0);
            }
          }
        }
      }

      disc = Math.max(0, Math.min(disc, Number(adjustedTotal.subtotal || 0)));
      disc = Number(disc.toFixed(2));
      if (disc !== couponDiscount) setCouponDiscount(disc);
    } catch (e) {
      console.error("coupon recalc error", e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [couponApplied, adjustedTotal.subtotal]);

  const [shippingDoc, setShippingDoc] = useState(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingError, setShippingError] = useState(null);

  useEffect(() => {
    fetchShippingDoc();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchShippingDoc() {
    try {
      setShippingLoading(true);
      setShippingError(null);
      // <-- changed: public common shipping endpoint for storefront
      const url = buildApiPath("/common/shipping");
      // try to include token (if available) and cookies for auth-sensitive endpoints
      const token = (typeof window !== "undefined" && (localStorage.getItem("token") || (user && user.token))) || null;

      const res = await axios.get(url, {
        withCredentials: true, // include cookies (useful if backend uses session cookie)
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          "X-Requested-With": "XMLHttpRequest",
        },
        validateStatus: (status) => status < 500, // let 4xx pass so we can inspect body
      });

      if (res.status === 200 && res.data && res.data.success && res.data.data) {
        setShippingDoc(res.data.data);
        setShippingError(null);
      } else {
        // non-200 (like 403) — surface useful message
        const serverMsg = res.data && (res.data.message || JSON.stringify(res.data)) || res.statusText || `HTTP ${res.status}`;
        setShippingError(serverMsg);
        setShippingDoc(null);
        console.error("fetchShippingDoc non-200 response:", { status: res.status, data: res.data, headers: res.headers });
      }
    } catch (err) {
      // improved error logging: show server response body if available
      console.error("fetchShippingDoc error:", err);
      const serverMsg = err?.response?.data?.message || err?.response?.statusText || err?.message || String(err);
      setShippingError(serverMsg);
      setShippingDoc(null);
    } finally {
      setShippingLoading(false);
    }
  }

  function getAssignedZoneNameForState(stateName) {
    if (!shippingDoc || !stateName) return null;
    const assignments = shippingDoc.assignments || {};
    let zoneName = assignments[stateName];
    try {
      if (!zoneName && typeof assignments.get === "function") {
        zoneName = assignments.get(stateName);
      }
    } catch (e) { }
    return zoneName || null;
  }

  function getZoneChargeByName(zoneName) {
    if (!shippingDoc || !Array.isArray(shippingDoc.zones) || !zoneName) return 0;
    const found = shippingDoc.zones.find((z) => String(z.name).toLowerCase() === String(zoneName).toLowerCase());
    return found ? Number(found.charge || 0) : 0;
  }

  const shippingFee = useMemo(() => {
    if (adjustedTotal.subtotal <= 0) return 0;
    if (!shippingDoc) {
      return 79;
    }

    const threshold = Number(shippingDoc.freeShippingThreshold || 0);
    if (threshold > 0 && adjustedTotal.subtotal >= threshold) {
      return 0;
    }

    const stateName =
      (addressForm && (addressForm.state || addressForm.region || addressForm.stateName)) ||
      (typeof currentSelectedAddress === "object" && currentSelectedAddress?.state) ||
      null;

    if (!stateName) {
      return 0;
    }
    const zoneName = getAssignedZoneNameForState(stateName);
    if (!zoneName) return 0;
    return getZoneChargeByName(zoneName);
  }, [adjustedTotal.subtotal, shippingDoc, addressForm, currentSelectedAddress]);

  const freeThreshold = Number(shippingDoc?.freeShippingThreshold || 0);
  const isFreeByThreshold = freeThreshold > 0 && adjustedTotal.subtotal >= freeThreshold;
  const remainingForFree = Math.max(0, freeThreshold - adjustedTotal.subtotal);

  const payableTotal = useMemo(() => {
    return Math.max(0, adjustedTotal.total + (Number(shippingFee || 0)));
  }, [adjustedTotal.total, shippingFee]);

  const handleInitiateRazorpayPayment = async () => {
    if (!chosenItems || chosenItems.length === 0) {
      toast({ title: "Your cart is empty. Please add items to proceed", variant: "destructive" });
      return;
    }

    if (!addressForm || !(addressForm.streetAddress || addressForm.address) || !addressForm.city || !(addressForm.postcode || addressForm.pincode) || !addressForm.phone || !addressForm.firstName) {
      if (user) {
        openAddressModal("select");
      } else {
        openAddressModal("fill");
      }
      return;
    }

    const orderData = {
      userId: user?.id || user?._id || null,
      cartId: isBuyNow ? null : cartItems?._id || null,
      cartItems: chosenItems.map((singleCartItem) => ({
        productId: singleCartItem?.productId || singleCartItem?._id,
        title: singleCartItem?.title,
        image: singleCartItem?.image,
        price: singleCartItem?.salePrice > 0 ? singleCartItem?.salePrice : singleCartItem?.price,
        quantity: singleCartItem?.quantity || 1,
        // **added sku & hsn** so invoice generator gets HSN
        sku: singleCartItem?.sku || (singleCartItem?.selectedVariant && singleCartItem.selectedVariant.sku) || "",
        hsn: singleCartItem?.hsn || (singleCartItem?.product && singleCartItem.product.hsn) || "",
      })),
      addressInfo: {
        addressId: addressForm?._id || addressForm?.id || null,
        firstName: addressForm?.firstName || addressForm?.name || "",
        lastName: addressForm?.lastName || addressForm?.name || "",
        company: addressForm?.company || "",
        whatsapp: addressForm?.whatsapp || "",
        country: addressForm?.country || "India",
        streetAddress: addressForm?.streetAddress || addressForm?.address || "",
        apartment: addressForm?.apartment || "",
        city: addressForm?.city || "",
        state: addressForm?.state || "Kerala",
        postcode: addressForm?.postcode || addressForm?.pincode || "",
        phone: addressForm?.phone || "",
        email: addressForm?.email || "",
        addressType: addressForm?.addressType || "Home",
        notes: addressForm?.notes || "",
      },
      orderStatus: "pending",
      paymentMethod: "razorpay",
      paymentStatus: "pending",
      subtotal: Number(adjustedTotal.subtotal || 0),      // included subtotal
      shippingAmount: Number(shippingFee || 0),          // included shipping amount
      discountAmount: Number(couponDiscount || 0),       // included discount amount
      totalAmount: Number(payableTotal || 0),
      orderDate: new Date(),
      orderUpdateDate: new Date(),
      paymentId: "",
      payerId: "",
      meta: {
        fromBuyNow: isBuyNow,
        // keep existing coupon object for backend logic, but also expose couponCode and couponDiscount
        coupon: couponApplied ? { id: couponApplied.id || couponApplied._id, code: couponApplied.code, discount: couponDiscount } : null,
        couponCode: couponApplied ? (couponApplied.code || couponApplied.id || couponApplied._id) : null,
        couponDiscount: Number(couponDiscount || 0),
      },
    };

    setIsPaymemntStart(true);
    try {
      const resAction = await dispatch(createNewOrder(orderData));
      setIsPaymemntStart(false);
      const payload = resAction?.payload;

      if (!payload?.success) {
        toast({ title: payload?.message || "Failed to initiate order", variant: "destructive" });
        return;
      }

      const { orderId: internalOrderId, razorpayOrder, razorpayKeyId } = payload.data || {};
      if (!razorpayOrder || !razorpayKeyId) {
        toast({ title: "Payment initialization failed", variant: "destructive" });
        return;
      }

      await loadRazorpayScript();

      const options = {
        key: razorpayKeyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency || "INR",
        name: "Aachi Amma Foods",
        description: `Order ${internalOrderId}`,
        order_id: razorpayOrder.id,
        handler: async function (response) {
          try {
            const capAction = await dispatch(
              capturePayment({
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                signature: response.razorpay_signature,
                internalOrderId,
              })
            );
            const capPayload = capAction?.payload;
            if (capPayload?.success) {
              toast({ title: "Payment successful", description: "Your payment was successful. Order placed." });

              if (!user) {
                localStorage.removeItem("guest_cart_v1");
                dispatch(fetchCartItems(null));
              } else {
                dispatch(fetchCartItems(user?.id || user?._id));
              }

              navigate("/shop/payment-success");
            } else {
              toast({ title: "Payment verification failed", description: capPayload?.message || "Verification failed", variant: "destructive" });
            }
          } catch (err) {
            console.error("capture error:", err);
            toast({ title: "Payment failed", description: "Could not verify payment", variant: "destructive" });
          }
        },
        modal: {
          ondismiss: function () {
            setIsPaymemntStart(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setIsPaymemntStart(false);
      console.error("create order error", err);
      toast({ title: "Order failed. Check console for details.", variant: "destructive" });
    }
  };

  const handleModalPrimary = () => {
    if (addressModal.type === "select") {
      const el = document.querySelector(".shopping-address-list");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else if (addressModal.type === "fill") {
      const el = document.querySelector(".billing-form");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const rightRef = useRef(null);
  useEffect(() => {
    if (!rightRef.current) return;
    const mm = gsap.matchMedia();

    mm.add("all", () => {
      const anim = gsap.from(rightRef.current, {
        opacity: 0,
        y: 24,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: {
          trigger: rightRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      });
      return () => anim.kill();
    });

    return () => {
      try {
        mm.revert();
      } catch (e) { }
    };
  }, []);

  return (
    <div className="flex flex-col">
      <ConfirmDialog
        open={addressModal.open}
        title={addressModal.title}
        message={addressModal.message}
        primaryLabel={addressModal.type === "select" ? "Go to addresses" : "Fill billing details"}
        secondaryLabel="Cancel"
        onPrimary={() => {
          handleModalPrimary();
        }}
        onSecondary={() => { }}
        onClose={() => setAddressModal({ open: false, type: null })}
      />

      <ConfirmDialog
        open={deleteDialog.open}
        title="Remove item?"
        message={deleteDialog.item ? `Remove "${deleteDialog.item.title || deleteDialog.item.name || "item"}" from your order?` : "Remove item from order?"}
        primaryLabel="Remove"
        secondaryLabel="Cancel"
        primaryClassName="bg-red-600 hover:bg-red-700 text-white focus:ring-red-300"
        onPrimary={() => performDelete()}
        onSecondary={() => closeDeleteConfirm()}
        onClose={() => closeDeleteConfirm()}
      />


      <div className="relative h-[300px] w-full overflow-hidden">
        <img src={img} className="h-full w-full object-cover object-center" alt="banner" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5 p-5">
        <div>
          <div className="p-4 border rounded billing-form bg-white">
            <h3 className="font-semibold mb-2">{user ? "Delivery address" : "Billing details"}</h3>

            {user ? (
              <Address
                selectedId={currentSelectedAddress?._id || currentSelectedAddress}
                setCurrentSelectedAddress={(val) => {
                  if (!val) {
                    setCurrentSelectedAddressState(null);
                    setAddressForm({});
                    return;
                  }
                  if (typeof val === "object") {
                    setCurrentSelectedAddressState(val);
                    setAddressForm(val);
                    return;
                  }
                  const list = user.addresses || user.addressList || [];
                  const found =
                    Array.isArray(list) && list.length
                      ? list.find((a) => String(a._id) === String(val) || String(a.id) === String(val))
                      : null;
                  if (found) {
                    setCurrentSelectedAddressState(found);
                    setAddressForm(found);
                  } else {
                    setCurrentSelectedAddressState(val);
                    setAddressForm({});
                  }
                }}
                showUse={true}
              />
            ) : (
              <Address
                value={addressForm}
                onChange={(val) => {
                  setAddressForm(val || {});
                  setGuestAddress(val || {});
                  setCurrentSelectedAddressState((prev) => {
                    if (prev && (typeof prev === "string" || typeof prev === "number")) return null;
                    return prev;
                  });
                }}
              />
            )}
          </div>
        </div>

        <div
          ref={rightRef}
          className="flex flex-col gap-4 md:sticky md:top-20 md:self-start"
          style={{ willChange: "transform" }}
        >
          {chosenItems && chosenItems.length > 0 ? (
            chosenItems.map((item, idx) => {
              const propsForItem = isBuyNow
                ? {
                  onInc: () => handleQtyChange(item.productId, "inc"),
                  onDec: () => handleQtyChange(item.productId, "dec"),
                  onDelete: () => handleDeleteFromCart(item), // immediate delete, no alert
                  disableQuantity: false,
                }
                : {
                  onInc: undefined,
                  onDec: undefined,
                  onDelete: () => handleDeleteFromCart(item), // immediate delete, no alert
                  disableQuantity: false,
                };

              // key includes selectedVariant to avoid collisions
              const variantKey = item?.selectedVariant ? JSON.stringify(item.selectedVariant) : "no-variant";
              const key = `${item.productId || item._id || idx}-${variantKey}`;

              return <UserCartItemsContent key={key} cartItem={item} {...propsForItem} />;
            })
          ) : (
            <p className="text-sm text-slate-500">No items to checkout.</p>
          )}

          <div className="bg-white p-3 rounded shadow-sm w-full">
            <div className="text-sm font-medium mb-2">Have a coupon? (optional)</div>
            <div className="flex gap-2">
              <input
                ref={couponInputRef}
                value={inlineCouponCode}
                onChange={(e) => {
                  setInlineCouponCode(e.target.value);
                  if (couponError) setCouponError(null);
                  if (couponErrorProducts && couponErrorProducts.length) setCouponErrorProducts([]);
                }}
                className="flex-1 border p-2 rounded"
                placeholder="Coupon code"
              />
              <PrimaryButton
                onClick={() => applyCouponInline(inlineCouponCode)}
                disabled={applyingInlineCoupon}
                className="px-4 py-2"
                style={{ minWidth: 90 }}
              >
                {applyingInlineCoupon ? "Applying..." : "Apply"}
              </PrimaryButton>
            </div>

            {couponError && (
              <div className="mt-3 p-3 rounded-md border border-rose-200 bg-rose-50 flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <div className="shrink-0">
                    <svg className="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"></path>
                    </svg>
                  </div>
                  <div className="flex-1 text-sm text-rose-700">{couponError}</div>
                  <div className="flex-shrink-0">
                    <button
                      onClick={() => {
                        setCouponError(null);
                        setCouponErrorProducts([]);
                        if (couponInputRef.current) {
                          try {
                            couponInputRef.current.focus();
                          } catch { }
                        }
                      }}
                      className="px-3 py-1 rounded bg-white border text-sm hover:bg-slate-50"
                    >
                      OK
                    </button>
                  </div>
                </div>

                {couponErrorProducts && couponErrorProducts.length > 0 && (
                  <div className="text-xs text-rose-700">
                    <ul className="ml-4 list-disc">
                      {couponErrorProducts.map((p, i) => (
                        <li key={`${p}-${i}`} className="truncate">
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {couponApplied && (
              <div className="mt-2 text-sm text-green-700">
                Applied: {couponApplied.code || couponApplied.id || "coupon"} — ₹{couponDiscount}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg border shadow-sm p-4 w-full">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-semibold text-slate-600 tracking-wider">YOUR ORDER</div>
              <div className="text-sm text-slate-500">Summary</div>
            </div>

            <div className="divide-y">
              <div className="pb-3">
                {chosenItems.map((it) => {
                  const priceToUse = it?.salePrice && it.salePrice > 0 ? it.salePrice : it.price || 0;
                  const qty = it.quantity || 1;
                  return (
                    <div key={it.productId || it._id} className="flex items-center justify-between py-2">
                      <div className="text-sm text-slate-700">
                        {it.title} <span className="text-xs text-slate-400">× {qty}</span>
                      </div>
                      <div className="text-sm font-medium">₹{(priceToUse * qty).toFixed(2)}</div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-3">
                <div className="flex items-center justify-between py-2">
                  <div className="text-sm text-slate-600">Subtotal</div>
                  <div className="text-sm">₹{adjustedTotal.subtotal.toFixed(2)}</div>
                </div>

                <div className="flex flex-col py-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-slate-600">Shipping</div>
                    <div className="text-sm">
                      {shippingLoading ? (
                        "calculating..."
                      ) : isFreeByThreshold ? (
                        <span className="text-green-600 font-semibold">Free shipping</span>
                      ) : (
                        `₹${Number(shippingFee || 0).toFixed(2)}`
                      )}
                    </div>
                  </div>

                  {freeThreshold > 0 && !isFreeByThreshold && (
                    <div className="mt-1 text-xs">
                      <span className="text-green-600 font-medium">
                        Add ₹{remainingForFree.toFixed(2)} more to get free shipping over ₹{freeThreshold}.
                      </span>
                    </div>
                  )}
                </div>

                {couponDiscount > 0 && (
                  <div className="flex items-center justify-between py-2">
                    <div className="text-sm text-slate-600">Coupon discount</div>
                    <div className="text-sm text-green-600">- ₹{adjustedTotal.discount.toFixed(2)}</div>
                  </div>
                )}

                <div className="border-t mt-3 pt-3 flex items-center justify-between font-semibold text-lg">
                  <div>Total</div>
                  <div>₹{payableTotal.toFixed(2)}</div>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="text-sm font-medium mb-2">Payment</div>

              <div className="p-3 border rounded-md bg-white flex items-start gap-3">
                <div className="flex-shrink-0">
                  <RazorpayLogo imgSrc={razorpayLogo} />
                </div>
                <div className="flex-1">
                  <div className="font-semibold">Pay by Razorpay</div>
                  <div className="text-xs text-slate-500 mt-1">
                    Pay securely by Credit / Debit card or Internet Banking through Razorpay.
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <PrimaryButton
                onClick={handleInitiateRazorpayPayment}
                className="w-full py-3 rounded-md transition-none"
                style={{
                  backgroundColor: "#D97706",
                  borderColor: "#D97706",
                  color: "#ffffff",
                  fontWeight: 700,
                }}
                disabled={isPaymentStart}
              >
                {isPaymentStart ? "Processing..." : "PLACE ORDER"}
              </PrimaryButton>
            </div>

            <div className="text-xs text-slate-400 mt-3">
              Your personal data will be used to process your order, support your experience throughout this website, and for other purposes described in our privacy policy.
            </div>
            {shippingError && (
              <div className="text-sm text-yellow-700 bg-yellow-50 p-2 rounded mt-3">
                Could not fetch shipping config from server — using fallback flat shipping rate.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
