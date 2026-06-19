import api from "@/api/axios";
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Star as StarIcon,
    Share2,
    ShoppingCart,
    Minus,
    Plus,
    ChevronLeft,
    ChevronRight,
    Leaf,
    Clock,
    Award,
    Package,
    Layers,
    Globe,
    Sparkles,
    Check,
    Calendar,
    MessageSquare,
    ClipboardList,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import StarRatingComponent from "@/components/common/star-rating";

import { useDispatch, useSelector } from "react-redux";
import { addProductToCart } from "@/lib/add-to-cart";
import { useToast } from "@/components/ui/use-toast";
import { setProductDetails, updateProductInList } from "@/store/shop/products-slice";
import { addReview, getReviews } from "@/store/shop/review-slice";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import ProductSchemaMarkup from "@/components/shopping-view/ProductSchemaMarkup";

const ACCENT = "#08665F";

const getSpecIcon = (label = "") => {
    const l = label.toLowerCase();
    if (l.includes("weight") || l.includes("size") || l.includes("qty") || l.includes("quantity")) {
        return <Package className="w-5 h-5" />;
    }
    if (l.includes("shelf") || l.includes("expire") || l.includes("time") || l.includes("life")) {
        return <Clock className="w-5 h-5" />;
    }
    if (l.includes("brand") || l.includes("manufacturer") || l.includes("quality") || l.includes("maker")) {
        return <Award className="w-5 h-5" />;
    }
    if (l.includes("origin") || l.includes("country") || l.includes("made")) {
        return <Globe className="w-5 h-5" />;
    }
    if (l.includes("type") || l.includes("form") || l.includes("category")) {
        return <Layers className="w-5 h-5" />;
    }
    return <ClipboardList className="w-5 h-5" />;
};

const parseHowToSteps = (text = "") => {
    if (!text) return [];
    let steps = [];
    const stepRegex = /(?:Step\s*\d+[:.-]?|\b\d+[:.-]\s+)/gi;
    if (stepRegex.test(text)) {
        const matches = [];
        let match;
        const tempRegex = /(?:Step\s*\d+[:.-]?|\b\d+[:.-]\s+)/gi;
        while ((match = tempRegex.exec(text)) !== null) {
            matches.push({ index: match.index, length: match[0].length });
        }
        if (matches.length > 0) {
            for (let i = 0; i < matches.length; i++) {
                const start = matches[i].index + matches[i].length;
                const end = i + 1 < matches.length ? matches[i + 1].index : text.length;
                const stepText = text.substring(start, end).trim();
                if (stepText) {
                    steps.push(stepText);
                }
            }
        }
    }
    if (steps.length === 0) {
        steps = text.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    }
    if (steps.length <= 1 && text.length > 120 && text.includes(".")) {
        const sentences = text.split(/(?<=\.)\s+/);
        if (sentences.length > 1) {
            steps = sentences.map(s => s.trim()).filter(Boolean);
        }
    }
    return steps
        .map(s => s.replace(/^(?:Step\s*\d+[:.-]?|\b\d+[:.-]?|[◆●•*\-■▪▫◦])\s*/gi, "").trim())
        .filter(Boolean);
};

const getAvatarGradient = (char = "") => {
    const code = (char.toUpperCase().charCodeAt(0) || 0) - 65;
    const gradients = [
        "from-teal-400 to-[#08665F]",
        "from-emerald-400 to-emerald-600",
        "from-amber-400 to-amber-600",
        "from-orange-400 to-red-500",
        "from-cyan-400 to-blue-600",
        "from-rose-400 to-pink-600",
    ];
    return gradients[Math.max(0, code) % gradients.length];
};


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
            <span
                className="block tracking-[0.03em] sm:tracking-[0.05em] md:tracking-[0.06em]"
                style={{ fontSize: 'clamp(14px, 2.4vw, 28px)' }}
            >
                {text}
            </span>
        </h2>

        <div
            className="flex-1 max-w-[50px] sm:max-w-[100px] md:max-w-[150px] h-[1px] sm:h-[2px] md:h-[2px] ml-3 sm:ml-6 rounded-full"
            style={{ background: `${ACCENT}22` }}
        />
    </div>
);

function ProductDescriptionBlock({ productDetails }) {
    if (!productDetails) return null;
    const hasSections = Array.isArray(productDetails.descriptionSections) && productDetails.descriptionSections.length > 0;
    const plain = (productDetails.description && String(productDetails.description).trim()) || "";
    if (!hasSections && !plain && !productDetails.descriptionTitle) return null;

    return (
        <div
            id="product-description-inline"
            className="mt-4 pt-4 border-t border-slate-100 text-left text-slate-700"
        >
            {productDetails.descriptionTitle ? (
                <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mb-4 text-slate-900">
                    {productDetails.descriptionTitle}
                </div>
            ) : null}
            <div className="space-y-4 text-base font-normal text-slate-700 leading-relaxed">
                {hasSections ? (
                    productDetails.descriptionSections.map((sec, i) => (
                        <div key={i}>
                            {sec.title ? (
                                <div className="text-base font-semibold text-slate-900 mb-1">{sec.title}</div>
                            ) : null}
                            {sec.content ? (
                                <div className="text-base mt-1 whitespace-pre-line leading-relaxed text-slate-700">
                                    {sec.content}
                                </div>
                            ) : null}
                        </div>
                    ))
                ) : (
                    <div className="text-base whitespace-pre-line leading-relaxed text-slate-700">
                        {plain || "No description available."}
                    </div>
                )}
            </div>
        </div>
    );
}

