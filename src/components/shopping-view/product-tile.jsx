import React, { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardFooter } from "../ui/card";
import BuyNowButton from "../ui/AddToCartButton";
import { Badge } from "../ui/badge";
import { Eye, Star as StarIcon } from "lucide-react";

function parseNumericFromLabel(label) {
  if (!label) return Number.POSITIVE_INFINITY;
  const m = String(label).match(/(\d+(\.\d+)?)/);
  if (!m) return Number.POSITIVE_INFINITY;
  return parseFloat(m[1]);
}
function chooseDefaultVariant(variations = []) {
  if (!Array.isArray(variations) || variations.length === 0) return null;
  const explicit = variations.find((v) => v.isDefault);
  if (explicit) return explicit;
  let smallest = variations[0];
  let smallestNum = parseNumericFromLabel(variations[0].label);
  for (let i = 1; i < variations.length; i++) {
    const num = parseNumericFromLabel(variations[i].label);
    if (num < smallestNum) {
      smallestNum = num;
      smallest = variations[i];
    }
  }
  return smallest;
}

export default function ShoppingProductTile({
  product = {},
  handleGetProductDetails = () => {},
  handleAddtoCart = () => {},
}) {
  const defaultVariant = useMemo(() => chooseDefaultVariant(product?.variations || []), [product]);
  const [selectedVariant, setSelectedVariant] = useState(defaultVariant);

  useEffect(() => {
    const def = chooseDefaultVariant(product?.variations || []);
    setSelectedVariant(def);
  }, [product]);

  const price = Number(product?.price ?? 0);
  const salePrice = Number(product?.salePrice ?? 0);

  const effective = useMemo(() => {
    if (selectedVariant) {
      return {
        price: Number(selectedVariant.price || 0),
        salePrice: Number(selectedVariant.salePrice || 0),
      };
    }
    return {
      price,
      salePrice,
    };
  }, [selectedVariant, price, salePrice]);

  const displayPrice = effective.salePrice > 0 ? effective.salePrice : effective.price;

  const showOriginalStrike = effective.salePrice > 0 && effective.price > effective.salePrice;

  const formatINR = (value) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(Number(value || 0));


  const isProductAvailable = product?.isAvailable !== false;
  const canPurchase = isProductAvailable;
  const disabledLabel = "Unavailable";

  const reviewCount =
    product?.reviewCount ?? (Array.isArray(product?.reviews) ? product.reviews.length : 0);

  const averageReview = useMemo(() => {
    if (Array.isArray(product?.reviews) && product.reviews.length > 0) {
      const sum = product.reviews.reduce((acc, r) => acc + (Number(r.reviewValue) || 0), 0);
      return sum / product.reviews.length;
    }
    return Number(product?.averageRating ?? product?.rating ?? 0);
  }, [product]);

  const discountPercent = (() => {
    const p = Number(effective.price || 0);
    const s = Number(effective.salePrice || 0);
    if (p > 0 && s > 0 && p > s) {
      return Math.round(((p - s) / p) * 100);
    }
    return 0;
  })();

  const StarDisplay = ({ rating = 0, size = 12 }) => {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full h-full flex flex-col"
    >
      <Card className="relative overflow-hidden rounded-lg md:rounded-2xl border bg-gradient-to-b from-white/60 to-white/30 backdrop-blur-md h-full w-full flex flex-col justify-between">
        <div
          role="button"
          tabIndex={0}
          onClick={() => handleGetProductDetails(product?._id)}
          onKeyDown={(e) => e.key === "Enter" && handleGetProductDetails(product?._id)}
          className="relative cursor-pointer"
        >

          <div className="w-full overflow-hidden rounded-t-md md:rounded-t-2xl relative">
            <div className="aspect-square w-full overflow-hidden bg-white">
              <img
                src={product?.image}
                alt={product?.title}
                className="w-full h-full object-cover transition-all duration-300 ease-in-out md:hover:scale-105"
                loading="lazy"
                style={{
                 
                  filter: !canPurchase ? "grayscale(100%) brightness(0.85) contrast(0.95)" : undefined,
                  transition: "all 300ms ease",
                }}
              />
            </div>

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
                <div className="px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-red-700 text-white text-sm sm:text-lg font-bold tracking-wide shadow-lg transform -rotate-6">
                  {disabledLabel}
                </div>
              </div>
            )}
          </div>


          <div className="absolute right-3 top-3 flex flex-col gap-2 z-40">
            <button
              aria-label="Quick view"
              onClick={(e) => {
                e.stopPropagation();
                handleGetProductDetails(product?._id);
              }}
              className="hidden sm:inline-flex p-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-sm hover:bg-white/20 hover:scale-105 transform transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-300"
              title="Quick view"
            >
              <Eye className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        <CardContent className="p-3 pt-2 flex-grow flex flex-col justify-between gap-2">
          <div>
            <h3 className="text-xs sm:text-sm md:text-base font-bold text-slate-900 leading-tight line-clamp-2 hover:text-amber-600 transition-colors">
              {product?.title}
            </h3>

            {(product?.shortDescription || product?.subtitle) && (
              <p className="mt-1 text-[11px] sm:text-xs text-slate-500 line-clamp-1 leading-normal">
                {product?.shortDescription || product?.subtitle}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 mt-auto pt-2 border-t border-slate-100/60">
            {/* Price block */}
            <div className="flex flex-col items-start justify-center">
              {showOriginalStrike && (
                <div className="flex items-center gap-1.5 mb-1 leading-none">
                  <span className="text-[10px] sm:text-xs text-slate-400 line-through">
                    {formatINR(effective.price)}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 text-[9px] sm:text-[10px] font-bold">
                    {discountPercent}% OFF
                  </span>
                </div>
              )}
              <span className="text-sm sm:text-base md:text-lg font-extrabold text-[#08665F] leading-none">
                {formatINR(displayPrice)}
              </span>
            </div>

            {/* Weight variation selector */}
            {product?.variations?.length > 0 && (
              <div className="flex gap-1.5 flex-wrap justify-end">
                {product.variations.slice(0, 2).map((v, idx) => {
                  const isActive = selectedVariant?.label === v.label;
                  return (
                    <button
                      key={idx}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedVariant(v);
                      }}
                      className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium transition-all duration-150 focus:outline-none ${isActive
                        ? "bg-amber-500 text-white shadow-sm font-semibold"
                        : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
                      }`}
                      title={v.label}
                    >
                      {v.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="p-3">
          <div className="w-full">
            {canPurchase ? (
              <BuyNowButton
                label="Add to cart"
                showIcon={true}
                fullWidth
                disabled={false}
                onClick={(e) => {
                  e.stopPropagation();
        
                  handleAddtoCart(product?._id, 1, {
                    ...product,
                    selectedVariant: selectedVariant || null,
                    price: effective.price,
                    salePrice: effective.salePrice,
                  });
                }}
                className="w-full text-sm"
              />
            ) : (
        
              <button
                type="button"
                className="w-full px-3 py-2 rounded-lg text-sm font-medium transition-opacity duration-300 opacity-60 cursor-not-allowed bg-gray-200 text-gray-600"
                aria-disabled="true"
                onClick={(e) => e.stopPropagation()} 
                title={disabledLabel}
                disabled
              >
                {disabledLabel}
              </button>
            )}
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
