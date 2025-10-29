// client/src/pages/shopping-view/home.jsx
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllFilteredProducts,
  fetchProductDetails,
} from "@/store/shop/products-slice";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import { useNavigate, useLocation } from "react-router-dom";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { useToast } from "@/components/ui/use-toast";
import { getFeatureImages } from "@/store/common-slice";
import api from "@/api/axios"; // axios instance for API calls

// NEW: popup modal + action
import PopupModal from "@/components/common/PopupModal";
import { fetchPopups } from "@/store/popup-slice";

// hero / placeholder images
import bannerImg from "@/assets/feature-hero.jpg";
import hi1 from "@/assets/h-i1.png";
import hi2 from "@/assets/h-i2.png";
import hi3 from "@/assets/h-i3.png";

// category images (fallbacks)
import pickleImg from "@/assets/categories/demo-p.jpg";
import snackImg from "@/assets/categories/demo-p.jpg";
import powderImg from "@/assets/categories/demo-p.jpg";
import spiceImg from "@/assets/categories/demo-p.jpg";
import kondattamImg from "@/assets/categories/demo-p.jpg";
import comboImg from "@/assets/categories/demo-p.jpg";
import otherImg from "@/assets/categories/demo-p.jpg";

// testimonial avatars (6 unique)
import t1 from "@/assets/t1.jpg";
import t2 from "@/assets/t2.jpg";
import t3 from "@/assets/t3.jpg";
import t4 from "@/assets/t4.jpg";
import t5 from "@/assets/t5.jpg";
import t6 from "@/assets/t6.jpg";

import val1 from "@/assets/v-i1.png";
import val2 from "@/assets/v-i2.png";
import val3 from "@/assets/v-i3.png";
import val4 from "@/assets/v-i4.png";

const ACCENT = "#08665F";
const PROMO_BG = "#5b1f18";
const PROMO_TAN = "#C28A4D";

/**
 * PaginatedProducts
 * - shows `pageSize` products at a time in a responsive grid
 * - Mobile: 2 columns, Small: 2 columns, Medium: 3, Large: 4
 */
