import React, { useEffect, useState, useRef } from "react";
import {
  HousePlug,
  LogOut,
  Menu,
  ShoppingCart,
  UserCog,
  Search,
  Truck,
  Tag,
  Gift,
  Percent,
  Star,
  Heart,
  Calendar,
  Clock,
  Globe,
  CreditCard,
  Phone,
  ShoppingBag,
  Box,
  MapPin,
  ChevronDown,
  X as CloseIcon,
} from "lucide-react";
import logoFrontFallback from "../../assets/logo-1.png";
import logoBackFallback from "../../assets/logo-4.png";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import { shoppingViewHeaderMenuItems } from "@/config";
import { ROUTES } from "@/config/routes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { logoutUser } from "@/store/auth-slice";
import UserCartWrapper from "./cart-wrapper";
import { fetchCartItems } from "@/store/shop/cart-slice";
import { Label } from "../ui/label";
import api from "@/api/axios"; 

const ACCENT = "#08665F";
const YELLOW = "#FFD166";

const IconMap = {
  Truck,
  Percent,
  Tag,
  Gift,
  Star,
  HousePlug,
  ShoppingCart,
  UserCog,
  Heart,
  Calendar,
  Clock,
  Globe,
  CreditCard,
  Phone,
  ShoppingBag,
  Box,
  MapPin,
};

function safeScrollTo(top) {
  try {
    const html = document.documentElement;
    const prev = html.style.scrollBehavior;
    html.style.scrollBehavior = "auto";
    window.scrollTo({ top, behavior: "auto" });
    setTimeout(() => {
      try {
        html.style.scrollBehavior = prev || "";
      } catch (e) {}
    }, 160);
  } catch (e) {
    try {
      window.scrollTo(0, top);
    } catch (err) {}
  }
}

