import axios from "axios";
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
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import StarRatingComponent from "@/components/common/star-rating";

import { useDispatch, useSelector } from "react-redux";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { useToast } from "@/components/ui/use-toast";
import { setProductDetails, updateProductInList } from "@/store/shop/products-slice";
import { addReview, getReviews } from "@/store/shop/review-slice";
import ShoppingProductTile from "@/components/shopping-view/product-tile";

const ACCENT = "#08665F";

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

    const { user } = useSelector((state) => state.auth || {});
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

    useEffect(() => {
        let mounted = true;
        async function load() {
            try {
                setLoading(true);
                const base = (axios.defaults?.baseURL || "").replace(/\/+$/, "");
                const baseEndsWithApi = base.toLowerCase().endsWith("/api");
                const path = baseEndsWithApi ? `/shop/products/get/${id}` : `/api/shop/products/get/${id}`;

                const res = await axios.get(path);
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
                            const relPath = baseEndsWithApi ? `/shop/products/get?category=${category}` : `/api/shop/products/get?category=${category}`;
                            const resp = await axios.get(relPath);
                            let items = resp?.data?.data ?? resp?.data ?? [];
                            if (!Array.isArray(items)) items = [];
                            items = items.filter((p) => p?._id !== pd?._id);
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

    const productLevelStock = Number(productDetails?.totalStock ?? 0);
    const selectedVariantStock = selectedVariant ? Number(selectedVariant.totalStock || 0) : null;

    const availableStockForActions = (() => {
        if (selectedVariant !== null) return selectedVariantStock;
        const vs = Array.isArray(productDetails?.variations) ? productDetails.variations : [];
        if (!vs.length) return productLevelStock;
        return 0;
    })();

    const hasDiscount = effectivePrice.salePrice > 0 && effectivePrice.price > 0 && effectivePrice.salePrice < effectivePrice.price;
    const discountPercent = hasDiscount
        ? Math.round(((effectivePrice.price - effectivePrice.salePrice) / effectivePrice.price) * 100)
        : 0;

    const inStock = (availableStockForActions || 0) > 0;
    const lowStock = inStock && (availableStockForActions || 0) <= 5;

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
        const max = availableStockForActions || 99;
        setQuantity((q) => Math.min(max, q + 1));
    };
    const decrement = () => setQuantity((q) => Math.max(1, q - 1));

    function handleAddToCart() {
        if (!productDetails) return;
        const maxStock = availableStockForActions ?? 0;
        const getCartItems = (cartItems && cartItems.items) || [];
  
        const existingIndex = getCartItems.findIndex(
            (item) =>
                item.productId === productDetails?._id &&
                variantEqual(item.selectedVariant, selectedVariant)
        );
        const existingQty = existingIndex > -1 ? getCartItems[existingIndex].quantity : 0;
        if (existingQty + quantity > maxStock) {
            toast({
                title: `Only ${Math.max(0, maxStock - existingQty)} more units can be added for this item`,
                variant: "destructive",
            });
            return;
        }

        const productForCart = {
            ...productDetails,
            price: effectivePrice.price,
            salePrice: effectivePrice.salePrice,
            selectedVariant: selectedVariant ? { ...selectedVariant } : null,
        };

        dispatch(
            addToCart({
                userId: user?.id,
                productId: productDetails?._id,
                quantity,
                productObj: productForCart,
            })
        ).then((data) => {
            const payload = data?.payload;
            if (payload?.success || payload?.data) {
                dispatch(fetchCartItems(user?.id));
                toast({ title: "Added to cart" });
            } else {
                toast({ title: payload?.message || "Failed to add", variant: "destructive" });
            }
        });
    }

    function handleBuyNow() {
        if (!productDetails) return;
        const stockAvailable = availableStockForActions ?? 0;
        if (stockAvailable === 0) {
            toast({ title: "Product out of stock", variant: "destructive" });
            return;
        }
        if (quantity > stockAvailable) {
            toast({ title: "Requested quantity exceeds available stock", variant: "destructive" });
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
        navigate("/shop/checkout", { state: { buyNow: true, items: [buyNowItem] } });
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
        const url = `${window.location.origin}/shop/product/${productDetails?._id}`;
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
        { key: 'howto', label: 'How to use' },
        { key: 'reviews', label: 'Reviews' },
    ];

    function openProductSmooth(productId) {
        try {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setTimeout(() => navigate(`/shop/product/${productId}`), 220);
        } catch (e) {
            navigate(`/shop/product/${productId}`);
        }
    }

    return (
        <div
            className="w-full mx-auto p-4 sm:p-6 mt-[40px] pb-12 container"
    
            style={{ fontSize: 'clamp(13px, 1.8vw, 16px)' }}
        >
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
             
                <div className="order-1 lg:order-2 w-full">
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

                        <div className="mt-2 text-xs text-slate-500">
                            {inStock ? (lowStock ? `Only ${availableStockForActions} left` : `${availableStockForActions} in stock`) : "Out of stock"}
                        </div>

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
                            <Label className="text-sm font-medium mb-2">Select weight</Label>
                            <div className="flex flex-col sm:flex-row gap-2">
                                {productDetails.variations.map((v, idx) => {
                                    const isSelected = selectedVariantIndex === idx;
                                    const displayPrice = (v.salePrice && Number(v.salePrice) > 0) ? v.salePrice : v.price;
                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                setSelectedVariantIndex(idx);
                                                setSelectedVariant(v);
                                            }}
                                            className={`flex-1 sm:flex-none px-3 py-2 rounded-lg border shadow-sm flex items-center gap-3 min-w-0 ${isSelected ? "bg-amber-500 text-white border-amber-500" : "bg-white text-slate-700 hover:bg-slate-50"}`}
                                            aria-pressed={isSelected}
                                        >
                                            <div className="flex items-center gap-2 truncate">
                                                <div className={`w-4 h-4 rounded-full border ${isSelected ? "bg-white" : "bg-transparent"}`} aria-hidden />
                                                <div className="text-sm font-medium truncate">{v.label}</div>
                                            </div>
                                            <div className="text-sm ml-2 truncate">{displayPrice ? formatPrice(displayPrice) : "—"}</div>
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

                                <div
                                    className="px-3 font-medium text-sm min-w-[2.25rem] text-center text-slate-800"
                                    aria-live="polite"
                                    aria-atomic="true"
                                >
                                    {quantity}
                                </div>

                                <button
                                    onClick={increment}
                                    aria-label="Increase quantity"
                                    className="flex items-center justify-center p-2 rounded-lg transition-transform transition-colors transform hover:scale-105 hover:bg-slate-100 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-1"
                                    title="Increase"
                                >
                                    <Plus className="w-4 h-4 text-slate-700 transition-colors hover:text-slate-900" />
                                </button>
                            </div>


                            {availableStockForActions === 0 ? (
                                <Button className="w-full block opacity-60 cursor-not-allowed" disabled>
                                    Out of Stock
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

                <div className="order-2 lg:order-1 w-full">
                    <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-white to-slate-50 border w-full">
                        <img
                            src={selectedImage || productDetails?.image}
                            alt={productDetails?.title}
                            className={`w-full h-auto object-cover transition-transform duration-300 hover:scale-105 ${!inStock ? 'grayscale opacity-50' : ''}`}
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

                        {!inStock && (
                            <div
                                aria-hidden="true"
                                className="absolute inset-0 pointer-events-none z-20"
                                style={{
                                    backgroundImage:
                                        "repeating-linear-gradient(135deg, rgba(255,255,255,0.12) 0 8px, rgba(255,255,255,0) 8px 16px)",
                                }}
                            />
                        )}

                        {!inStock && (
                            <div
                                aria-hidden="true"
                                className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none"
                            >
                                <div className="px-6 py-3 rounded-full bg-red-700 text-white text-lg md:text-2xl font-bold tracking-wide shadow-2xl transform -rotate-6">
                                    Out of stock
                                </div>
                            </div>
                        )}

                        <div className="absolute top-4 left-4 flex items-center gap-2 z-40">
                            {inStock && (
                                <>
                              
                                    {discountPercent > 0 ? (
                                        <div className="px-3 py-1 rounded-full bg-red-600 text-white text-xs font-semibold shadow">
                                            -{discountPercent}%
                                        </div>
                                    ) : null}

                                    {lowStock ? (
                                        <div className="px-3 py-1 rounded-full bg-amber-600 text-black text-xs font-semibold shadow">
                                            Only {availableStockForActions} left
                                        </div>
                                    ) : null}

                                    {discountPercent === 0 && !lowStock ? (
                                        <div className="px-3 py-1 rounded-full bg-white/80 text-slate-700 text-xs font-semibold shadow">
                                            {productDetails?.category || "Product"}
                                        </div>
                                    ) : null}
                                </>
                            )}
                        </div>

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

            <div className="mt-8 flex justify-center">
                <div className="w-full lg:w-[70%]">
                    
                    <PremiumTabs
                        tabs={tabList}
                        activeKey={activeSection}
                        onChangeKey={setActiveSection}
                    />

                  
                    <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 mt-4 text-base sm:text-lg">
                       
                        {activeSection === 'specs' && Array.isArray(productDetails?.specList) && productDetails.specList.length > 0 && (
                            <div>
                                <div className="text-xl sm:text-2xl font-bold mb-4 text-slate-900">Product Specifications</div>
                                <ul className="list-disc pl-6 sm:pl-7 text-base sm:text-lg text-slate-700 space-y-2">
                                    {productDetails.specList.map((s, i) => (
                                        <li key={i}><span className="font-semibold text-slate-900">{s.label}</span>{s.content ? `: ${s.content}` : ""}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {activeSection === 'ingredients' && productDetails?.ingredients && (
                            <div>
                                <div className="text-xl sm:text-2xl font-bold mb-4 text-slate-900">Ingredients Details</div>
                                <div className="text-base sm:text-lg text-slate-700 whitespace-pre-line leading-relaxed">{productDetails.ingredients}</div>
                            </div>
                        )}

                        {activeSection === 'howto' && howToParagraph && (
                            <div>
                                <div className="text-xl sm:text-2xl font-bold mb-4 text-slate-900">How to use</div>
                                <div className="text-base sm:text-lg text-slate-700 whitespace-pre-line leading-relaxed">{howToParagraph}</div>
                            </div>
                        )}

                        {activeSection === 'reviews' && (
                            <div id="product-reviews-section" className="space-y-8">
                          
                                <div>
                                    <Label className="mb-3 text-lg sm:text-xl font-semibold text-slate-900">Write a review</Label>
                                    <div className="flex items-center gap-3 mb-4">
                                        <StarRatingComponent rating={rating} handleRatingChange={(val) => setRating(val)} />
                                        <span className="text-base sm:text-lg text-slate-500">{rating ? `${rating}/5` : "Choose rating"}</span>
                                    </div>

                                    <Input
                                        value={reviewMsg}
                                        onChange={(e) => setReviewMsg(e.target.value)}
                                        placeholder="Share your experience..."
                                        className="text-base sm:text-lg min-h-[48px]"
                                    />
                                    <div className="mt-3 flex gap-3">
                                        <Button
                                            onClick={handleAddReview}
                                            disabled={reviewMsg.trim() === "" || rating === 0}
                                            className="text-white"
                                        >
                                            Submit
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            onClick={() => {
                                                setRating(0);
                                                setReviewMsg("");
                                            }}
                                            className="border"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between gap-4 flex-wrap">
                                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Reviews</h2>
                                    <div className="flex items-center gap-3">
                                        <StarDisplay rating={averageReview} size={18} />
                                        <div className="text-base sm:text-lg text-slate-500">{averageReview ? averageReview.toFixed(1) : "—"} ({reviewCount})</div>
                                    </div>
                                </div>

                                <div className="space-y-5">
                                    {reviews && reviews.length > 0 ? (
                                        reviews.map((reviewItem, idx) => (
                                            <div key={reviewItem._id || idx} className="flex gap-4 p-4 sm:p-5 rounded-lg border border-slate-100 bg-white">
                                                <Avatar className="w-12 h-12 border shrink-0">
                                                    <AvatarFallback className="text-base">{(reviewItem?.userName?.[0] || "U").toUpperCase()}</AvatarFallback>
                                                </Avatar>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-3">
                                                        <div>
                                                            <h3 className="font-semibold text-lg sm:text-xl text-slate-900">{reviewItem?.userName}</h3>
                                                            <div className="text-sm sm:text-base text-slate-500 mt-0.5">{new Date(reviewItem?.createdAt || reviewItem?.date || Date.now()).toLocaleDateString()}</div>
                                                        </div>
                                                        <div className="flex items-center gap-1 shrink-0">
                                                            <StarDisplay rating={reviewItem?.reviewValue} size={14} />
                                                        </div>
                                                    </div>
                                                    <p className="mt-3 text-base sm:text-lg text-slate-600 leading-relaxed">{reviewItem?.reviewMessage || reviewItem?.reviewText}</p>

                                                    {reviewItem?.adminReply?.text ? (
                                                        <div className="mt-4 ml-0 sm:ml-10 p-4 rounded bg-slate-50 border-l-2 border-slate-200">
                                                            <div className="text-base font-semibold text-slate-800">Admin reply</div>
                                                            <div className="text-base sm:text-lg text-slate-700 mt-2 leading-relaxed">{reviewItem.adminReply.text}</div>
                                                            <div className="text-sm text-slate-500 mt-2">Replied on: {reviewItem.adminReply?.repliedAt ? new Date(reviewItem.adminReply.repliedAt).toLocaleDateString() : ''}</div>
                                                        </div>
                                                    ) : null}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-base sm:text-lg text-slate-500">No reviews yet.</p>
                                    )}

                                </div>

                            </div>
                        )}
                    </div>
                </div>
            </div>

            {relatedProducts && relatedProducts.length > 0 && (
                <div className="mt-8">
                    <SectionTitle text="Related products" />

                    <div className="sm:hidden -mx-4 px-4">
                        <div className="flex gap-3 overflow-x-auto touch-pan-x py-2">
                            {relatedProducts.map((r) => (
                                <div key={r._id} className="shrink-0 w-[220px]">
                                    <ShoppingProductTile
                                        product={r}
                                        handleGetProductDetails={() => {
                                            navigate(`/shop/product/${r._id}`);
                                        }}
                                        handleAddtoCart={(id, qty, prodObj) => {
                                            dispatch(
                                                addToCart({ userId: user?.id, productId: id, quantity: qty, productObj: prodObj })
                                            ).then(() => dispatch(fetchCartItems(user?.id)));
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="hidden sm:block">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {relatedProducts.map((r) => (
                                <div key={r._id}>
                                    <ShoppingProductTile
                                        product={r}
                                        handleGetProductDetails={() => {
                                            navigate(`/shop/product/${r._id}`);
                                        }}
                                        handleAddtoCart={(id, qty, prodObj) => {
                                            dispatch(
                                                addToCart({ userId: user?.id, productId: id, quantity: qty, productObj: prodObj })
                                            ).then(() => dispatch(fetchCartItems(user?.id)));
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
