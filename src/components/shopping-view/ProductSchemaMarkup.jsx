import React, { useMemo } from "react";
import { Helmet } from "react-helmet-async";

const SITE_ORIGIN = "https://aachiammafoods.com";

function getProductImages(product) {
  const fromArray = Array.isArray(product?.images)
    ? product.images.filter(Boolean)
    : [];
  if (fromArray.length > 0) return fromArray;
  if (product?.image) return [product.image];
  return [];
}

function getProductDescription(product) {
  const short = String(product?.shortDescription || "").trim();
  if (short) return short;
  const long = String(product?.description || "").trim();
  if (!long) return "";
  return long.length > 5000 ? `${long.slice(0, 4997)}...` : long;
}

function buildProductSchema(product) {
  const productUrl = `${SITE_ORIGIN}/product/${product._id}`;

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    url: productUrl,
    image: getProductImages(product),
    description: getProductDescription(product),
    brand: {
      "@type": "Brand",
      name: String(product.brand || "").trim() || "Aachiammafoods",
    },
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "INR",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  if (product.category) {
    schema.category = product.category;
  }

  return schema;
}

export default function ProductSchemaMarkup({ product }) {
  const schemaJson = useMemo(() => {
    if (!product?._id || !product?.title) return null;
    const images = getProductImages(product);
    if (images.length === 0) return null;
    return JSON.stringify(buildProductSchema(product));
  }, [product]);

  if (!schemaJson) return null;

  return (
    <Helmet>
      <script type="application/ld+json">{schemaJson}</script>
    </Helmet>
  );
}