function MenuItems({ onItemClick, navigateTo, excludeIds = [], mobile = false } = {}) {
  const navigate = navigateTo || useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [menuCategories, setMenuCategories] = useState([]);
  const [productsOpenDesktop, setProductsOpenDesktop] = useState(false);
  const [productsExpandedMobile, setProductsExpandedMobile] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadCats() {
      try {
        const res = await api.get("/api/common/categories/get");
        if (mounted && res?.data?.success) {
          setMenuCategories(res.data.categories || []);
        }
      } catch (e) {}
    }
    loadCats();
    return () => {
      mounted = false;
    };
  }, []);

  function handleNavigate(getCurrentMenuItem) {
    try {
      sessionStorage.removeItem("filters");

      const id = getCurrentMenuItem.id;
      const isAll = id === "all";
      const currentFilter =
        !isAll && id !== "home" && id !== "products" && id !== "search"
          ? { category: [id] }
          : null;

      if (currentFilter) {
        try {
          sessionStorage.setItem("filters", JSON.stringify(currentFilter));
        } catch (e) {}
      }

      const targetPath = getCurrentMenuItem.path || ROUTES.listing;

      const isOnListing =
        location.pathname === ROUTES.listing ||
        location.pathname.startsWith(`${ROUTES.listing}/`);
      const isListingTarget =
        targetPath === ROUTES.listing ||
        targetPath.startsWith(`${ROUTES.listing}?`);

      if (isOnListing && isListingTarget) {
        const params = new URLSearchParams();
        if (currentFilter) params.set("category", String(id));
        params.set("_", String(Date.now()));
        try {
          setSearchParams(params);
        } catch (e) {}
        try {
          navigate(`${ROUTES.listing}?${params.toString()}`);
        } catch (e) {
          try {
            window.history.replaceState({}, "", `${ROUTES.listing}?${params.toString()}`);
          } catch (err) {}
        }
        try {
          window.scrollTo({ top: 0, behavior: "smooth" });
        } catch (e) {}
      } else {
        if (currentFilter) {
          const params = new URLSearchParams();
          params.set("category", String(id));
          navigate(`${targetPath}?${params.toString()}`);
        } else {
          try {
            navigate(targetPath);
          } catch (e) {
            try {
              window.location.href = targetPath;
            } catch (err) {}
          }
        }
        setTimeout(() => {
          try {
            window.scrollTo({ top: 0, behavior: "smooth" });
          } catch (e) {}
        }, 60);
      }

      try {
        onItemClick && onItemClick();
      } catch (e) {}
    } catch (err) {
      console.error("handleNavigate error", err);
      try {
        navigate(getCurrentMenuItem.path || ROUTES.listing);
      } catch (e) {}
    }
  }

  function navigateToAnchor(anchorId) {
    try {
      try {
        sessionStorage.removeItem("filters");
      } catch (e) {}

      navigate(ROUTES.listing);
      setTimeout(() => {
        navigate(ROUTES.special(anchorId));
      }, 10);

      try {
        onItemClick && onItemClick();
      } catch (e) {}
    } catch (e) {}
  }

  const filtered = shoppingViewHeaderMenuItems.filter((m) => m.id !== "search" && !excludeIds.includes(m.id));

  if (mobile) {
    return (
      <nav className="flex flex-col gap-3">
        {filtered.map((menuItem) => {
          const isProducts = menuItem.id === "products";
          if (isProducts) {
            return (
              <div key={menuItem.id} className="flex flex-col gap-2">
                <button
                  onClick={() => setProductsExpandedMobile((s) => !s)}
                  aria-expanded={productsExpandedMobile}
                  className="w-full flex items-center justify-between py-4 px-4 rounded-xl font-semibold shadow-sm"
                  style={{
                    background: "#fff",
                    color: ACCENT,
                    border: `1px solid ${ACCENT}10`,
                  }}
                >
                  <span>{menuItem.label}</span>
                  <ChevronDown className={`w-5 h-5 transition-transform ${productsExpandedMobile ? "rotate-180" : "rotate-0"}`} />
                </button>

                <div className={`flex flex-col ml-0 mt-2 mb-2 ${productsExpandedMobile ? "block" : "hidden"}`}>
                  {/* Static "All Products" entry — always visible */}
                  <button
                    key="all-products"
                    onClick={() => handleNavigate({ id: "all", path: ROUTES.listing })}
                    className="w-full text-left py-3 px-3 rounded-lg text-sm font-semibold shadow-xs hover:shadow-sm border-b"
                    style={{ borderColor: "rgba(8,102,95,0.06)" }}
                  >
                    All Products
                  </button>
                  {(menuCategories || []).length === 0 ? null : (
                    menuCategories.map((c) => (
                      <button
                        key={c._id || c.slug || c.name}
                        onClick={() => handleNavigate({ id: c.slug || c._id || c.name, path: ROUTES.listing })}
                        className="w-full text-left py-3 px-3 rounded-lg text-sm font-medium shadow-xs hover:shadow-sm border-b last:border-b-0"
                        style={{ borderColor: "rgba(8,102,95,0.06)" }}
                      >
                        {c.name}
                      </button>
                    ))
                  )}

                
                </div>
              </div>
            );
          }

          return (
            <button
              key={menuItem.id}
              onClick={() => handleNavigate(menuItem)}
              className="w-full text-left py-4 px-4 rounded-xl text-base font-medium shadow-sm hover:shadow-md border-b last:border-b-0"
              style={{ borderColor: "rgba(8,102,95,0.06)" }}
            >
              {menuItem.label}
            </button>
          );
        })}
      </nav>
    );
  }

  const baseClass = `cursor-pointer text-base lg:text-sm font-medium rounded-md px-2 py-1 transition transform hover:-translate-y-0.5 whitespace-nowrap`;

  return (

    <nav className="flex flex-col gap-4 lg:flex-row lg:gap-6 items-start lg:items-center overflow-x-auto scrollbar-hide" style={{ WebkitOverflowScrolling: "touch" }}>
      {filtered.map((menuItem) => {
        const isProducts = menuItem.id === "products";

        if (isProducts) {
          const triggerClass = productsOpenDesktop
            ? "inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent)] text-white font-semibold shadow-sm"
            : "inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-[var(--accent)] font-semibold shadow-sm border";

          return (
            <div key={menuItem.id} className="flex flex-col lg:flex-row lg:items-center lg:gap-3">
              <DropdownMenu onOpenChange={(v) => setProductsOpenDesktop(Boolean(v))}>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    aria-expanded={productsOpenDesktop}
                    aria-controls="products-menu"
                    className={triggerClass}
                    style={{ ["--accent"]: ACCENT, borderColor: `${ACCENT}33`, whiteSpace: "nowrap" }}
                  >
                    <span className="select-none">Products</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${productsOpenDesktop ? "rotate-180" : "rotate-0"}`}
                      style={{ transformOrigin: "center", color: productsOpenDesktop ? "#fff" : ACCENT }}
                    />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent id="products-menu" side="bottom" align="start" className="w-56">
                  {/* Static "All Products" entry — always visible regardless of backend categories */}
                  <DropdownMenuItem
                    key="all-products"
                    onSelect={() => handleNavigate({ id: "all", path: ROUTES.listing })}
                    className="border-b font-semibold"
                    style={{ borderColor: "rgba(8,102,95,0.06)" }}
                  >
                    All Products
                  </DropdownMenuItem>
                  {menuCategories.map((c, idx) => (
                    <DropdownMenuItem
                      key={c._id || c.slug || c.name}
                      onSelect={() => handleNavigate({ id: c.slug || c._id || c.name, path: ROUTES.listing })}
                      className="border-b last:border-b-0"
                      style={{ borderColor: "rgba(8,102,95,0.06)" }}
                    >
                      {c.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

        
              {!productsOpenDesktop && (
                <div className="hidden lg:flex items-center gap-2 ml-2">
                  <button onClick={() => navigateToAnchor("trending")} className="text-sm font-medium px-2 py-1 rounded-md hover:bg-[rgba(8,102,95,0.06)] whitespace-nowrap">Trending</button>
                  <button onClick={() => navigateToAnchor("best-selling")} className="text-sm font-medium px-2 py-1 rounded-md hover:bg-[rgba(8,102,95,0.06)] whitespace-nowrap">Best Selling</button>
                  <button onClick={() => navigateToAnchor("new-arrival")} className="text-sm font-medium px-2 py-1 rounded-md hover:bg-[rgba(8,102,95,0.06)] whitespace-nowrap">New Arrival</button>
                </div>
              )}
            </div>
          );
        }

        return (
          <Label
            onClick={() => handleNavigate(menuItem)}
            className={`${baseClass} truncate`}
            key={menuItem.id}
            style={{ ["--accent"]: ACCENT, whiteSpace: "nowrap" }}
          >
            {menuItem.label}
          </Label>
        );
      })}
      <style>{`.scrollbar-hide::-webkit-scrollbar{display:none}.scrollbar-hide{ -ms-overflow-style:none; scrollbar-width:none; }`}</style>
    </nav>
  );
}

function SearchIconButton({ navigateTo } = {}) {
  const navigate = navigateTo || useNavigate();

  function focusListingSearchInput() {
    try {
      const sel = 'input[placeholder*="Search"], input[aria-label*="search"], input[name*=search], .listing-search-input';
      const input = document.querySelector(sel);
      if (input) {
        input.focus({ preventScroll: true });
        const val = input.value || "";
        if (typeof input.setSelectionRange === "function") {
          input.setSelectionRange(val.length, val.length);
        }
        return true;
      }
    } catch (e) {}
    return false;
  }

  return (
    <button
      aria-label="go to search"
      onClick={() => {
        const path = window.location.pathname || "";
        if (path === ROUTES.listing || path.startsWith(`${ROUTES.listing}/`)) {
          const focused = focusListingSearchInput();
          if (!focused) {
            window.scrollTo({ top: 0, behavior: "smooth" });
            setTimeout(() => focusListingSearchInput(), 140);
          }
          return;
        }
        navigate(ROUTES.listing);
        setTimeout(() => {
          try {
            window.scrollTo({ top: 0, behavior: "smooth" });
          } catch (e) {}
          setTimeout(() => {
            focusListingSearchInput();
          }, 140);
        }, 60);
      }}
      className="p-2 rounded-full hover:shadow-lg transition transform hover:-translate-y-0.5"
      style={{ border: `1px solid ${ACCENT}10` }}
    >
      <Search className="w-5 h-5" style={{ color: ACCENT }} />
    </button>
  );
}

function HeaderRightContent({ cartOnly, avatarOnly, navigateTo } = {}) {
  const auth = useSelector((state) => state.auth) || {};
  const user = auth.user || null;
  const loggedIn = !!(user && (user.id || user._id || user.userName || user.email));
  const { cartItems } = useSelector((state) => state.shopCart || {});
  const [openCartSheet, setOpenCartSheet] = useState(false);
  const dispatch = useDispatch();
  const cartBtnWrapperRef = useRef(null);

  const reactNavigate = useNavigate();
  const navigate = navigateTo || reactNavigate;

  function handleLogout() {
    dispatch(logoutUser());
    navigate(ROUTES.home);
    setTimeout(() => {
      try {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (e) {}
    }, 60);
  }

  useEffect(() => {
    if (loggedIn) {
      dispatch(fetchCartItems(user.id || user._id || user.userId));
    } else {
      dispatch(fetchCartItems(null));
    }
  }, [dispatch, loggedIn, user?.id, user?._id]);

  useEffect(() => {
    function onOpenCart() {
      try {
        const el = cartBtnWrapperRef.current;
        if (!el) return;
        const style = window.getComputedStyle(el);
        if (style.display === "none" || el.offsetParent === null) return;
        setOpenCartSheet(true);
      } catch (e) {}
    }
    window.addEventListener("open-cart-sheet", onOpenCart);
    return () => window.removeEventListener("open-cart-sheet", onOpenCart);
  }, []);

  return (
    <div className="flex items-center gap-3 min-w-0">
      {!avatarOnly && (
        <Sheet open={openCartSheet} onOpenChange={(open) => setOpenCartSheet(open)}>
          <Button
            onClick={() => setOpenCartSheet(true)}
            variant="ghost"
            size="icon"
            className="relative rounded-xl p-2 hover:shadow-xl transition transform hover:scale-105 header-cart-button"
            style={{ border: `1px solid ${ACCENT}10`, background: "transparent" }}
            ref={cartBtnWrapperRef}
          >
            <ShoppingCart className="w-5 h-5" style={{ color: ACCENT }} />
            <span
              className="absolute -top-1 -right-1 text-xs font-semibold bg-white border"
              style={{ borderRadius: 999, padding: "2px 6px", borderColor: ACCENT }}
            >
              {Array.isArray(cartItems?.items) ? cartItems.items.length : cartItems?.length || 0}
            </span>
          </Button>
          <UserCartWrapper setOpenCartSheet={setOpenCartSheet} cartItems={cartItems?.items || cartItems || []} />
        </Sheet>
      )}

      {!cartOnly && (
        <>
          {!loggedIn ? (
            <Button
              variant="ghost"
              onClick={() => {
                navigate("/auth/login");
                setTimeout(() => {
                  try {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  } catch (e) {}
                }, 60);
              }}
            >
              Login
            </Button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="rounded-full p-0.5 hover:shadow-lg transition-transform transform-hover hover:-translate-y-0.5"
                  aria-label="account"
                >
                  <Avatar className="w-9 h-9 rounded-full border-2" style={{ borderColor: ACCENT }}>
                    <AvatarFallback className="bg-[var(--accent)] text-white font-extrabold" style={{ ["--accent"]: ACCENT }}>
                      {user?.userName?.[0]?.toUpperCase() || (user?.name && user.name[0]) || "?"}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" className="w-56">
                <DropdownMenuLabel>Logged in as {user?.userName || user?.name || user?.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    navigate(ROUTES.account);
                    setTimeout(() => {
                      try {
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      } catch (e) {}
                    }, 60);
                  }}
                >
                  <UserCog className="mr-2 h-4 w-4" />
                  Account
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </>
      )}
    </div>
  );
}

function FloatingCartButton() {
  const { cartItems } = useSelector((state) => state.shopCart || {});
  const count = Array.isArray(cartItems?.items) ? cartItems.items.length : cartItems?.length || 0;

  const prevCountRef = useRef(count);
  const btnRef = useRef(null);
  const badgeRef = useRef(null);
  const iconRef = useRef(null);
  const pulseTimeoutRef = useRef(null);
  const fillTimeoutRef = useRef(null);
  const jumpTimeoutRef = useRef(null);

  useEffect(() => {
    const prev = prevCountRef.current;
    if (count > prev) {
      const btn = btnRef.current;
      const badge = badgeRef.current;
      const icon = iconRef.current;

      if (btn) {
        btn.classList.add("fc-fill");
        btn.classList.add("fc-jump");
      }
      if (badge) {
        badge.classList.add("pulse");
        badge.classList.add("fc-badge-float");
      }
      if (icon) icon.classList.add("fc-icon-pop");

      if (pulseTimeoutRef.current) clearTimeout(pulseTimeoutRef.current);
      if (fillTimeoutRef.current) clearTimeout(fillTimeoutRef.current);
      if (jumpTimeoutRef.current) clearTimeout(jumpTimeoutRef.current);

      pulseTimeoutRef.current = setTimeout(() => {
        if (badge) {
          badge.classList.remove("pulse");
          badge.classList.remove("fc-badge-float");
        }
        if (icon) icon.classList.remove("fc-icon-pop");
      }, 700);

      fillTimeoutRef.current = setTimeout(() => {
        if (btn) btn.classList.remove("fc-fill");
      }, 900);

      jumpTimeoutRef.current = setTimeout(() => {
        if (btn) btn.classList.remove("fc-jump");
      }, 700);
    } else if (count === 0 && prev > 0) {
      const btn = btnRef.current;
      if (btn) {
        btn.classList.add("fc-empty");
        setTimeout(() => btn.classList.remove("fc-empty"), 420);
      }
    }
    prevCountRef.current = count;

    return () => {
      if (pulseTimeoutRef.current) clearTimeout(pulseTimeoutRef.current);
      if (fillTimeoutRef.current) clearTimeout(fillTimeoutRef.current);
      if (jumpTimeoutRef.current) clearTimeout(jumpTimeoutRef.current);
    };
  }, [count]);

  return (
    <button
      aria-label="open cart"
      onClick={() => {
   
        try {
          const headerBtn = document.querySelector('.header-cart-button');
          if (headerBtn && typeof headerBtn.click === 'function') {
            headerBtn.click();
            return;
          }
        } catch (e) {}

   
        try {
          window.dispatchEvent(new Event("open-cart-sheet"));
        } catch (e) {}
      }}
      className="floating-cart floating-cart-button z-50"
      ref={btnRef}
      style={{
        left: "50%",
        transform: "translateX(-50%)",
        bottom: "20px",
      }}
    >
      <div className="floating-cart-inner" aria-hidden>
        <ShoppingCart className="floating-cart-icon" ref={iconRef} />
      </div>

      <span className="floating-cart-label">Your Cart</span>

      <span className="floating-cart-badge" aria-live="polite" ref={badgeRef}>
        {count}
      </span>

      <style>{`
        .floating-cart { position: fixed; display: inline-flex; align-items: center; gap: 12px; padding: 10px 16px; border-radius: 999px; border: 1px solid ${ACCENT}22; background: linear-gradient(180deg, rgba(255,255,255,0.98), rgba(250,250,250,0.92)); box-shadow: 0 8px 30px rgba(5,35,32,0.08); cursor: pointer; transition: transform 220ms cubic-bezier(.2,.9,.3,1), box-shadow 220ms ease, background 220ms ease, color 220ms ease; backdrop-filter: blur(6px) saturate(120%); -webkit-backdrop-filter: blur(6px) saturate(120%); outline: none; }
        @media (max-width: 640px) { .floating-cart { display: none !important; } }
        .floating-cart.fc-fill { background: linear-gradient(180deg, ${ACCENT}, ${ACCENT}); color: white; border-color: ${ACCENT}; box-shadow: 0 18px 48px ${ACCENT}22; }
        .floating-cart.fc-empty { transform: translateX(-50%) translateY(-4px) scale(0.995); box-shadow: 0 6px 20px rgba(0,0,0,0.06); }
        @keyframes fcJump {0% { transform: translateX(-50%) translateY(0) scale(1);}30% { transform: translateX(-50%) translateY(-16px) scale(1.03);}60% { transform: translateX(-50%) translateY(-6px) scale(1.015);}100% { transform: translateX(-50%) translateY(0) scale(1);} }
        .floating-cart.fc-jump { animation: fcJump 700ms cubic-bezier(.2,.9,.3,1); }
        .floating-cart-inner { width: 40px; height: 40px; min-width: 40px; min-height: 40px; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; background: linear-gradient(135deg, ${ACCENT}11, rgba(255,255,255,0.6)); border: 1px solid ${ACCENT}20; box-shadow: inset 0 -4px 8px rgba(255,255,255,0.5); transition: transform 220ms ease, box-shadow 220ms ease, background 220ms ease; }
        .floating-cart-icon { width: 18px; height: 18px; color: ${ACCENT}; transition: transform 300ms cubic-bezier(.2,.9,.3,1), width 220ms ease, height 220ms ease; }
        .fc-icon-pop { transform: scale(0.82) rotate(-8deg); opacity: 0.95; }
        .floating-cart.fc-fill .floating-cart-icon { color: white; }
        .floating-cart-label { font-weight: 600; font-size: 14px; color: ${ACCENT}; letter-spacing: 0.2px; transition: color 220ms ease, opacity 220ms ease; }
        .floating-cart.fc-fill .floating-cart-label { color: #fff; }
        .floating-cart-badge { display: inline-flex; align-items: center; justify-content: center; min-width: 26px; height: 26px; padding: 0 8px; border-radius: 999px; font-size: 12px; font-weight: 700; background: white; border: 1px solid ${ACCENT}; color: ${ACCENT}; box-shadow: 0 6px 18px ${ACCENT}22; transition: transform 200ms ease, box-shadow 200ms ease, background 220ms ease, color 220ms ease; }
        @keyframes badgePulse {0% { transform: scale(1); }35% { transform: scale(1.22); }70% { transform: scale(0.98); }100% { transform: scale(1); }}
        .floating-cart-badge.pulse { animation: badgePulse 560ms cubic-bezier(.2,.9,.3,1); }
        @keyframes badgeFloat {0% { transform: translateY(0); opacity: 1; }60% { transform: translateY(-6px); opacity: 1; }100% { transform: translateY(0); opacity: 1; }}
        .floating-cart-badge.fc-badge-float { animation: badgeFloat 700ms cubic-bezier(.2,.9,.3,1); }
        .floating-cart:hover, .floating-cart:focus { transform: translateX(-50%) translateY(-6px) scale(1.02); box-shadow: 0 18px 50px ${ACCENT}20, 0 6px 32px rgba(0,0,0,0.08); background: linear-gradient(180deg, #fff, #fafafa); }
        .floating-cart:hover .floating-cart-inner, .floating-cart:focus .floating-cart-inner { transform: translateY(-3px) rotate(-4deg); box-shadow: 0 12px 30px ${ACCENT}22, inset 0 -4px 8px rgba(255,255,255,0.5); }
        .floating-cart::after { content: ''; position: absolute; left: 50%; transform: translateX(-50%); bottom: -8px; width: calc(100% + 24px); height: 10px; border-radius: 999px; pointer-events: none; opacity: 0; transition: opacity 220ms ease; }
        .floating-cart:hover::after, .floating-cart:focus::after { opacity: 1; box-shadow: 0 6px 30px ${ACCENT}22; }
        .floating-cart:focus-visible { box-shadow: 0 10px 34px ${ACCENT}44, 0 0 0 4px ${ACCENT}11; }
        @media (max-width: 420px) { .floating-cart { padding: 10px; gap: 8px; border-radius: 14px; width: auto; } .floating-cart-label { display: none; } .floating-cart-badge { position: relative; top: -8px; left: 6px; min-width: 22px; height: 22px; padding: 0 6px; font-size: 11px; box-shadow: 0 8px 22px ${ACCENT}18; } .floating-cart-inner { width: 44px; height: 44px; min-width: 44px; min-height: 44px; border-radius: 10px; } }
      `}</style>
    </button>
  );
}

function TopBar({ hidden = false }) {
  const [items, setItems] = useState(null);

  const fallback = [
    { text: "Free shipping on orders over ₹999", key: "ship", icon: "Truck" },
    { text: "10% off sitewide with code SAVE10", key: "10", icon: "Percent" },
    { text: "Buy 2 get 1 free on select items", key: "b2g1", icon: "Tag" },
    { text: "New arrivals: 20% off for first-time buyers", key: "new", icon: "Star" },
    { text: "Limited time: Free gift on orders above ₹1499", key: "gift", icon: "Gift" },
  ];

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await api.get("/api/common/topitems/get");
        if (!cancelled && res && res.data && res.data.success) {
          const data = (res.data.data || []).map((d) => ({
            text: d.text,
            key: d._id || d.key || d.text,
            icon: d.icon || "Star",
          }));
          if (data.length) {
            setItems(data);
            return;
          }
        }
      } catch (e) {}
      if (!cancelled) setItems(fallback);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const topItems = items || fallback;
  const content = [...topItems, ...topItems];

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 h-7 flex items-center overflow-hidden"
      style={{
        background: ACCENT,
        transform: hidden ? "translateY(-100%)" : "translateY(0%)",
        transition: "transform 280ms cubic-bezier(.2,.9,.3,1), opacity 220ms ease",
        willChange: "transform",
        pointerEvents: hidden ? "none" : "auto",
      }}
    >
      <div className="marquee-track flex items-center gap-6 px-4 animate-marquee">
        {content.map((item, idx) => {
          const IconComp = IconMap[item.icon] || IconMap.Star;
          return (
            <div key={idx} className="flex items-center gap-2 whitespace-nowrap text-white text-[13px]">
              <IconComp className="w-4 h-4" style={{ color: YELLOW }} />
              <span>{item.text}</span>
            </div>
          );
        })}
      </div>
      <style>{`
        .animate-marquee { display: inline-flex; animation: marquee 18s linear infinite; }
        @keyframes marquee { 0% { transform: translateX(0%); } 100% { transform: translateX(-50%); } }
      `}</style>
    </div>
  );
}

function MobileMenu({ navigateTo } = {}) {
  const navigate = navigateTo || useNavigate();
  const [open, setOpen] = useState(false);
  const auth = useSelector((s) => s.auth || {});
  const user = auth.user || null;

  const [frontUrl, setFrontUrl] = useState(null);
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await api.get("/api/common/site-media/get-logos");
        if (!mounted) return;
        if (res && res.data && res.data.success && Array.isArray(res.data.logos)) {
          const front = res.data.logos.find((l) => l.variant === "front");
          if (front) setFrontUrl(front.url);
        }
      } catch (e) {}
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const showFront = frontUrl || logoFrontFallback;

  function mobileNavigateToAnchor(anchorId) {
    setOpen(false);
    try {
      try {
        sessionStorage.removeItem("filters");
      } catch (e) {}

      navigate(ROUTES.listing);
      setTimeout(() => {
        navigate(ROUTES.special(anchorId));
      }, 10);
    } catch (e) {}
  }

  return (
    <Sheet open={open} onOpenChange={(v) => setOpen(v)}>
 
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden p-2 rounded-xl border shadow-sm"
          onClick={() => setOpen(true)}
          style={{ display: open ? "none" : undefined }}
        >
          <Menu className="w-6 h-6" />
        </Button>
      </SheetTrigger>

    
      <SheetContent side="left" className="w-full max-w-none h-full p-6 bg-white/95 backdrop-blur-md shadow-2xl overflow-auto">

        <style>{`
          /* common aria/ title variants used by some Sheet libs — hide them to avoid duplicate close icons */
          .sheet-content button[aria-label="close"], .sheet-content button[aria-label="Close"], .sheet-content button[title="Close"] { display: none !important; }
        `}</style>

        <div className="flex items-center justify-between mb-4">
          <Link to={ROUTES.home} className="flex items-center gap-3" onClick={() => setOpen(false)}>
            <img src={showFront} alt="Logo" className="w-14 h-14 object-contain rounded-md" />
            <div>
              <div className="font-bold text-lg" style={{ color: ACCENT }}>Aachiamma</div>
              <div className="text-xs text-gray-500">Fresh • Homemade</div>
            </div>
          </Link>
        </div>

        <div className="flex flex-col gap-4">
          <div className="px-1">
            <MenuItems onItemClick={() => setOpen(false)} navigateTo={(p) => { navigate(p); setTimeout(()=>{ try{ window.scrollTo({top:0, behavior:'smooth'}); }catch{} },60); }} excludeIds={['about','faq','contact']} mobile />
          </div>

          <div className="mt-2 grid grid-cols-3 gap-3">
            <button
              className="py-3 rounded-lg font-medium shadow-sm border"
              onClick={() => { setOpen(false); navigate(ROUTES.about); setTimeout(()=>{ try{ window.scrollTo({top:0, behavior:'smooth'}); }catch{} },60); }}
              style={{ borderColor: "rgba(8,102,95,0.06)" }}
            >About</button>

            <button
              className="py-3 rounded-lg font-medium shadow-sm border"
              onClick={() => { setOpen(false); navigate(ROUTES.faq); setTimeout(()=>{ try{ window.scrollTo({top:0, behavior:'smooth'}); }catch{} },60); }}
              style={{ borderColor: "rgba(8,102,95,0.06)" }}
            >FAQ</button>

            <button
              className="py-3 rounded-lg font-medium shadow-sm border"
              onClick={() => { setOpen(false); navigate(ROUTES.contact); setTimeout(()=>{ try{ window.scrollTo({top:0, behavior:'smooth'}); }catch{} },60); }}
              style={{ borderColor: "rgba(8,102,95,0.06)" }}
            >Contact</button>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <div className="text-sm font-medium mb-2">Explore</div>
            <div className="flex gap-3">
              <button className="flex-1 py-3 rounded-lg font-medium shadow-sm border" onClick={() => mobileNavigateToAnchor("trending")} style={{ borderColor: "rgba(8,102,95,0.06)" }}>Trending</button>
              <button className="flex-1 py-3 rounded-lg font-medium shadow-sm border" onClick={() => mobileNavigateToAnchor("best-selling")} style={{ borderColor: "rgba(8,102,95,0.06)" }}>Best</button>
              <button className="flex-1 py-3 rounded-lg font-medium shadow-sm border" onClick={() => mobileNavigateToAnchor("new-arrival")} style={{ borderColor: "rgba(8,102,95,0.06)" }}>New</button>
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-gray-100 pt-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
        
            <HeaderRightContent avatarOnly navigateTo={(p) => { setOpen(false); navigate(p); setTimeout(()=>{ try{ window.scrollTo({top:0, behavior:'smooth'}); }catch{} },60); }} />
            <div className="text-sm">
              <div className="font-medium">{user ? (user.userName || user.name) : "Guest"}</div>
              <div className="text-xs text-gray-500">{user ? (user.email || "") : "Sign in for quicker checkout"}</div>
            </div>
          </div>

          <div>
   
            <HeaderRightContent cartOnly navigateTo={(p) => { setOpen(false); navigate(p); setTimeout(()=>{ try{ window.scrollTo({top:0, behavior:'smooth'}); }catch{} },60); }} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function ShoppingHeader() {
  const [rotated, setRotated] = useState(false);
  const [showTopBar, setShowTopBar] = useState(true);
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  const [frontUrl, setFrontUrl] = useState(null);
  const [backUrl, setBackUrl] = useState(null);

  const reactNavigate = useNavigate();

  function navigateTo(path) {
    try {
      reactNavigate(path);
    } catch (e) {
      try {
        window.location.href = path;
      } catch (err) {}
    }
    setTimeout(() => {
      try {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (e) {}
    }, 60);
  }

  useEffect(() => {
    let mounted = true;
    async function loadLogos() {
      try {
        const res = await api.get("/api/common/site-media/get-logos");
        if (!mounted) return;
        if (res && res.data && res.data.success && Array.isArray(res.data.logos)) {
          const front = res.data.logos.find((l) => l.variant === "front");
          const back = res.data.logos.find((l) => l.variant === "back");
          if (front) setFrontUrl(front.url);
          if (back) setBackUrl(back.url);
        }
      } catch (e) {
        /* logos optional */
      }
    }
    loadLogos();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    const start = setTimeout(() => {
      setRotated(true);
      timeoutRef.current = setTimeout(() => setRotated(false), 2000);
      intervalRef.current = setInterval(() => {
        setRotated(true);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => setRotated(false), 2000);
      }, 7000);
    }, 5000);
    timeoutRef.current = start;

    function onScroll() {
      if (window.scrollY > 0 && showTopBar) setShowTopBar(false);
      if (window.scrollY === 0 && !showTopBar) setShowTopBar(true);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      window.removeEventListener("scroll", onScroll);
    };
  }, [showTopBar]);

  const headerTop = showTopBar ? 28 : 0;

  useEffect(() => {
    if (window.animateToCart) return;

    window.animateToCart = function (imgOrElem) {
      try {
        let sourceEl = null;
        if (!imgOrElem) return;
        if (typeof imgOrElem === "string") {
          sourceEl = document.querySelector(imgOrElem);
        } else if (imgOrElem instanceof HTMLElement) {
          sourceEl = imgOrElem;
        } else if (imgOrElem && imgOrElem.current) {
          sourceEl = imgOrElem.current;
        }
        if (!sourceEl) return;

        const startRect = sourceEl.getBoundingClientRect();
        const target = document.querySelector(".floating-cart-button") || document.querySelector(".header-cart-button");
        if (!target) return;
        const endRect = target.getBoundingClientRect();

        const clone = sourceEl.cloneNode(true);
        const body = document.body;
        clone.style.position = "fixed";
        clone.style.left = startRect.left + "px";
        clone.style.top = startRect.top + "px";
        clone.style.width = startRect.width + "px";
        clone.style.height = startRect.height + "px";
        clone.style.transition = "transform 700ms cubic-bezier(.22,.9,.32,1), opacity 500ms ease-in";
        clone.style.zIndex = 9999;
        clone.style.pointerEvents = "none";
        clone.style.borderRadius = "8px";
        clone.style.boxShadow = "0 8px 20px rgba(0,0,0,0.12)";
        clone.style.transformOrigin = "center center";
        body.appendChild(clone);

        clone.offsetWidth;

        const translateX = endRect.left + endRect.width / 2 - (startRect.left + startRect.width / 2);
        const translateY = endRect.top + endRect.height / 2 - (startRect.top + startRect.height / 2);
        const scale = Math.min(0.15, (endRect.width / startRect.width) * 0.6);

        clone.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale}) rotate(10deg)`;
        clone.style.opacity = "0.6";

        setTimeout(() => {
          clone.style.opacity = "0";
        }, 500);

        setTimeout(() => {
          if (clone && clone.parentNode) clone.parentNode.removeChild(clone);
          if (target) {
            const orig = target.style.transform;
            target.style.transition = "transform 220ms ease";
            target.style.transform = "scale(1.08)";
            setTimeout(() => {
              target.style.transform = orig || "";
            }, 220);
          }
        }, 800);
      } catch (e) {}
    };
  }, []);

  const showFront = frontUrl || logoFrontFallback;
  const showBack = backUrl || logoBackFallback;

  return (
    <>
      <TopBar hidden={!showTopBar} />

      <header
        className="fixed left-0 right-0 z-50 border-b bg-white/95 backdrop-blur-sm"
        style={{
          borderColor: "rgba(8,102,95,0.08)",
          top: headerTop,
          transition: "top 280ms cubic-bezier(.2,.9,.3,1)",
          height: 80,
        }}
      >
        <div className="relative h-20 flex items-center px-4 md:px-6 shadow-sm">
         
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="lg:hidden">
              <MobileMenu navigateTo={navigateTo} />
            </div>

            <div className="hidden lg:flex min-w-0">
              <MenuItems navigateTo={navigateTo} />
            </div>
          </div>

    
          <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center pointer-events-auto" style={{ maxWidth: 240 }}>
            <Link
              to={ROUTES.home}
              aria-label="home"
              onClick={() => {
                setTimeout(() => {
                  try {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  } catch (e) {}
                }, 60);
              }}
            >
              <div style={{ width: 200, height: 64, perspective: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: "100%", height: "100%", position: "relative", transformStyle: "preserve-3d", transition: "transform 0.6s", transformOrigin: "50% 50%", transform: rotated ? "rotateY(180deg)" : "rotateY(0deg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ position: "absolute", width: "100%", height: "100%", backfaceVisibility: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <img src={showFront} alt="Front Logo" className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain" />
                  </div>
                  <div style={{ position: "absolute", width: "100%", height: "100%", backfaceVisibility: "hidden", transform: "rotateY(180deg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <img src={showBack} alt="Back Logo" className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain" />
                  </div>
                </div>
              </div>
            </Link>
          </div>

        
          <div className="flex items-center justify-end gap-4 flex-1 min-w-0 ml-auto">
            <div className="hidden md:flex items-center gap-4 mr-4">
              <button onClick={() => { navigateTo(ROUTES.about); }} className="text-sm font-medium" style={{ color: ACCENT }}>
                About
              </button>
              <button onClick={() => { navigateTo(ROUTES.faq); }} className="text-sm font-medium" style={{ color: ACCENT }}>
                FAQ
              </button>
              <button onClick={() => { navigateTo(ROUTES.contact); }} className="text-sm font-medium" style={{ color: ACCENT }}>
                Contact
              </button>
              <SearchIconButton navigateTo={navigateTo} />
            </div>

            <div className="hidden md:flex">
              <HeaderRightContent navigateTo={navigateTo} />
            </div>

            <div className="flex md:hidden">
              <HeaderRightContent cartOnly navigateTo={navigateTo} />
            </div>
          </div>
        </div>
      </header>

      <FloatingCartButton />
    </>
  );
}

export default ShoppingHeader;
