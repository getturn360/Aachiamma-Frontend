import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllFilteredProducts,
  fetchProductDetails,
} from "@/store/shop/products-slice";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { fetchCategories, getFeatureImages } from "@/store/common-slice";
import PopupModal from "@/components/common/PopupModal";
import { fetchPopups } from "@/store/popup-slice";
import SEO from "@/components/common/SEO";

import { addProductToCart } from "@/lib/add-to-cart";

import hi1 from "@/assets/h-i1.png";
import hi3 from "@/assets/h-i3.png";

import pickleImg from "@/assets/categories/demo-p.jpg";
import snackImg from "@/assets/categories/demo-p.jpg";
import powderImg from "@/assets/categories/demo-p.jpg";
import spiceImg from "@/assets/categories/demo-p.jpg";
import kondattamImg from "@/assets/categories/demo-p.jpg";
import comboImg from "@/assets/categories/demo-p.jpg";
import otherImg from "@/assets/categories/demo-p.jpg";

// Extracted Components
import SectionTitle from "@/components/shopping-view/home/SectionTitle";
import ValuesSection from "@/components/shopping-view/home/ValuesSection";
import FullWidthPromo from "@/components/shopping-view/home/FullWidthPromo";
import TestimonialSlider from "@/components/shopping-view/home/TestimonialSlider";
import PaginatedProducts from "@/components/shopping-view/home/PaginatedProducts";

const ACCENT = "#08665F";

