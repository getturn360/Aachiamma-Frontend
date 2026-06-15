import React, { useEffect, useRef } from "react";
import { Route, Routes, useLocation, useNavigationType } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { checkAuth, setUser } from "./store/auth-slice";
import api from "./api/axios";
import AuthLayout from "./components/auth/layout";
import AuthLogin from "./pages/auth/login";
import AuthRegister from "./pages/auth/register";
import AdminLayout from "./components/admin-view/layout";
import AdminDashboard from "./pages/admin-view/dashboard";
import AdminAnalytics from "./pages/admin-view/analytics";
import AdminProducts from "./pages/admin-view/products";
import AdminOrders from "./components/admin-view/orders";
import AdminFeatures from "./pages/admin-view/features";
import AdminXLFeatures from "./pages/admin-view/xl-features";
import AdminNewsletter from "./pages/admin-view/newsletter";
import InvoiceControlPage from "./pages/admin-view/invoice-control";
import AdminReviews from "./components/admin-view/reviews";
import AdminCoupons from "./pages/admin-view/coupons";
import AdminAddCoupon from "./pages/admin-view/add-coupon";
import AdminShipping from "./pages/admin-view/shipping";
import AdminTopbar from "./pages/admin-view/topbar";
import AdminCategories from "./pages/admin-view/categories";
import AdminContactMessages from "./pages/admin-view/contact-messages";
import ShoppingLayout from "./components/shopping-view/layout";
import NotFound from "./pages/not-found";
import ShoppingHome from "./pages/shopping-view/home";
import ShoppingListing from "./pages/shopping-view/listing";
import ShoppingCheckout from "./pages/shopping-view/checkout";
import ShoppingAccount from "./pages/shopping-view/account";
import CheckAuth from "./components/common/check-auth";
import UnauthPage from "./pages/unauth-page";
import PaymentSuccessPage from "./pages/shopping-view/payment-success";
import AboutInner from "./pages/shopping-view/about";
import ContactPage from "./pages/shopping-view/contact";
import FAQsPage from "./pages/shopping-view/faqs";
import TermsPage from "./pages/shopping-view/TermsPage";
import PrivacyPolicy from "./pages/shopping-view/PrivacyPolicy";
import RefundPolicy from "./pages/shopping-view/RefundPolicy";
import ShippingPolicy from "./pages/shopping-view/ShippingPolicy";
import ProductDetailsPage from "./pages/shopping-view/product-details";
import SpecialProductsPage from "./pages/shopping-view/special-products";
import { ConnectedLoader } from "@/components/common/Loader";
import GoogleAnalytics from "@/components/common/GoogleAnalytics";
import { Analytics } from "@vercel/analytics/react";
import {SpeedInsights} from "@vercel/speed-insights/react";

function ScrollManager() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const prevHashRef = useRef(null);
  const timeoutsRef = useRef([]);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((t) => clearTimeout(t));
      timeoutsRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (location.hash) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      window.scrollTo(0, 0);
    } else {
      try {
        window.scrollTo({ top: 0, behavior: "auto" });
      } catch (e) {
        window.scrollTo(0, 0);
      }
    }
  }, [location.pathname]);

  useEffect(() => {
    timeoutsRef.current.forEach((t) => clearTimeout(t));
    timeoutsRef.current = [];

    if (!location.hash) {
      prevHashRef.current = location.hash;
      return;
    }

    if (navigationType === "POP" && prevHashRef.current === location.hash) {
      prevHashRef.current = location.hash;
      return;
    }

    prevHashRef.current = location.hash;

    const id = location.hash.replace("#", "");
    let attempts = 0;

    const tryScroll = () => {
      const el = document.getElementById(id) || document.querySelector(`[name="${id}"]`);
      if (el) {
        const header = document.querySelector("header");
        const headerOffset = header && header.offsetHeight ? header.offsetHeight : 88;
        const elementTop = el.getBoundingClientRect().top + window.pageYOffset;
        const scrollToY = Math.max(0, elementTop - headerOffset - 12);
        const prefersReduced =
          typeof window !== "undefined" &&
          window.matchMedia &&
          window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        if (prefersReduced) {
          window.scrollTo(0, scrollToY);
        } else {
          try {
            window.scrollTo({ top: scrollToY, behavior: "smooth" });
          } catch (e) {
            window.scrollTo(0, scrollToY);
          }
        }
        return;
      }

      if (attempts < 12) {
        attempts += 1;
        const timeoutId = setTimeout(tryScroll, 60 + attempts * 40);
        timeoutsRef.current.push(timeoutId);
      }
    };

    const initialTimeout = setTimeout(tryScroll, 40);
    timeoutsRef.current.push(initialTimeout);

    return () => {
      timeoutsRef.current.forEach((t) => clearTimeout(t));
      timeoutsRef.current = [];
    };
  }, [location.hash, location.pathname, navigationType]);

  return null;
}