function ThumbnailSlider({ images = [], selectedImage, setSelectedImage }) {
    const [index, setIndex] = React.useState(0);
    const [visible, setVisible] = React.useState(3);

    React.useEffect(() => {
        function update() {
            const w = window.innerWidth;
            if (w < 640) setVisible(3);
            else if (w < 1024) setVisible(4);
            else setVisible(5);
        }
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, []);

    React.useEffect(() => {
        if (index > Math.max(0, images.length - visible)) {
            setIndex(Math.max(0, images.length - visible));
        }
    }, [images.length, visible]);

    return (
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-3 touch-pan-x py-1">
                {images.map((img, idx) => (
                    <button
                        key={idx}
                        onClick={() => setSelectedImage(img)}
                        className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-lg overflow-hidden border ${selectedImage === img ? "ring-2 ring-amber-300" : "border-slate-100"} mr-2`}
                        aria-label={`thumbnail-${idx}`}
                    >
                        <img src={img} alt={`thumb-${idx}`} className="w-full h-full object-cover" />
                    </button>
                ))}
            </div>
        </div>
    );
}

function pickDefaultVariant(variations = []) {
    if (!Array.isArray(variations) || variations.length === 0) return null;
    const explicit = variations.find((v) => v && v.isDefault);
    if (explicit) return explicit;
    return variations[0];
}

function variantEqual(a, b) {
    if (!a && !b) return true;
    if (!a || !b) return false;
    return (String(a.label || "") === String(b.label || "")) &&
        (Number(a.price || 0) === Number(b.price || 0)) &&
        (Number(a.salePrice || 0) === Number(b.salePrice || 0));
}

function PremiumTabs({ tabs = [], activeKey, onChangeKey }) {
    return (
        <div className="flex justify-center">
            <div
                className="relative z-10 flex gap-3 sm:gap-4 items-center justify-start sm:justify-center overflow-x-auto no-scrollbar px-2 py-2 sm:py-2 rounded-lg max-w-full"
                role="tablist"
                aria-label="Product tabs"
            >
                {tabs.map((t) => {
                    const isActive = activeKey === t.key;
                    return (
                        <button
                            key={t.key}
                            role="tab"
                            aria-selected={isActive}
                            onClick={() => onChangeKey(t.key)}
                            className={`flex-shrink-0 whitespace-nowrap px-5 py-2.5 sm:px-6 sm:py-3 rounded-full text-base sm:text-lg font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 ${isActive ? 'bg-amber-500 text-white shadow-md' : 'bg-white/60 text-slate-700 hover:bg-slate-50 border border-slate-100'}`}
                        >
                            {t.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default function ProductDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { toast } = useToast();

    const { user, isAuthenticated } = useSelector((state) => state.auth || {});
    const { cartItems } = useSelector((state) => state.shopCart || {});
    const { reviews } = useSelector((state) => state.shopReview || {});

    const [productDetails, setProductDetailsState] = useState(null);
    const [loading, setLoading] = useState(true);

    const [selectedImage, setSelectedImage] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [reviewMsg, setReviewMsg] = useState("");
    const [rating, setRating] = useState(0);

    const [selectedVariantIndex, setSelectedVariantIndex] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null);

    const [relatedProducts, setRelatedProducts] = useState([]);

    const [activeSection, setActiveSection] = useState("specs");
    const [isMobile, setIsMobile] = useState(false);
    const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
        };
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);



    useEffect(() => {
        let mounted = true;
        async function load() {
            try {
                setLoading(true);
                const res = await api.get(`/api/shop/products/get/${id}`);
                const pd = res?.data?.data ?? res?.data ?? null;
                if (mounted && pd) {
                    setProductDetailsState(pd);
                    setSelectedImage(pd?.images?.[0] ?? pd?.image ?? "");
                   
                    const vs = Array.isArray(pd?.variations) ? pd.variations : [];
                    if (vs.length > 0) {
                        const defaultVar = pickDefaultVariant(vs);
                        const idx = vs.findIndex((v) => v === defaultVar);
                        setSelectedVariantIndex(idx >= 0 ? idx : 0);
                        setSelectedVariant(defaultVar);
                    } else {
                        setSelectedVariant(null);
                        setSelectedVariantIndex(null);
                    }
                    
                    if (pd?._id) dispatch(getReviews(pd._id));
              
                    try {
                        if (pd?.category) {
                            const category = encodeURIComponent(pd.category);
                            const resp = await api.get(`/api/shop/products/get?category=${category}`);
                            let items = resp?.data?.data ?? resp?.data ?? [];
                            if (!Array.isArray(items)) items = [];
                            items = items.filter(
                                (p) => p?._id !== pd?._id && p?.isAvailable !== false
                            );
                            for (let i = items.length - 1; i > 0; i--) {
                                const j = Math.floor(Math.random() * (i + 1));
                                [items[i], items[j]] = [items[j], items[i]];
                            }
                            setRelatedProducts(items.slice(0, 12));
                        }
                    } catch (e) {
                        setRelatedProducts([]);
                    }
                } else {
                    if (mounted) toast({ title: "Could not load product", variant: "destructive" });
                }
            } catch (e) {
                console.error("Error loading product:", e);
                if (mounted) toast({ title: "Failed to load product", variant: "destructive" });
            } finally {
                if (mounted) setLoading(false);
            }
        }
        if (id) load();
        return () => { mounted = false; };
    }, [id, dispatch, toast]);

    useEffect(() => {
        if (!productDetails) return;
        const vs = Array.isArray(productDetails?.variations) ? productDetails.variations : [];
        if (selectedVariantIndex === null || !vs.length) {
            setSelectedVariant(pickDefaultVariant(vs));
        } else {
            setSelectedVariant(vs[selectedVariantIndex] ?? pickDefaultVariant(vs));
        }
    }, [selectedVariantIndex, productDetails]);

    const reviewCount = reviews?.length ?? productDetails?.reviewCount ?? 0;
    const averageReview =
        reviews && reviews.length > 0
            ? reviews.reduce((sum, r) => sum + (Number(r.reviewValue) || 0), 0) / reviews.length
            : Number(productDetails?.averageRating ?? 0);

    const price = Number(productDetails?.price ?? 0);
    const salePrice = Number(productDetails?.salePrice ?? 0);

    const effectivePrice = useMemo(() => {
        if (selectedVariant) {
            const p = Number(selectedVariant.price ?? 0);
            const s = Number(selectedVariant.salePrice ?? 0);
            return { price: p, salePrice: s > 0 ? s : p };
        }
        const p = Number(price || 0);
        const s = Number(salePrice || 0);
        return { price: p, salePrice: s > 0 ? s : p };
    }, [selectedVariant, price, salePrice]);

    const isProductAvailable = productDetails?.isAvailable !== false;
    const canPurchase = isProductAvailable;
    const purchaseDisabledLabel = "Currently unavailable";

    const hasDiscount = effectivePrice.salePrice > 0 && effectivePrice.price > 0 && effectivePrice.salePrice < effectivePrice.price;
    const discountPercent = hasDiscount
        ? Math.round(((effectivePrice.price - effectivePrice.salePrice) / effectivePrice.price) * 100)
        : 0;

    const ratingDistribution = useMemo(() => {
        const dist = [0, 0, 0, 0, 0];
        if (!reviews || reviews.length === 0) return dist;
        reviews.forEach((r) => {
            const val = Math.round(Number(r.reviewValue) || 0);
            if (val >= 5) dist[0] += 1;
            else if (val === 4) dist[1] += 1;
            else if (val === 3) dist[2] += 1;
            else if (val === 2) dist[3] += 1;
            else dist[4] += 1;
        });
        return dist;
    }, [reviews]);

    const galleryImages = useMemo(() => {
        const imgs = productDetails?.images;
        if (Array.isArray(imgs) && imgs.length > 0) return imgs.filter(Boolean);
        if (productDetails?.image) return [productDetails.image];
        return [];
    }, [productDetails?.images, productDetails?.image]);

    const goPrevGalleryImage = () => {
        if (galleryImages.length < 2) return;
        const i = galleryImages.indexOf(selectedImage);
        const idx = i >= 0 ? i : 0;
        setSelectedImage(galleryImages[(idx - 1 + galleryImages.length) % galleryImages.length]);
    };

    const goNextGalleryImage = () => {
        if (galleryImages.length < 2) return;
        const i = galleryImages.indexOf(selectedImage);
        const idx = i >= 0 ? i : 0;
        setSelectedImage(galleryImages[(idx + 1) % galleryImages.length]);
    };

    const increment = () => {
        setQuantity((q) => {
            const val = q === "" ? 0 : Number(q);
            return Math.min(99, val + 1);
        });
    };
    const decrement = () => {
        setQuantity((q) => {
            const val = q === "" ? 2 : Number(q);
            return Math.max(1, val - 1);
        });
    };

    function handleAddToCart() {
        if (!productDetails) return;
        if (!isProductAvailable) {
            toast({ title: "This product is currently unavailable", variant: "destructive" });
            return;
        }

        const productForCart = {
            ...productDetails,
            price: effectivePrice.price,
            salePrice: effectivePrice.salePrice,
            selectedVariant: selectedVariant ? { ...selectedVariant } : null,
        };

        addProductToCart({
            dispatch,
            user,
            navigate,
            productId: productDetails?._id,
            quantity,
            productObj: productForCart,
            fromPath: `/product/${productDetails?._id}`,
        }).then((data) => {
            if (data?.redirectedToLogin) return;
            const payload = data?.payload;
            if (payload?.success || payload?.data) {
                toast({ title: "Added to cart" });
            } else {
                toast({ title: payload?.message || "Failed to add", variant: "destructive" });
            }
        });
    }

    function handleBuyNow() {
        if (!productDetails) return;
        if (!isProductAvailable) {
            toast({ title: "This product is currently unavailable", variant: "destructive" });
            return;
        }

        const priceVal = Number(effectivePrice.price || 0);
        const saleVal = Number(effectivePrice.salePrice || priceVal);
        const unitSaved = saleVal > 0 ? saleVal : priceVal;
        const qty = Number(quantity || 1);

        const buyNowItem = {
            productId: productDetails?._id,
            title: productDetails?.title || "",
            image: selectedImage ?? productDetails?.image ?? "",
          
            price: priceVal,
            salePrice: saleVal,
            unitPriceSaved: unitSaved,
            quantity: qty,
            totalPrice: unitSaved * qty,
            selectedVariant: selectedVariant ? {
                label: selectedVariant.label ?? null,
                price: Number(selectedVariant.price ?? 0),
                salePrice: Number(selectedVariant.salePrice ?? selectedVariant.price ?? 0),
                meta: selectedVariant.meta || {}
            } : null,
        };

        dispatch(setProductDetails());
        navigate("/checkout", { state: { buyNow: true, items: [buyNowItem] } });
    }

    function handleAddReview() {
        if (!user) {
            toast({ title: "Please login to add review", variant: "destructive" });
            return;
        }
        if (!productDetails?._id) return;
        dispatch(
            addReview({
                productId: productDetails?._id,
                userId: user?.id,
                userName: user?.userName || user?.name,
                reviewMessage: reviewMsg,
                reviewValue: rating,
            })
        ).then((data) => {
            if (data.payload?.success) {
                setRating(0);
                setReviewMsg("");
                setIsWriteReviewOpen(false);
                if (productDetails?._id) {
                   
                    dispatch(getReviews(productDetails._id)).then((res) => {
                        const reviews = res.payload?.data || [];
                        const reviewCount = Array.isArray(reviews) ? reviews.length : 0;
                        const sum = Array.isArray(reviews) && reviews.length > 0 ? reviews.reduce((acc, r) => acc + (Number(r.reviewValue) || 0), 0) : 0;
                        const average = reviewCount > 0 ? (sum / reviewCount) : 0;
                       
                        dispatch(updateProductInList({
                            productId: productDetails._id,
                            updates: {
                                reviewCount,
                                averageRating: average,
                                rating: average,
                                reviews
                            }
                        }));
                    });
                }
                toast({ title: "Review added successfully!" });
            } else {
                toast({ title: data?.payload?.message || "Failed to add review", variant: "destructive" });
            }
        });
    }

    const handleShare = async () => {
        const url = `${window.location.origin}/product/${productDetails?._id}`;
        const title = productDetails?.title ?? "Product";

        if (navigator.share) {
            try {
                await navigator.share({ title, text: `Check out this product: ${title}`, url });
                toast({ title: "Thanks for sharing!" });
                return;
            } catch { }
        }

        try {
            await navigator.clipboard.writeText(url);
            toast({ title: "Product link copied to clipboard" });
        } catch {
            toast({ title: "Could not copy link", variant: "destructive" });
        }
    };

    function formatPrice(val) {
        if (Number.isNaN(Number(val))) return val;
        return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(Number(val || 0));
    }

    const percentSavedLabel = hasDiscount ? `${discountPercent}% OFF` : null;

    const StarDisplay = ({ rating = 0, size = 14 }) => {
        const filled = Math.round(Number(rating) || 0);
        return (
            <div className="inline-flex items-center gap-1" style={{ lineHeight: 0 }}>
                {[0, 1, 2, 3, 4].map((i) => (
                    <StarIcon
                        key={i}
                        size={size}
                        className={i < filled ? "fill-amber-400 text-amber-400" : "text-amber-200/60"}
                    />
                ))}
            </div>
        );
    };

    const howToParagraph = productDetails?.howTo ?? null;

    if (loading) {
        return (
            <section
                className="w-full flex items-center justify-center"
                style={{ height: "50vh" }}
                aria-live="polite"
                aria-busy="true"
            >
                <div className="text-center">
                    <div className="text-lg font-medium text-slate-700">Loading product...</div>
                </div>
            </section>
        );
    }

    if (!productDetails) {
        return <div className="p-6 w-full">Product not found.</div>;
    }

    const tabList = [
        { key: 'specs', label: 'Specifications' },
        { key: 'ingredients', label: 'Ingredients' },
    ];

    if (howToParagraph) {
        tabList.push({ key: 'howTo', label: 'How to use' });
    }

    const renderReviews = () => {
        const totalCount = reviews?.length ?? 0;
        const starLevels = [5, 4, 3, 2, 1];

        return (
            <div id="product-reviews-section" className="space-y-8">
                {/* 1. Rating Summary Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 sm:p-8 rounded-3xl border border-slate-100 bg-white shadow-sm">
                    {/* Overall Rating Panel */}
                    <div className="flex flex-col items-center justify-center text-center p-4 border-b md:border-b-0 md:border-r border-slate-100">
                        <div className="text-5xl sm:text-6xl font-black tracking-tight text-slate-800 mb-2">
                            {averageReview ? averageReview.toFixed(1) : "0.0"}
                        </div>
                        <div className="mb-2">
                            <StarDisplay rating={averageReview} size={22} />
                        </div>
                        <div className="text-sm sm:text-base font-semibold text-slate-500">
                            Based on {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
                        </div>
                    </div>

                    {/* Progress Bars */}
                    <div className="md:col-span-2 flex flex-col justify-center gap-3.5 px-0 md:px-6">
                        {starLevels.map((level, idx) => {
                            const count = ratingDistribution[idx] || 0;
                            const pct = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
                            return (
                                <div key={level} className="flex items-center gap-3 text-sm">
                                    <span className="w-10 text-right font-bold text-slate-500 whitespace-nowrap">{level} star</span>
                                    <div className="flex-1 h-3 rounded-full bg-slate-100 overflow-hidden relative">
                                        <div 
                                            className="h-full rounded-full bg-amber-400 transition-all duration-500"
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                    <span className="w-12 text-left font-bold text-slate-650">{pct}%</span>
                                    <span className="w-8 text-right text-xs text-slate-400 font-semibold">({count})</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 2. Customer Reviews List */}
                <div className="space-y-6">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-850 border-b border-slate-100 pb-3">
                        Reviews List ({reviewCount})
                    </h3>
                    
                    {reviews && reviews.length > 0 ? (
                        reviews.map((reviewItem, idx) => {
                            const firstChar = (reviewItem?.userName?.[0] || "U").toUpperCase();
                            const avatarGrad = getAvatarGradient(reviewItem?.userName || "U");
                            return (
                                <div 
                                    key={reviewItem._id || idx} 
                                    className="flex gap-4 p-5 sm:p-6 rounded-2xl border border-slate-100 bg-white hover:shadow-md transition-all duration-300 relative overflow-hidden text-left"
                                >
                                    <div className={`w-12 h-12 rounded-full shrink-0 flex items-center justify-center text-white font-extrabold text-base shadow-sm bg-gradient-to-br ${avatarGrad}`}>
                                        {firstChar}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-3 flex-wrap">
                                            <div>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h4 className="font-extrabold text-base sm:text-lg text-slate-800 leading-tight">
                                                        {reviewItem?.userName}
                                                    </h4>
                                                    <span className="inline-flex items-center gap-0.5 text-[10px] sm:text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                                        <Check className="w-3.5 h-3.5 text-emerald-650 shrink-0" />
                                                        Verified Buyer
                                                    </span>
                                                </div>
                                                <div className="text-xs text-slate-400 mt-1 font-medium flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    {new Date(reviewItem?.createdAt || reviewItem?.date || Date.now()).toLocaleDateString("en-IN", { day: 'numeric', month: 'long', year: 'numeric' })}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 shrink-0 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">
                                                <StarDisplay rating={reviewItem?.reviewValue} size={13} />
                                            </div>
                                        </div>
                                        <p className="mt-4 text-base text-slate-600 leading-relaxed font-medium whitespace-pre-line text-left">
                                            {reviewItem?.reviewMessage || reviewItem?.reviewText}
                                        </p>

                                        {reviewItem?.adminReply?.text ? (
                                            <div className="mt-5 p-4.5 sm:p-5 rounded-2xl bg-teal-50/40 border border-teal-100/50 shadow-inner relative text-left">
                                                <div className="absolute top-0 left-6 -mt-2 w-4 h-4 bg-teal-50/40 border-t border-l border-teal-100/50 transform rotate-45" />
                                                <div className="text-xs sm:text-sm font-bold text-[#08665F] uppercase tracking-wider flex items-center gap-1.5">
                                                    <Award className="w-4 h-4" />
                                                    Official response from Aachiamma
                                                </div>
                                                <p className="text-base text-slate-700 mt-2 leading-relaxed font-semibold whitespace-pre-line">
                                                    {reviewItem.adminReply.text}
                                                </p>
                                                <div className="text-[11px] sm:text-xs text-slate-400 mt-2.5 font-semibold">
                                                    Replied on {new Date(reviewItem.adminReply?.repliedAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'long', year: 'numeric' })}
                                                </div>
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="p-12 text-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/40">
                            <MessageSquare className="w-10 h-10 text-slate-350 mx-auto mb-3" />
                            <p className="text-base sm:text-lg text-slate-500 font-bold">No reviews yet.</p>
                            <p className="text-sm text-slate-400 mt-1 font-medium">Be the first to share your thoughts and help other buyers!</p>
                        </div>
                    )}
                </div>

                {/* 3. Collapsible Write a Review drawer */}
                <div className="border-t border-slate-100 pt-8 mt-4">
                    {!isWriteReviewOpen ? (
                        <div className="flex justify-center">
                            <Button
                                onClick={() => setIsWriteReviewOpen(true)}
                                className="bg-[#08665F] hover:bg-[#08665F]/95 text-white font-extrabold px-8 py-3 rounded-full shadow-md flex items-center gap-2 hover:scale-105 active:scale-95 transition-all duration-200"
                            >
                                <MessageSquare className="w-5 h-5" />
                                Write a Customer Review
                            </Button>
                        </div>
                    ) : (
                        <div className="p-6 sm:p-8 rounded-3xl border border-slate-100 bg-slate-50/40 shadow-sm animate-slideUp text-left">
                            <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-3">
                                <Label className="text-lg sm:text-xl font-extrabold text-slate-800 flex items-center gap-2">
                                    <MessageSquare className="w-5 h-5 text-[#08665F]" />
                                    Share Your Feedback
                                </Label>
                                <button
                                    onClick={() => {
                                        setIsWriteReviewOpen(false);
                                        setRating(0);
                                        setReviewMsg("");
                                    }}
                                    className="text-slate-400 hover:text-slate-650 text-sm font-bold transition-colors"
                                >
                                    Close Form
                                </button>
                            </div>
                            
                            {/* Star Rating Select */}
                            <div className="mb-5">
                                <span className="block text-sm font-bold text-slate-500 mb-2">How would you rate this product?</span>
                                <div className="flex items-center gap-3 flex-wrap">
                                    <StarRatingComponent rating={rating} handleRatingChange={(val) => setRating(val)} />
                                    <span className="text-xs sm:text-sm text-slate-500 font-bold bg-white border border-slate-150 px-3.5 py-1 rounded-full shadow-sm">
                                        {rating ? `${rating} / 5 Stars` : "Select a Rating"}
                                    </span>
                                </div>
                            </div>
                            
                            {/* Comment */}
                            <div className="mb-5">
                                <span className="block text-sm font-bold text-slate-500 mb-2">Your Review Comments</span>
                                <textarea
                                    value={reviewMsg}
                                    onChange={(e) => setReviewMsg(e.target.value)}
                                    placeholder="Tell us what you liked or disliked, and how you used this product. Your feedback helps others make better choices!"
                                    rows={4}
                                    className="w-full text-base bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#08665F] focus:border-transparent rounded-2xl p-4 transition-all resize-none shadow-sm font-medium"
                                />
                            </div>
                            
                            <div className="flex justify-end gap-3 mt-4">
                                <Button
                                    variant="ghost"
                                    onClick={() => {
                                        setIsWriteReviewOpen(false);
                                        setRating(0);
                                        setReviewMsg("");
                                    }}
                                    className="border border-slate-200 rounded-full px-6 py-2.5 font-bold hover:bg-slate-100 text-slate-600 transition-all"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleAddReview}
                                    disabled={reviewMsg.trim() === "" || rating === 0}
                                    className="text-white bg-[#08665F] hover:bg-[#08665F]/90 px-8 py-2.5 rounded-full font-bold shadow-md hover:scale-102 active:scale-98 transition-all"
                                >
                                    Submit Review
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderHowTo = () => {
        if (!howToParagraph) return null;
        return (
            <div className="text-left py-2">
                <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-medium whitespace-pre-line">
                    {howToParagraph}
                </p>
            </div>
        );
    };

    function openProductSmooth(productId) {
        try {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setTimeout(() => navigate(`/product/${productId}`), 220);
        } catch (e) {
            navigate(`/product/${productId}`);
        }
    }

    return (
        <>
        <ProductSchemaMarkup product={productDetails} />
        <div
            className="w-full mx-auto p-4 sm:p-6 mt-[40px] pb-12 container"
    
            style={{ fontSize: 'clamp(13px, 1.8vw, 16px)' }}
        >
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
             
                <div className="order-2 lg:order-2 w-full">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
                        {productDetails?.title}
                    </h1>
                    <p className="mt-2 text-xs sm:text-sm text-slate-600">
                        {productDetails?.subtitle ?? productDetails?.shortDescription}
                    </p>

                    <div className="mt-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                            <div className="text-xl sm:text-2xl font-extrabold text-slate-900">
                                {hasDiscount ? formatPrice(effectivePrice.salePrice) : formatPrice(effectivePrice.price)}
                            </div>
                            {hasDiscount && (
                                <div className="flex items-center gap-2">
                                    <div className="text-sm line-through text-slate-400">{formatPrice(effectivePrice.price)}</div>
                                    <div className="px-2 py-1 rounded-md bg-rose-50 text-rose-600 text-sm font-semibold">
                                        {percentSavedLabel}
                                    </div>
                                </div>
                            )}
                        </div>

                        {!canPurchase && (
                            <div className="mt-2 text-xs text-slate-500">
                                {purchaseDisabledLabel}
                            </div>
                        )}

                        <div className="mt-3 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <StarDisplay rating={averageReview} size={14} />
                                <div className="text-sm text-slate-500 ml-2">
                                    {averageReview ? averageReview.toFixed(1) : "—"} ({reviewCount})
                                </div>
                            </div>

                        </div>
                    </div>

                    <Separator className="my-4" />

                    {Array.isArray(productDetails?.variations) && productDetails.variations.length > 0 && (
                        <div className="mb-4">
                            <Label className="text-sm font-medium mb-2">Weight</Label>
                            <div className="flex flex-row flex-wrap gap-2">
                                {productDetails.variations.map((v, idx) => {
                                    const isSelected = selectedVariantIndex === idx;
                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                setSelectedVariantIndex(idx);
                                                setSelectedVariant(v);
                                            }}
                                            className={`px-4 py-2 rounded-lg border shadow-sm flex items-center justify-center transition-all ${isSelected ? "bg-amber-500 text-white border-amber-500 font-semibold" : "bg-white text-slate-700 hover:bg-slate-50 border-slate-200"}`}
                                            aria-pressed={isSelected}
                                        >
                                            <span className="text-sm truncate">{v.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className="mt-4 w-full">
                        <div className="flex flex-col gap-3">
                           
                            <div
                                role="group"
                                aria-label="Quantity selector"
                                className="inline-flex items-center gap-2 w-fit rounded-lg border border-slate-100 bg-white/60 backdrop-blur-sm px-2 py-1 shadow-md"
                            >
                                <button
                                    onClick={decrement}
                                    aria-label="Decrease quantity"
                                    className="flex items-center justify-center p-2 rounded-lg transition-transform transition-colors transform hover:scale-105 hover:bg-slate-100 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-1"
                                    title="Decrease"
                                >
                                    <Minus className="w-4 h-4 text-slate-700 transition-colors hover:text-slate-900" />
                                </button>

                                <input
                                    type="number"
                                    min="1"
                                    max="99"
                                    value={quantity}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val === "") {
                                            setQuantity("");
                                        } else {
                                            const num = parseInt(val, 10);
                                            if (!isNaN(num)) {
                                                setQuantity(Math.max(1, Math.min(99, num)));
                                            }
                                        }
                                    }}
                                    onBlur={() => {
                                        if (quantity === "" || isNaN(Number(quantity)) || Number(quantity) < 1) {
                                            setQuantity(1);
                                        } else {
                                            setQuantity(Math.min(99, Math.max(1, Math.round(Number(quantity)))));
                                        }
                                    }}
                                    className="w-12 text-center font-medium text-sm text-slate-800 bg-transparent focus:outline-none border-none py-0.5 focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    aria-label="Quantity"
                                />

                                <button
                                    onClick={increment}
                                    aria-label="Increase quantity"
                                    className="flex items-center justify-center p-2 rounded-lg transition-transform transition-colors transform hover:scale-105 hover:bg-slate-100 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-1"
                                    title="Increase"
                                >
                                    <Plus className="w-4 h-4 text-slate-700 transition-colors hover:text-slate-900" />
                                </button>
                            </div>


                            {!canPurchase ? (
                                <Button className="w-full block opacity-60 cursor-not-allowed" disabled>
                                    {purchaseDisabledLabel}
                                </Button>
                            ) : (
                                <div className="flex flex-col gap-2 w-full">
                                    <Button
                                        onClick={handleBuyNow}
                                        className="w-full block text-white font-medium shadow-md transition bg-amber-500 hover:bg-amber-600"
                                    >
                                        Buy Now
                                    </Button>

                                    <Button
                                        onClick={handleAddToCart}
                                        className="w-full block text-white font-medium shadow-md transition"
                                    >
                                        <ShoppingCart className="w-4 h-4 mr-2 inline-block" /> Add to Cart
                                    </Button>
                                </div>
                            )}
                        </div>

                        <ProductDescriptionBlock productDetails={productDetails} />
                    </div>

                    {selectedVariant && Array.isArray(selectedVariant.descriptionItems) && selectedVariant.descriptionItems.length > 0 && (
                        <div className="mt-4 space-y-3">
                            {selectedVariant.descriptionItems.map((di, i) => (
                                <div key={i}>
                                    {di.title ? <div className="font-semibold">{di.title}</div> : null}
                                    {di.content ? <div className="text-sm text-slate-700 mt-1 whitespace-pre-line">{di.content}</div> : null}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="order-1 lg:order-1 w-full">
                    <div className="relative rounded-xl overflow-hidden bg-white border w-full aspect-square">
                        <img
                            src={selectedImage || productDetails?.image}
                            alt={productDetails?.title}
                            className={`w-full h-full object-cover transition-transform duration-300 hover:scale-105 ${!canPurchase ? 'grayscale opacity-50' : ''}`}
                            style={{ objectPosition: "center", transition: "all 300ms ease" }}
                        />

                        {galleryImages.length > 1 && (
                            <>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        goPrevGalleryImage();
                                    }}
                                    className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-30 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-slate-200/90 bg-white/95 text-slate-800 shadow-md backdrop-blur-sm transition hover:bg-white hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-1"
                                    aria-label="Previous image"
                                    title="Previous image"
                                >
                                    <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.25} />
                                </button>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        goNextGalleryImage();
                                    }}
                                    className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-30 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-slate-200/90 bg-white/95 text-slate-800 shadow-md backdrop-blur-sm transition hover:bg-white hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-1"
                                    aria-label="Next image"
                                    title="Next image"
                                >
                                    <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.25} />
                                </button>
                            </>
                        )}

                        {!canPurchase && (
                            <div
                                aria-hidden="true"
                                className="absolute inset-0 pointer-events-none z-20"
                                style={{
                                    backgroundImage:
                                        "repeating-linear-gradient(135deg, rgba(255,255,255,0.12) 0 8px, rgba(255,255,255,0) 8px 16px)",
                                }}
                            />
                        )}

                        {!canPurchase && (
                            <div
                                aria-hidden="true"
                                className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none"
                            >
                                <div className="px-6 py-3 rounded-full bg-red-700 text-white text-lg md:text-2xl font-bold tracking-wide shadow-2xl transform -rotate-6">
                                    {purchaseDisabledLabel}
                                </div>
                            </div>
                        )}

                        <div className="absolute top-4 right-4 flex gap-2">
                            <button
                                onClick={handleShare}
                                className="p-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-sm hover:bg-white/20 hover:scale-105 transform transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-300"
                                aria-label="Share product"
                                title="Share product"
                            >
                                <Share2 className="w-4 h-4 text-white" />
                            </button>

                        </div>
                    </div>

                    <div className="mt-4 w-full">
                        <ThumbnailSlider
                            images={galleryImages}
                            selectedImage={selectedImage}
                            setSelectedImage={setSelectedImage}
                        />
                    </div>
                </div>
            </div>

            <div className="mt-8 bg-white rounded-2xl shadow-sm p-6 sm:p-8 w-full text-base sm:text-lg">
                
                <PremiumTabs
                    tabs={tabList}
                    activeKey={activeSection}
                    onChangeKey={setActiveSection}
                />

                <div className="mt-6">
                    {activeSection === 'specs' && Array.isArray(productDetails?.specList) && productDetails.specList.length > 0 && (
                        <div className="animate-fadeIn text-left">
                            <div className="space-y-6">
                                {productDetails.specList.map((s, i) => (
                                    <div key={i} className="border-b border-slate-100 pb-5 last:border-0 last:pb-0">
                                        <h4 className="text-base sm:text-lg font-extrabold text-slate-900 mb-2 leading-tight">
                                            {s.label}
                                        </h4>
                                        <p className="text-sm sm:text-base font-medium text-slate-600 leading-relaxed">
                                            {s.content || "—"}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeSection === 'ingredients' && productDetails?.ingredients && (
                        <div className="animate-fadeIn text-left">
                            <div className="space-y-3 py-1">
                                {(productDetails.ingredients.includes(",") 
                                    ? productDetails.ingredients.split(",")
                                    : productDetails.ingredients.split(/\r?\n/)
                                )
                                .map(ing => ing.trim())
                                .map(ing => ing.replace(/^(?:[◆●•*\-■▪▫◦])\s*/g, "").trim())
                                .filter(Boolean)
                                .map((item, idx) => (
                                    <div key={idx} className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2.5 shrink-0" />
                                        <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
                                            {item}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeSection === 'howTo' && howToParagraph && (
                        <div className="animate-fadeIn text-left">
                            {renderHowTo()}
                        </div>
                    )}
                </div>

                <>
                    <Separator className="my-8 bg-slate-100" />
                    <SectionTitle text="Reviews" />
                    {renderReviews()}
                </>
            </div>

            {relatedProducts && relatedProducts.length > 0 && (
                <div className="mt-8">
                    <SectionTitle text="Related products" />

                    <div className="flex flex-wrap justify-center gap-3">
                        {relatedProducts.map((r) => (
                            <div key={r._id} className="w-[calc(50%-6px)] sm:w-[calc(33.333%-8px)] md:w-[calc(25%-9px)]">
                                <ShoppingProductTile
                                    product={r}
                                    handleGetProductDetails={() => {
                                        navigate(`/product/${r._id}`);
                                    }}
                                    handleAddtoCart={(id, qty, prodObj) => {
                                        addProductToCart({
                                            dispatch,
                                            user,
                                            navigate,
                                            productId: id,
                                            quantity: qty,
                                            productObj: prodObj,
                                            fromPath: `/product/${r._id}`,
                                        }).then((data) => {
                                            if (data?.redirectedToLogin) return;
                                            if (data?.payload?.success) {
                                                toast({ title: "Added to cart" });
                                            }
                                        });
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
        </>
    );
}