export default function ShoppingHome() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { productList } = useSelector((state) => state.shopProducts);
  const { featureImageList } = useSelector((state) => state.commonFeature);
  const { user } = useSelector((state) => state.auth);

  const { list: popups = [] } = useSelector((s) => s.popup || {});
  const [showPopup, setShowPopup] = useState(false);
  const [activePopup, setActivePopup] = useState(null);

  const dismissedPopupRef = useRef(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const carouselRef = useRef(null);
  const hoverRef = useRef(false);
  const touchStartX = useRef(null);
  const pointerStartX = useRef(null);
  const pointerActive = useRef(false);
  const [cartPulse, setCartPulse] = useState(false);

  const reduxCategories = useSelector((state) => state.commonFeature?.categories || []);
  const categories = useMemo(
    () =>
      reduxCategories.map((c) => ({
        _id: c._id,
        name: c.name,
        slug: c.slug,
        image: c.image || c.img || null,
      })),
    [reduxCategories]
  );

  const bestSelling = useMemo(
    () =>
      (productList || []).filter(
        (p) =>
          p?.isAvailable !== false &&
          Array.isArray(p.special) &&
          p.special.includes("best-selling")
      ),
    [productList]
  );

  const combosProducts = useMemo(
    () =>
      (productList || []).filter(
        (p) =>
          p?.isAvailable !== false &&
          ((p.category && p.category.toLowerCase() === "combos") ||
            (Array.isArray(p.special) && p.special.includes("combos")))
      ),
    [productList]
  );

  const featuredProducts = useMemo(
    () => (productList || []).filter((p) => p?.isAvailable !== false),
    [productList]
  );

  const fallbackImageMap = {
    pickles: pickleImg,
    snacks: snackImg,
    powders: powderImg,
    spices: spiceImg,
    kondattam: kondattamImg,
    combos: comboImg,
    others: otherImg,
  };

  useEffect(() => {
    dispatch(
      fetchAllFilteredProducts({
        filterParams: {},
        sortParams: "price-lowtohigh",
      })
    );
  }, [dispatch]);

  useEffect(() => {
    dispatch(getFeatureImages());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchPopups());
  }, [dispatch]);

  const STORAGE_SEQ = "popup_seq_idx";
  const POPUP_SEEN_KEY = "popup_seen_this_session";

  useEffect(() => {
    if (!popups || popups.length === 0) {
      setShowPopup(false);
      setActivePopup(null);
      return;
    }

    try {
      if (sessionStorage.getItem(POPUP_SEEN_KEY) === "1") {
        setShowPopup(false);
        setActivePopup(null);
        return;
      }
    } catch (e) {
      // ignore
    }

    let seqIdx = 0;
    try {
      const raw = localStorage.getItem(STORAGE_SEQ);
      const parsed = Number(raw);
      if (!Number.isNaN(parsed) && parsed >= 0) seqIdx = parsed;
    } catch (e) {
      seqIdx = 0;
    }

    seqIdx = seqIdx % popups.length;

    const candidate = popups[seqIdx];
    const candidateId = candidate ? (candidate._id || candidate.id) : null;
    if (candidateId && dismissedPopupRef.current && candidateId === dismissedPopupRef.current) {
      if (popups.length === 1) {
        setShowPopup(false);
        setActivePopup(null);
        return;
      } else {
        seqIdx = (seqIdx + 1) % popups.length;
        try { localStorage.setItem(STORAGE_SEQ, String(seqIdx)); } catch (e) { /* ignore */ }
      }
    }

    const toShow = popups[seqIdx];
    if (toShow) {
      setActivePopup(toShow);
      setShowPopup(true);
    } else {
      setActivePopup(null);
      setShowPopup(false);
    }
  }, [popups]);

  const handleClosePopup = () => {
    try {
      sessionStorage.setItem(POPUP_SEEN_KEY, "1");
    } catch (e) {
      // ignore
    }

    if (!activePopup) {
      setShowPopup(false);
      return;
    }

    let idx = 0;
    try {
      const raw = localStorage.getItem(STORAGE_SEQ);
      const parsed = Number(raw);
      if (!Number.isNaN(parsed) && parsed >= 0) idx = parsed;
    } catch (e) {
      idx = 0;
    }

    if (activePopup && popups && popups.length > 0) {
      const id = activePopup._id || activePopup.id;
      const found = popups.findIndex((p) => (p._id || p.id) === id);
      if (found !== -1) idx = found;
    }

    const next = (idx + 1) % Math.max(1, (popups && popups.length) || 1);
    try {
      localStorage.setItem(STORAGE_SEQ, String(next));
    } catch (e) {}

    const dismissedId = activePopup ? (activePopup._id || activePopup.id) : null;
    if (dismissedId) dismissedPopupRef.current = dismissedId;

    setShowPopup(false);
    setActivePopup(null);
  };

  useEffect(() => {
    function onKey(e) {
      if (!featureImageList || featureImageList.length === 0) return;
      if (e.key === "ArrowLeft") {
        setCurrentSlide((prev) => (prev - 1 + featureImageList.length) % featureImageList.length);
      } else if (e.key === "ArrowRight") {
        setCurrentSlide((prev) => (prev + 1) % featureImageList.length);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [featureImageList]);

  useEffect(() => {
    if (!featureImageList || featureImageList.length <= 1) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const intervalId = setInterval(() => {
      if (hoverRef.current || pointerActive.current) return;
      setCurrentSlide((prev) => (prev + 1) % featureImageList.length);
    }, 3000);

    return () => clearInterval(intervalId);
  }, [featureImageList]);

  useEffect(() => {
    if (!location || !location.hash) return;
    const id = location.hash.replace(/^#/, "");
    if (!id) return;

    setTimeout(() => {
      try {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      } catch (e) {}
    }, 80);
  }, [location.hash]);

  function handleNavigateToListingPage(getCurrentItem, section) {
    sessionStorage.removeItem("filters");
    let value = null;
    if (!getCurrentItem) return;

    if (typeof getCurrentItem === "string") {
      value = getCurrentItem;
    } else if (getCurrentItem.slug) {
      value = getCurrentItem.slug;
    } else if (getCurrentItem.id) {
      value = getCurrentItem.id;
    } else if (getCurrentItem._id) {
      value = getCurrentItem._id;
    } else if (getCurrentItem.label) {
      value = String(getCurrentItem.label).toLowerCase().replace(/\s+/g, "-");
    }

    if (!value) return;

    const currentFilter = { [section]: [value] };
    sessionStorage.setItem("filters", JSON.stringify(currentFilter));

    navigate(`/listing?category=${encodeURIComponent(value)}`);
    try {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      window.scrollTo(0, 0);
    }
  }

  function handleGetProductDetails(getCurrentProductId) {
    navigate(`/product/${getCurrentProductId}`);
  }

  const handleAddtoCart = useCallback(
    (getCurrentProductId, getQuantity = 1, getProductObj = null) => {
      addProductToCart({
        dispatch,
        user,
        navigate,
        productId: getCurrentProductId,
        quantity: getQuantity,
        productObj: getProductObj,
        fromPath: location.pathname,
      }).then((data) => {
        if (data?.redirectedToLogin) return;
        if (data?.payload?.success) {
          setCartPulse(true);
          setTimeout(() => setCartPulse(false), 900);
        } else {
          const msg = data?.payload?.message || "Failed to add product to cart";
          toast({ title: msg, variant: "destructive" });
        }
      });
    },
    [dispatch, user, navigate, location.pathname, toast]
  );

  const renderProductTile = useCallback(
    (product) => (
      <ShoppingProductTile
        product={product}
        handleGetProductDetails={handleGetProductDetails}
        handleAddtoCart={handleAddtoCart}
      />
    ),
    [handleAddtoCart]
  );

  const onHeroPointerDown = (e) => {
    pointerActive.current = true;
    pointerStartX.current = e.clientX ?? (e.touches && e.touches[0] && e.touches[0].clientX) ?? null;
    if (e.target && e.pointerId && e.target.setPointerCapture) {
      try {
        e.target.setPointerCapture(e.pointerId);
      } catch (err) { }
    }
  };

  const onHeroPointerMove = (e) => {
    if (!pointerActive.current || pointerStartX.current == null) return;
  };

  const onHeroPointerUp = (e) => {
    if (!pointerActive.current || pointerStartX.current == null || !featureImageList || featureImageList.length === 0) {
      pointerActive.current = false;
      pointerStartX.current = null;
      return;
    }
    const endX = e.clientX ?? (e.changedTouches && e.changedTouches[0] && e.changedTouches[0].clientX);
    const dx = endX - pointerStartX.current;
    const threshold = 50;
    if (Math.abs(dx) > threshold) {
      if (dx > 0) setCurrentSlide((prev) => (prev - 1 + featureImageList.length) % featureImageList.length);
      else setCurrentSlide((prev) => (prev + 1) % featureImageList.length);
    }
    pointerActive.current = false;
    pointerStartX.current = null;
    if (e.target && e.pointerId && e.target.releasePointerCapture) {
      try {
        e.target.releasePointerCapture(e.pointerId);
      } catch (err) { }
    }
  };

  const onHeroTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onHeroTouchEnd = (e) => {
    if (touchStartX.current == null || !featureImageList || featureImageList.length === 0) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) {
      if (dx > 0) setCurrentSlide((prev) => (prev - 1 + featureImageList.length) % featureImageList.length);
      else setCurrentSlide((prev) => (prev + 1) % featureImageList.length);
    }
    touchStartX.current = null;
  };

  return (
    <div className="min-h-screen bg-gray-50" style={{ paddingBottom: 0 }}>
      <SEO />
   
      <header id="hero-banner" className="relative w-full mt-[25px]">
        <div
          ref={carouselRef}
          onMouseEnter={() => (hoverRef.current = true)}
          onMouseLeave={() => (hoverRef.current = false)}
          onPointerDown={onHeroPointerDown}
          onPointerMove={onHeroPointerMove}
          onPointerUp={onHeroPointerUp}
          onPointerCancel={() => {
            pointerActive.current = false;
            pointerStartX.current = null;
          }}
          onTouchStart={onHeroTouchStart}
          onTouchEnd={onHeroTouchEnd}
          className="relative w-full aspect-[15/6] overflow-hidden"
          style={{ zIndex: 10 }}
        >
          {featureImageList && featureImageList.length > 0 ? (
            featureImageList.map((slide, idx) => (
              <figure
                key={idx}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out transform ${idx === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"}`}
                aria-hidden={idx === currentSlide ? "false" : "true"}
              >
                <img src={slide?.image} alt={slide?.title || `slide-${idx}`} className="w-full h-full object-cover" draggable={false} style={{ pointerEvents: "none", borderRadius: 0 }} />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30" />
                {slide?.title && (
                  <div className="absolute left-4 sm:left-8 bottom-6 sm:bottom-8 text-white drop-shadow-md max-w-xl z-20">
                    <h3 className="text-lg sm:text-2xl md:text-3xl font-extrabold tracking-wide leading-tight">{slide.title}</h3>
                    {slide?.subtitle && <p className="mt-2 text-xs sm:text-sm md:text-base opacity-95 max-w-lg">{slide.subtitle}</p>}
                    {slide?.ctaLabel && (
                      <div className="mt-3">
                        <Button onClick={() => slide?.ctaAction && slide.ctaAction()} className="uppercase shadow-md" style={{ background: ACCENT }}>
                          {slide.ctaLabel}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </figure>
            ))
          ) : (
            <div className="absolute inset-0 grid place-items-center bg-gradient-to-r from-gray-100 to-gray-200">
              <div className="text-center text-gray-600">No banner images available</div>
            </div>
          )}

          <button
            aria-label="Previous slide"
            onClick={() => setCurrentSlide((prev) => (prev - 1 + (featureImageList?.length || 1)) % (featureImageList?.length || 1))}
            className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 border border-white/20 shadow-xl grid place-items-center hover:scale-105 transition-transform focus:outline-none"
            style={{ zIndex: 60, WebkitBackdropFilter: "blur(8px)", backdropFilter: "blur(8px)" }}
          >
            <ChevronLeftIcon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: "#ffffff" }} />
          </button>

          <button
            aria-label="Next slide"
            onClick={() => setCurrentSlide((prev) => (prev + 1) % (featureImageList?.length || 1))}
            className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 border border-white/20 shadow-xl grid place-items-center hover:scale-105 transition-transform focus:outline-none"
            style={{ zIndex: 60, WebkitBackdropFilter: "blur(8px)", backdropFilter: "blur(8px)" }}
          >
            <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: "#ffffff" }} />
          </button>

          {featureImageList && featureImageList.length > 1 && (
            <div
              className="absolute left-1/2 -translate-x-1/2 bottom-3 sm:bottom-6 flex gap-1 sm:gap-2 z-50"
              role="tablist"
              aria-label="Feature slides"
            >
              {featureImageList.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-label={`Go to slide ${i + 1}`}
                  aria-pressed={i === currentSlide}
                  onClick={() => setCurrentSlide(i)}
                  className="inline-flex items-center justify-center p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/60"
                  style={{ WebkitTapHighlightColor: "transparent" }}
                >
                  <span
                    className={`block rounded-full transition-all duration-300
            ${i === currentSlide
                        ? "w-[20px] sm:w-[36px] h-[6px] sm:h-2 bg-white shadow-[0_6px_18px_rgba(0,0,0,0.12)]"
                        : "w-[10px] sm:w-[18px] h-[6px] sm:h-2 bg-[rgba(255,255,255,0.28)]"
                      }`}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div id="categories-bar" className="sticky top-6 z-10 mt-[15px]">
         
          <div
            className="w-full overflow-x-auto no-scrollbar"
            style={{ WebkitOverflowScrolling: "touch" }}
            aria-label="Categories"
            role="navigation"
          >
         
            <div
              className="flex items-center justify-center gap-2 px-2 py-2"
              style={{ minWidth: "max-content", flexWrap: "nowrap", scrollSnapType: "x mandatory" }}
              role="tablist"
            >
              {(categories && categories.length > 0
                ? categories
                : Object.keys(fallbackImageMap).map((k) => ({
                  slug: k,
                  name: k.charAt(0).toUpperCase() + k.slice(1),
                  image: fallbackImageMap[k],
                }))
              ).map((c) => {
                const slugKey = (c.slug || "").toLowerCase();
                const fallback = fallbackImageMap[slugKey] || Object.values(fallbackImageMap)[0];
                const imgSrc = c.image || fallback;
                return (
                  <button
                    key={c._id || c.slug}
                    onClick={() => handleNavigateToListingPage(c, "category")}
                    className="flex-shrink-0 inline-flex items-center justify-center gap-3 px-3 py-2 rounded-2xl hover:shadow-md transition-all duration-300 ease-in-out bg-white text-center"
                    role="tab"
                    aria-label={c.name || c.label}
                    title={c.name || c.label}
                    style={{ scrollSnapAlign: "start" }}
                  >
                    <img src={imgSrc} alt={c.name || c.label} className="w-8 h-8 rounded-md object-cover" />
                    <div className="flex flex-col text-left">
                      <span className="uppercase text-sm font-semibold" style={{ color: ACCENT }}>
                        {c.name || c.label}
                      </span>
                      <span className="text-xs text-gray-500">Explore</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-2 sm:px-4 -mt-12 space-y-8 sm:space-y-12">
 
        {bestSelling.length > 0 && (
            <section id="best-selling" className="bg-white rounded-2xl p-6 sm:p-12 md:py-16 mt-[60px] min-h-[550px] md:min-h-[700px]">
              <SectionTitle text="BEST SELLING" />
              <PaginatedProducts
                products={bestSelling}
                pageSize={4}
                sectionId="best-selling-paginated"
                renderProduct={renderProductTile}
              />
            </section>
        )}

        {combosProducts.length > 0 && (
            <section id="combos" className="bg-white rounded-2xl p-4 sm:p-8 mt-[50px]">
              <SectionTitle text="COMBOS" />
              <PaginatedProducts
                products={combosProducts}
                pageSize={4}
                sectionId="combos-paginated"
                renderProduct={renderProductTile}
              />
            </section>
        )}

      </main>

      <div className="w-full overflow-hidden">
        <img src={hi1} alt="feature-full-width" className="w-full object-cover block" draggable={false} loading="lazy" />
      </div>

      <FullWidthPromo />

      <TestimonialSlider />

      <ValuesSection />

      <section id="feature-products" className="container mx-auto px-2 sm:px-4 rounded-2xl p-4 sm:p-8">
        <SectionTitle text="FEATURED PRODUCTS" />
        <PaginatedProducts
          products={featuredProducts}
          pageSize={4}
          sectionId="feature-products-paginated"
          renderProduct={renderProductTile}
        />
      </section>

      <div className="w-full mt-[-20px]">
        <img src={hi3} alt="testimonial decorative" className="w-full object-cover block" draggable={false} loading="lazy" />
      </div>

      <PopupModal open={showPopup} onClose={handleClosePopup} popup={activePopup} />
    </div>
  );
}