function App() {
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated && !user) {
      dispatch(checkAuth());
    }
  }, [isAuthenticated, user, dispatch]);

  // Refresh access token before the 15-minute expiry while the user is active.
  useEffect(() => {
    if (!isAuthenticated) return undefined;

    const REFRESH_INTERVAL_MS = 12 * 60 * 1000;

    const refreshSession = async () => {
      try {
        const resp = await api.post("/api/auth/refresh", {}, { skipGlobalLoader: true });
        if (resp?.data?.user) {
          dispatch(setUser(resp.data.user));
        }
      } catch {
        // Expired refresh token — checkAuth / route guards handle logout.
      }
    };

    const intervalId = setInterval(refreshSession, REFRESH_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [isAuthenticated, dispatch]);

  return (
    <div className="flex flex-col overflow-hidden bg-white">
      <GoogleAnalytics />
      <Analytics />
      <SpeedInsights/>
      <ScrollManager />
      {!isAdminRoute && <ConnectedLoader />}

      <Routes>
        <Route
          path="/"
          element={
            <CheckAuth isAuthenticated={isAuthenticated} user={user} loading={loading}>
              <ShoppingLayout />
            </CheckAuth>
          }
        >
          <Route index element={<ShoppingHome />} />
          <Route path="listing" element={<ShoppingListing />} />
          <Route path="special/:type" element={<SpecialProductsPage />} />
          <Route path="product/:id" element={<ProductDetailsPage />} />
          <Route path="checkout" element={<ShoppingCheckout />} />
          <Route path="account" element={<ShoppingAccount />} />
          <Route path="payment-success" element={<PaymentSuccessPage />} />
          <Route path="about" element={<AboutInner />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="faq" element={<FAQsPage />} />
          <Route path="terms" element={<TermsPage />} />
          <Route path="privacy" element={<PrivacyPolicy />} />
          <Route path="refunds" element={<RefundPolicy />} />
          <Route path="shipping" element={<ShippingPolicy />} />
        </Route>

        <Route
          path="/auth"
          element={
            <CheckAuth isAuthenticated={isAuthenticated} user={user} loading={loading}>
              <AuthLayout />
            </CheckAuth>
          }
        >
          <Route path="login" element={<AuthLogin />} />
          <Route path="register" element={<AuthRegister />} />
        </Route>

        <Route
          path="/admin"
          element={
            <CheckAuth isAuthenticated={isAuthenticated} user={user} loading={loading}>
              <AdminLayout />
            </CheckAuth>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="features" element={<AdminFeatures />} />
          <Route path="xl-features" element={<AdminXLFeatures />} />
          <Route path="newsletter" element={<AdminNewsletter />} />
          <Route path="topbar" element={<AdminTopbar />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="coupons/add" element={<AdminAddCoupon />} />
          <Route path="coupons/add/:id" element={<AdminAddCoupon />} />
          <Route path="shipping" element={<AdminShipping />} />
          <Route path="invoice-control" element={<InvoiceControlPage />} />
          <Route path="contact-messages" element={<AdminContactMessages />} />
        </Route>

        <Route path="/unauth-page" element={<UnauthPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
