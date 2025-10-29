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

  // keep selectedVariant in sync when product prop changes (fixes stale/default state)
  useEffect(() => {
    const def = chooseDefaultVariant(product?.variations || []);
    setSelectedVariant(def);
  }, [product]);

  const price = Number(product?.price ?? 0);
  const salePrice = Number(product?.salePrice ?? 0);

  // compute effective prices based on selectedVariant (if exists) else top-level
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
  // show strike only if salePrice is present AND it's actually lower than price
  const showOriginalStrike = effective.salePrice > 0 && effective.price > effective.salePrice;

  const formatINR = (value) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(Number(value || 0));

  // STOCK: Prefer per-variant stock. If product has NO variations (legacy), fallback to product.totalStock.
  const productHasVariations = Array.isArray(product?.variations) && product.variations.length > 0;
  const availableStockForActions = selectedVariant
    ? Number(selectedVariant.totalStock || 0)
    : productHasVariations
    ? 0
    : Number(product?.totalStock || 0);

  // Updated low stock threshold: <= 5
  const inStock = availableStockForActions > 0;
  const lowStock = inStock && availableStockForActions <= 5;

  // REVIEW: keep logic consistent with ProductDetailsPage
  const reviewCount =
    product?.reviewCount ?? (Array.isArray(product?.reviews) ? product.reviews.length : 0);

  const averageReview = useMemo(() => {
    if (Array.isArray(product?.reviews) && product.reviews.length > 0) {
      const sum = product.reviews.reduce((acc, r) => acc + (Number(r.reviewValue) || 0), 0);
      return sum / product.reviews.length;
    }
    return Number(product?.averageRating ?? product?.rating ?? 0);
  }, [product]);

  // compute discount percent for sale badge (rounded)
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
      className="w-full"
    >
      {/* NOTE: smaller border-radius on mobile (rounded-lg), larger from md upwards (md:rounded-2xl) */}
      <Card className="relative overflow-hidden rounded-lg md:rounded-2xl border bg-gradient-to-b from-white/60 to-white/30 backdrop-blur-md">
        {/* Image + overlay */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => handleGetProductDetails(product?._id)}
          onKeyDown={(e) => e.key === "Enter" && handleGetProductDetails(product?._id)}
          className="relative cursor-pointer"
        >
          {/* ALWAYS 1:1 square aspect */}
          <div className="w-full overflow-hidden rounded-t-md md:rounded-t-2xl relative">
            <div className="aspect-square w-full overflow-hidden">
              <img
                src={product?.image}
                alt={product?.title}
                className="w-full h-full object-cover transition-all duration-300 ease-in-out hover:scale-105"
                loading="lazy"
                style={{
                  // make image fully colorless when out-of-stock
                  filter: !inStock ? "grayscale(100%) brightness(0.85) contrast(0.95)" : undefined,
                  transition: "all 300ms ease",
                }}
              />
            </div>

            {/* OUT OF STOCK: diagonal hashed overlay WITHOUT tinting the image colors. */}
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

            {/* OUT OF STOCK CENTER LABEL (larger, prominent) */}
            {!inStock && (
              <div
                aria-hidden="true"
                className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none"
              >
                <div className="px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-red-700 text-white text-sm sm:text-lg font-bold tracking-wide shadow-lg transform -rotate-6">
                  Out of stock
                </div>
              </div>
            )}
          </div>

          {/* Badges (inline row) - bring above overlay */}
          {/* MOBILE: top-2 left-2 and smaller gap; SM+: top-3 left-3 and regular gap */}
          <div className="absolute top-2 left-2 flex items-center gap-1 sm:gap-2 sm:top-3 sm:left-3 z-40">
            {inStock && (
              <>
                {/* Responsive discount badge:
                    - text size and padding scale across breakpoints
                    - gap & internal font sizes adjust as well */}
                {discountPercent > 0 ? (
                  <Badge
                    className={
                      "flex items-center gap-1 rounded-full " +
                      // padding: smaller on mobile, larger on md+
                      "px-2 py-[2px] text-[10px] sm:px-2 sm:py-0.5 sm:text-[11px] md:px-3 md:py-1 md:text-xs " +
                      // background + text color
                      "bg-red-600 text-white"
                    }
                  >
                    {/* small star left */}
                    <span className="select-none text-[10px] sm:text-[11px] md:text-xs">★</span>
                    <span className="font-semibold text-[10px] sm:text-[11px] md:text-xs">-{discountPercent}%</span>
                  </Badge>
                ) : null}

                {/* low-stock badge responsive sizing */}
                {lowStock ? (
                  <Badge
                    className={
                      "rounded-full " +
                      "px-2 py-[2px] text-[10px] sm:px-2 sm:py-0.5 sm:text-[11px] md:px-3 md:py-1 md:text-xs " +
                      "bg-amber-600 text-black"
                    }
                  >
                    <span className="text-[10px] sm:text-[11px] md:text-xs">Only {availableStockForActions} left</span>
                  </Badge>
                ) : null}
              </>
            )}
          </div>

          {/* Quick action icons (hidden on mobile, visible from 'sm' upward) */}
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

        <CardContent className="p-3 pt-2">
          <h3 className="text-xs sm:text-sm md:text-base font-semibold leading-tight line-clamp-2">{product?.title}</h3>

          <p className="mt-1 text-[11px] sm:text-xs text-muted-foreground line-clamp-2">{product?.shortDescription || product?.subtitle}</p>

          {/* Quick variant mini-selector (if variations exist) */}
          {product?.variations?.length > 0 && (
            <div className="mt-2 flex gap-2">
              {product.variations.slice(0, 3).map((v, idx) => {
                const isActive = selectedVariant?.label === v.label;
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedVariant(v)}
                    className={`px-2 py-1 rounded-md text-xs transition-all duration-150 focus:outline-none ${isActive
                      ? "bg-amber-600 text-white ring-1 ring-amber-300 shadow-sm"
                      : "bg-white text-gray-700 border border-gray-200 shadow-sm hover:shadow-md"
                    }`}
                    title={v.label}
                  >
                    {v.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* PRICE ROW
              - Mobile: price left-aligned
              - Desktop (md+): price right-aligned (preserve original feel)
              - Rate font size increases at md and lg breakpoints */}
          <div className="mt-3 flex items-center justify-start md:justify-between">
            <div /> {/* left intentionally empty (category removed) */}
            <div className="flex items-baseline gap-2">
              {showOriginalStrike ? (
                <>
                  <span className="text-[10px] md:text-sm text-muted-foreground line-through">{formatINR(effective.price)}</span>
                  <span className="text-sm md:text-lg lg:text-xl font-semibold text-primary">{formatINR(displayPrice)}</span>
                </>
              ) : (
                <span className="text-sm md:text-lg lg:text-xl font-medium text-primary">{formatINR(displayPrice)}</span>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-3">
          <div className="w-full">
            {inStock ? (
              <BuyNowButton
                label="Add to cart"
                showIcon={true}
                fullWidth
                disabled={false}
                onClick={(e) => {
                  e.stopPropagation();
                  // pass product object + selectedVariant and explicit effective price values
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
              // Faded disabled fallback so button stays visible but not clickable
              <button
                type="button"
                className="w-full px-3 py-2 rounded-lg text-sm font-medium transition-opacity duration-300 opacity-60 cursor-not-allowed bg-gray-200 text-gray-600"
                aria-disabled="true"
                onClick={(e) => e.stopPropagation()} // prevent parent click but do nothing
                title="Out of stock"
                disabled
              >
                Out of stock
              </button>
            )}
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