function PaginatedProducts({
  products = [],
  pageSize = 4,
  renderProduct, // (product) => ReactNode
  sectionId = "paginated",
}) {
  const [page, setPage] = useState(0);

  useEffect(() => {
    // If product list changes, reset to first page
    setPage(0);
  }, [products]);

  if (!products || products.length === 0) return null;

  const totalPages = Math.ceil(products.length / pageSize);
  const start = page * pageSize;
  const end = start + pageSize;
  const visible = products.slice(start, end);

  const goPrev = () => setPage((p) => Math.max(0, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages - 1, p + 1));

  return (
    <div id={sectionId}>
      {/* MOBILE/SM: 2 columns, MD:3, LG:4. Reduced gap on mobile */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
        {visible.map((product) => (
          <div key={product._id || product.id} className="transform hover:-translate-y-2 transition">
            {renderProduct(product)}
          </div>
        ))}
      </div>

      {/* pagination controls (tighter on mobile) */}
      {totalPages > 1 && (
        <div className="w-full mt-4 sm:mt-6 flex items-center justify-center gap-3 sm:gap-4">
          <Button
            onClick={goPrev}
            disabled={page === 0}
            className="px-4 py-2"
            style={{
              background: page === 0 ? "#F3F4F6" : ACCENT,
              color: page === 0 ? "#9CA3AF" : "#fff",
              border: `1px solid ${ACCENT}22`,
            }}
            aria-label="Previous products"
          >
            Prev
          </Button>

          <div className="text-sm font-semibold text-gray-600 self-center">
            {page + 1} / {totalPages}
          </div>

          <Button
            onClick={goNext}
            disabled={page === totalPages - 1}
            className="px-4 py-2"
            style={{
              background: page === totalPages - 1 ? "#F3F4F6" : ACCENT,
              color: page === totalPages - 1 ? "#9CA3AF" : "#fff",
              border: `1px solid ${ACCENT}22`,
            }}
            aria-label="Next products"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

export default function ShoppingHome() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { productList } = useSelector((state) => state.shopProducts);
  const { featureImageList } = useSelector((state) => state.commonFeature);
  const { user } = useSelector((state) => state.auth);

  // NEW: popup redux state
  const { list: popups = [] } = useSelector((s) => s.popup || {});
  const [showPopup, setShowPopup] = useState(false);
  const [activePopup, setActivePopup] = useState(null);

  // --- NEW: dismissed tracking to avoid immediate reopen of same popup in current session ---
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

  // dynamic categories state (fetched from server). Each item expected { name, slug, image? }
  const [categories, setCategories] = useState([]);

  // local fallback mapping (if category from server has no image)
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

  // NEW: fetch popups for storefront
  useEffect(() => {
    dispatch(fetchPopups());
  }, [dispatch]);

  // ---- popup sequence storage key ----
  const STORAGE_SEQ = "popup_seq_idx";

  // when popup list arrives, show popup according to stored sequence
  useEffect(() => {
    if (!popups || popups.length === 0) {
      setShowPopup(false);
      setActivePopup(null);
      return;
    }

    // read seq index
    let seqIdx = 0;
    try {
      const raw = localStorage.getItem(STORAGE_SEQ);
      const parsed = Number(raw);
      if (!Number.isNaN(parsed) && parsed >= 0) seqIdx = parsed;
    } catch (e) {
      seqIdx = 0;
    }

    // normalize
    seqIdx = seqIdx % popups.length;

    // If user dismissed this popup in current session, advance to next (but persist sequence so reload shows next)
    const candidate = popups[seqIdx];
    const candidateId = candidate ? (candidate._id || candidate.id) : null;
    if (candidateId && dismissedPopupRef.current && candidateId === dismissedPopupRef.current) {
      if (popups.length === 1) {
        // only one popup available and it was dismissed this session -> do not open
        setShowPopup(false);
        setActivePopup(null);
        return;
      } else {
        seqIdx = (seqIdx + 1) % popups.length;
        try { localStorage.setItem(STORAGE_SEQ, String(seqIdx)); } catch (e) { /* ignore */ }
      }
    }

    // set active and show
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
    if (!activePopup) {
      setShowPopup(false);
      return;
    }

    // compute current index (prefer from activePopup)
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

    // compute and persist next index
    const next = (idx + 1) % Math.max(1, (popups && popups.length) || 1);
    try {
      localStorage.setItem(STORAGE_SEQ, String(next));
    } catch (e) {
      // ignore
    }

    // mark dismissed id for this session (prevents immediate reopen of same popup)
    const dismissedId = activePopup ? (activePopup._id || activePopup.id) : null;
    if (dismissedId) dismissedPopupRef.current = dismissedId;

    // close UI
    setShowPopup(false);
    setActivePopup(null);
  };

  // fetch categories for sticky bar
  useEffect(() => {
    let mounted = true;
    async function loadCategories() {
      try {
        const res = await api.get("/api/common/categories/get?sticky=true");
        if (!mounted) return;
        if (res && res.data && res.data.success) {
          // normalize: ensure each category has { name, slug, image(optional), _id }
          const list = (res.data.categories || []).map((c) => ({
            _id: c._id,
            name: c.name,
            slug: c.slug,
            image: c.image || c.img || null,
          }));
          setCategories(list.length ? list : []);
        } else {
          setCategories([]);
        }
      } catch (e) {
        console.warn("Failed to load categories:", e);
        setCategories([]);
      }
    }
    loadCategories();
    return () => { mounted = false; };
  }, []);

  // keyboard hero nav
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

  // NEW: scroll to anchor when location.hash changes (supports header links like /shop/home#trending)
  useEffect(() => {
    if (!location || !location.hash) return;
    const id = location.hash.replace(/^#/, "");
    if (!id) return;
    // small timeout to allow route/component mount
    setTimeout(() => {
      try {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      } catch (e) {
        // noop
      }
    }, 80);
  }, [location.hash]);

  function handleNavigateToListingPage(getCurrentItem, section) {
    // Accept either object with slug/name or a simple id string from older usage
    sessionStorage.removeItem("filters");

    let value = null;
    if (!getCurrentItem) return;

    // If passed an object with slug use it, else if id use id
    if (typeof getCurrentItem === "string") {
      value = getCurrentItem;
    } else if (getCurrentItem.slug) {
      value = getCurrentItem.slug;
    } else if (getCurrentItem.id) {
      value = getCurrentItem.id;
    } else if (getCurrentItem._id) {
      value = getCurrentItem._id;
    } else if (getCurrentItem.label) {
      // fallback to label lowercased and slugified-ish
      value = String(getCurrentItem.label).toLowerCase().replace(/\s+/g, "-");
    }

    if (!value) return;

    const currentFilter = { [section]: [value] };
    sessionStorage.setItem("filters", JSON.stringify(currentFilter));

    // navigate then ensure viewport is at top
    navigate(`/shop/listing?category=${encodeURIComponent(value)}`);
    // try to scroll to top immediately (keeps behavior simple and works in most cases)
    try {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      window.scrollTo(0, 0);
    }
  }

  function handleGetProductDetails(getCurrentProductId) {
    navigate(`/shop/product/${getCurrentProductId}`);
  }

  function handleAddtoCart(getCurrentProductId, getQuantity = 1, getProductObj = null) {
    dispatch(
      addToCart({
        userId: user?.id,
        productId: getCurrentProductId,
        quantity: getQuantity,
        productObj: getProductObj,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id));
        setCartPulse(true);
        setTimeout(() => setCartPulse(false), 900);
      } else {
        const msg = data?.payload?.message || "Failed to add product to cart";
        toast({ title: msg, variant: "destructive" });
      }
    });
  }

  // --- hero pointer/touch (for hero slides) ---
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

  // --- Section title component ---
  const SectionTitle = ({ text }) => (
    <div className="flex items-center justify-center mb-8 px-2">
      <div
        className="flex-1 max-w-[50px] sm:max-w-[100px] md:max-w-[150px] h-[1px] sm:h-[2px] md:h-[2px] mr-3 sm:mr-6 rounded-full"
        style={{ background: `${ACCENT}22` }}
      />
      <h2
        className="uppercase font-extrabold text-center px-3 py-1.5 sm:px-5 sm:py-2 rounded-full bg-white/60 inline-block"
        style={{ color: ACCENT }}
      >
        <span className="block tracking-[0.03em]" style={{ fontSize: "clamp(14px, 2.2vw, 28px)" }}>
          {text}
        </span>
      </h2>
      <div
        className="flex-1 max-w-[50px] sm:max-w-[100px] md:max-w-[150px] h-[1px] sm:h-[2px] md:h-[2px] ml-3 sm:ml-6 rounded-full"
        style={{ background: `${ACCENT}22` }}
      />
    </div>
  );

  // ------------------ VALUES section (NEW) ------------------
  const ValuesSection = () => {
    const values = [
      {
        id: "authenticity",
        title: "Handpicked at Source",
        image: val1,
        desc: "We begin at trusted local farms — selecting only the freshest produce and purest spices. Every ingredient is chosen for quality, taste, and authenticity.",
      },
      {
        id: "experience",
        title: "Prepared the Traditional Way",
        image: val2,
        desc: "In our Agraharam kitchen, each recipe is cooked in small batches — following simple, time-honoured methods passed down through generations.",
      },
      {
        id: "sustainability",
        title: "Packed Fresh, Same Day",
        image: val3,
        desc: "Each jar is sealed the very day it’s made to lock in natural aroma and flavour. No preservatives. No artificial colours or flavours.",
      },
      {
        id: "purpose",
        title: "Shared with Care",
        image: val4,
        desc: "From our kitchen to your table, we deliver food that’s truly homemade — wholesome, safe, and filled with love.",
      },
    ];

    return (
      <section aria-label="Our values" className="w-full bg-[linear-gradient(180deg,#08665F,#0a5d54)] py-12">
        <div className="container mx-auto px-2 sm:px-4">
          <h2 className="text-center font-extrabold text-white mb-8" style={{ fontSize: "clamp(20px,2.6vw,36px)" }}>The Honest Journey</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <div key={v.id} className="rounded-lg p-4 flex flex-col items-center text-center" style={{ backdropFilter: "blur(4px)" }}>
                <div className="w-full mb-4">
                  <div className="aspect-[4/4] rounded-md overflow-hidden grid place-items-center">
                    <img src={v.image} alt={v.title} className="w-full h-full object-contain" draggable={false} />
                  </div>
                </div>

                <h3 className="font-extrabold text-white tracking-wide mb-2" style={{ fontSize: "clamp(14px,1.4vw,18px)" }}>{v.title}</h3>
                <p className="text-white/90 text-sm leading-relaxed" style={{ fontSize: "clamp(12px,1.0vw,14px)" }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  // ------------------ FullWidthPromo: stacked BELOW 1440, two-col AT >=1440 ------------------
  const FullWidthPromo = () => (
    <section aria-label="Featured hero promo" className="w-full">
      <div className="w-full grid grid-cols-1 min-[1512px]:grid-cols-2">
        <div className="relative order-1 min-[1440px]:order-1">
          <div className="w-full flex items-center justify-center" style={{ background: PROMO_TAN }}>
            <img src={bannerImg} alt="hero product" className="object-contain select-none " draggable={false} />
          </div>
        </div>

        <div className="order-2 min-[1440px]:order-2 flex items-center" style={{ background: PROMO_BG }}>
          <div className="w-full px-4 sm:px-12 py-8 md:py-20 md:px-12 lg:px-20 text-white max-w-3xl mx-auto">
            <h2 className="font-extrabold tracking-tight leading-tight mb-4" style={{ fontSize: "clamp(20px, 3.2vw, 44px)" }}>
              One Pinch. Total Punch!
            </h2>
            <p className="opacity-95 mb-6" style={{ fontSize: "clamp(14px, 1.6vw, 18px)" }}>
              Bring your sambar to life with just a pinch! Aachiamma’s Sambar Powder is packed with the authentic flavours of hand-picked spices, roasted and blended to perfection — just like grandma’s secret recipe.
            </p>
            <ul className="mb-6 space-y-2" style={{ fontSize: "clamp(13px, 1.4vw, 16px)" }}>
              <li className="font-semibold">✨ No shortcuts. Just tradition in every bite.</li>
              <li className="font-semibold">✨ Pure spices. Big flavour. Happy hearts.</li>
            </ul>
            <p className="font-semibold mb-6" style={{ fontSize: "clamp(13px, 1.4vw, 16px)" }}>
              Experience the taste of tradition, made with love just for you!
            </p>
            <div>
              <Button className="uppercase px-6 py-2 shadow-md" style={{ background: ACCENT, color: "#fff" }} onClick={() => navigate("/shop/about")}>
                READ MORE
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  // ------------------ Testimonial slider: entire content follows swipe & mouse press; improved animation ------------------
  const TestimonialSlider = () => {
    const testimonials = [
      {
        avatar: t1,
        rating: 5,
        quote:
          "I never imagined I would enjoy bitter gourd this much until I tried this pickle! It strikes the perfect balance of traditional taste and unique flavor, turning an everyday meal into something special. Highly recommended for anyone looking to add a healthy twist to their meals!",
        name: "Silpa S Nair, Manager, HP Inc, Chennai",
      },
      { avatar: t2, rating: 5, quote: "I ordered both the jackfruit chips and rice murukku, and I must say, they exceeded my expectations! The jackfruit chips were perfectly crisp with a natural sweetness, just the way I remember from childhood trips to Kerala. The rice murukku was equally delightful - crunchy, fresh, and full of authentic homemade flavor. LUV IT!", name: "Niyathi Saji – Bangalore" },
      { avatar: t3, rating: 5, quote: "Kondattam and the Bitter Gourd Pickle have truly brought me wonder! It’s really nice and tasty.  It’s become a must-have on my dining table now. Highly recommend it to anyone who loves genuine, quality pickles.", name: "Aneesh Karunan, AVP -  iBus Networks, Kochi" },
      { avatar: t4, rating: 5, quote: "These banana chips are just perfect ... super crispy, not too oily, and have that authentic Kerala flavor you don’t find everywhere. It’s become a must-have snack at our home!", name: "Shameer Ahammed Shaik, Calicut" },
      { avatar: t5, rating: 5, quote: "The Kadumango Pickle from Aachi Amma Foods is simply amazing! Perfect balance of spices. It reminds me of what my grandmother used to make. A must-have with curd rice and meals!", name: "Nyjil Joseph, Alappuzha - Ritzee Bags" },
    ];

    const [index, setIndex] = useState(0);
    const [testiGrab, setTestiGrab] = useState(false);
    const [isWide, setIsWide] = useState(typeof window !== "undefined" ? window.innerWidth > 1200 : true);

    const testiPointerStart = useRef(null);
    const testiPointerActive = useRef(false);
    const [dragDx, setDragDx] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const animatingRef = useRef(false);

    useEffect(() => {
      const onResize = () => setIsWide(typeof window !== "undefined" ? window.innerWidth > 1200 : true);
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }, []);

    const startDrag = (clientX) => {
      testiPointerActive.current = true;
      testiPointerStart.current = clientX;
      setTestiGrab(true);
      setIsDragging(true);
    };

    const onPointerDown = (e) => {
      if (animatingRef.current) return;
      const clientX = e.clientX ?? (e.touches && e.touches[0] && e.touches[0].clientX);
      startDrag(clientX);
      if (e.target && e.pointerId && e.target.setPointerCapture) {
        try {
          e.target.setPointerCapture(e.pointerId);
        } catch (err) { }
      }
    };

    const onPointerMove = (e) => {
      if (!testiPointerActive.current || testiPointerStart.current == null) return;
      const clientX = e.clientX ?? (e.touches && e.touches[0] && e.touches[0].clientX);
      const dx = clientX - testiPointerStart.current;
      setDragDx(dx);
    };

    const finishSwipe = (endX) => {
      if (!testiPointerActive.current || testiPointerStart.current == null) {
        testiPointerActive.current = false;
        testiPointerStart.current = null;
        setIsDragging(false);
        setDragDx(0);
        setTestiGrab(false);
        return;
      }
      const dx = endX - testiPointerStart.current;
      const threshold = 80; // increased threshold as requested
      if (Math.abs(dx) >= threshold) {
        animatingRef.current = true;
        if (dx > 0) {
          setIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
        } else {
          setIndex((prev) => (prev + 1) % testimonials.length);
        }
        // keep animation slightly longer for smoother feel
        setTimeout(() => {
          setDragDx(0);
          animatingRef.current = false;
        }, 360);
      } else {
        // snap back
        setDragDx(0);
      }
      testiPointerActive.current = false;
      testiPointerStart.current = null;
      setIsDragging(false);
      setTestiGrab(false);
    };

    const onPointerUp = (e) => {
      const endX = e.clientX ?? (e.changedTouches && e.changedTouches[0] && e.changedTouches[0].clientX);
      finishSwipe(endX);
      if (e.target && e.pointerId && e.target.releasePointerCapture) {
        try {
          e.target.releasePointerCapture(e.pointerId);
        } catch (err) { }
      }
    };

    const onTouchStartTesti = (e) => {
      if (animatingRef.current) return;
      startDrag(e.touches[0].clientX);
    };

    const onTouchMoveTesti = (e) => {
      onPointerMove(e);
    };

    const onTouchEndTesti = (e) => {
      const endX = e.changedTouches[0].clientX;
      finishSwipe(endX);
    };

    const onPointerCancelOrLeave = () => {
      testiPointerActive.current = false;
      testiPointerStart.current = null;
      setIsDragging(false);
      setDragDx(0);
      setTestiGrab(false);
    };

    // compute a more expressive transform: translateX, rotate (subtle), and scale
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const rotateDeg = clamp(dragDx / 25, -8, 8); // subtle tilt
    const scaleVal = isDragging ? 0.985 : 1;
    const opacityVal = clamp(1 - Math.abs(dragDx) / 600, 0.18, 1); // opacity reduces with more drag (down to ~0.18)

    const wrapperStyle = {
      transform: `translateX(${dragDx}px) rotate(${rotateDeg}deg) scale(${scaleVal})`,
      transition: isDragging || animatingRef.current ? "none" : "transform 360ms cubic-bezier(.2,.9,.2,1), opacity 360ms ease",
      opacity: opacityVal,
      cursor: testiGrab ? "grabbing" : "grab",
      willChange: "transform, opacity",
    };

    return (
      <section aria-label="Customer testimonials" className="bg-[#F5F1E5]">
        <div className="w-full mx-auto px-2 sm:px-4 py-8 md:py-12" style={{ paddingBottom: 0 }}>
          <SectionTitle text="WHAT OUR CUSTOMERS ARE SAYING" />

          <div
            className="relative w-full text-center overflow-visible"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerCancelOrLeave}
            onTouchStart={onTouchStartTesti}
            onTouchMove={onTouchMoveTesti}
            onTouchEnd={onTouchEndTesti}
            onMouseLeave={onPointerCancelOrLeave}
            style={{ touchAction: "pan-y" }}
            role="region"
            aria-roledescription="carousel"
            aria-label="Customer testimonials"
          >
            <div className="w-full min-h-[300px] sm:min-h-[340px] md:min-h-[380px] lg:min-h-[440px] relative bg-transparent flex flex-col items-center justify-center px-4">
              {/* entire visible content wrapped so stars/avatar/title/quote/name move together */}
              <div className="flex flex-col items-center justify-center px-3 sm:px-6" style={wrapperStyle}>
                <div className="flex items-center justify-center -mt-8">
                  <div className="w-20 sm:w-24 md:w-28 rounded-full overflow-hidden shadow-md bg-transparent transform transition-transform">
                    <img src={testimonials[index].avatar} alt={`avatar-${index + 1}`} className="w-full h-full object-cover" draggable={false} />
                  </div>
                </div>

                {/* STARS moved inside wrapper so they swipe together */}
                <div className="mt-3 flex justify-center gap-1" aria-hidden>
                  {Array.from({ length: testimonials[index].rating }).map((_, i) => (
                    <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill={ACCENT} xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.402 8.168L12 18.896l-7.336 3.856 1.402-8.168L.132 9.21l8.2-1.192L12 .587z" />
                    </svg>
                  ))}
                </div>

                <h3 className="mt-3 font-extrabold text-base md:text-lg lg:text-xl" style={{ color: ACCENT, fontSize: "clamp(16px, 2.2vw, 30px)" }}>
                  {testimonials[index].title}
                </h3>

                <blockquote className="mt-3 leading-relaxed italic text-gray-600 text-sm md:text-base text-center max-w-[920px]">
                  “{testimonials[index].quote}”
                </blockquote>

                <div className="mt-3 font-semibold text-sm text-gray-700">{testimonials[index].name}</div>

                <div className="mt-4 flex items-center justify-center gap-3" role="tablist" aria-label="testimonial dots">
                  {testimonials.map((_, i) => {
                    const active = i === index;
                    return (
                      <button
                        key={i}
                        aria-label={`Go to testimonial ${i + 1}`}
                        aria-selected={active}
                        onClick={() => setIndex(i)}
                        className={`rounded-full transition-transform ${active ? "scale-125" : "opacity-70"}`}
                        style={{
                          width: active ? 14 : 9,
                          height: active ? 14 : 9,
                          background: active ? ACCENT : "#D1D5DB",
                          border: active ? `2px solid ${ACCENT}` : "1px solid rgba(0,0,0,0.05)",
                          padding: 0,
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            {isWide && (
              <>
                <button
                  aria-label="Previous testimonial"
                  onClick={() => setIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
                  className="absolute left-20 sm:left-24 top-1/2 -translate-y-1/2 bg-white border rounded-full w-10 h-10 sm:w-12 sm:h-12 grid place-items-center shadow-md hover:scale-105 transition-transform"
                  style={{ zIndex: 30 }}
                >
                  <ChevronLeftIcon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: ACCENT }} />
                </button>

                <button
                  aria-label="Next testimonial"
                  onClick={() => setIndex((prev) => (prev + 1) % testimonials.length)}
                  className="absolute right-20 sm:right-24 top-1/2 -translate-y-1/2 bg-white border rounded-full w-10 h-10 sm:w-12 sm:h-12 grid place-items-center shadow-md hover:scale-105 transition-transform"
                  style={{ zIndex: 30 }}
                >
                  <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: ACCENT }} />
                </button>
              </>
            )}
          </div>

          <div className="w-full mt-[-20px]">
            <img src={hi2} alt="testimonial decorative" className="w-full object-cover block" draggable={false} />
          </div>
        </div>
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50" style={{ paddingBottom: 0 }}>
      {/* hero/banner */}
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
                className={`absolute inset-0 transition-opacity duration-500 ease-out transform ${idx === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"}`}
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

          {/* hero arrows */}
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

          {/* hero dots (responsive smaller on mobile) */}
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

        {/* Categories bar - now dynamic (uses server categories). Fallback to local mapping when server image missing. */}
        <div id="categories-bar" className="sticky top-6 z-10 mt-[15px]">
          {/* Full-width horizontal scroll wrapper (no centered container) */}
          <div
            className="w-full overflow-x-auto no-scrollbar"
            style={{ WebkitOverflowScrolling: "touch" }}
            aria-label="Categories"
            role="navigation"
          >
            {/* inner row: non-wrapping, left padding so first chip is not cut */}
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

      {/* main content */}
      <main className="container mx-auto px-2 sm:px-4 -mt-12 space-y-8 sm:space-y-12">
        {/* BEST SELLING */}
        {productList && productList.length > 0 && (() => {
          const bestSelling = productList.filter((p) => Array.isArray(p.special) && p.special.includes("best-selling"));
          if (!bestSelling.length) return null;
          return (
            <section id="best-selling" className="bg-white rounded-2xl p-4 sm:p-8 mt-[60px]">
              <SectionTitle text="BEST SELLING" />
              <PaginatedProducts
                products={bestSelling}
                pageSize={4}
                sectionId="best-selling-paginated"
                renderProduct={(product) => (
                  <ShoppingProductTile product={product} handleGetProductDetails={handleGetProductDetails} handleAddtoCart={handleAddtoCart} />
                )}
              />
            </section>
          );
        })()}

        {/* TRENDING */}
        {productList && productList.length > 0 && (() => {
          const trending = productList.filter((p) => Array.isArray(p.special) && p.special.includes("trending"));
          if (!trending.length) return null;
          return (
            <section id="trending" className="bg-white rounded-2xl p-4 sm:p-8 mt-[50px]">
              <SectionTitle text="TRENDING" />
              <PaginatedProducts
                products={trending}
                pageSize={4}
                sectionId="trending-paginated"
                renderProduct={(product) => (
                  <ShoppingProductTile product={product} handleGetProductDetails={handleGetProductDetails} handleAddtoCart={handleAddtoCart} />
                )}
              />
            </section>
          );
        })()}

        {/* NEW ARRIVAL */}
        {productList && productList.length > 0 && (() => {
          const newArrival = productList.filter((p) => Array.isArray(p.special) && p.special.includes("new-arrival"));
          if (!newArrival.length) return null;
          return (
            <section id="new-arrival" className="bg-white rounded-2xl p-4 sm:p-8">
              <SectionTitle text="NEW ARRIVAL" />
              <PaginatedProducts
                products={newArrival}
                pageSize={4}
                sectionId="new-arrival-paginated"
                renderProduct={(product) => (
                  <ShoppingProductTile product={product} handleGetProductDetails={handleGetProductDetails} handleAddtoCart={handleAddtoCart} />
                )}
              />
            </section>
          );
        })()}
      </main>

      {/* full width image */}
      <div className="w-full overflow-hidden">
        <img src={hi1} alt="feature-full-width" className="w-full object-cover block" draggable={false} />
      </div>

      {/* promo */}
      <FullWidthPromo />

      {/* testimonials */}
      <TestimonialSlider />

      {/* VALUES SECTION inserted right after hero/banner */}
      <ValuesSection />

      {/* FEATURE PRODUCTS */}
      <section id="feature-products" className="container mx-auto px-2 sm:px-4 rounded-2xl p-4 sm:p-8">
        <SectionTitle text="FEATURE PRODUCTS" />
        <PaginatedProducts
          products={productList && productList.length > 0 ? productList : []}
          pageSize={4}
          sectionId="feature-products-paginated"
          renderProduct={(product) => (
            <ShoppingProductTile product={product} handleGetProductDetails={handleGetProductDetails} handleAddtoCart={handleAddtoCart} />
          )}
        />
      </section>

      <div className="w-full mt-[-20px]">
        <img src={hi3} alt="testimonial decorative" className="w-full object-cover block" draggable={false} />
      </div>

      {/* POPUP MODAL (storefront) */}
      <PopupModal open={showPopup} onClose={handleClosePopup} popup={activePopup} />
    </div>
  );
}
