import React, { useMemo } from "react";
import { Helmet } from "react-helmet-async";

const SITE_ORIGIN = "https://aachiammafoods.com";

function getProductImages(product) {
  const fromArray = Array.isArray(product?.images)
    ? product.images.filter(Boolean)
    : [];
  if (fromArray.length > 0) return [fromArray[0]];
  if (product?.image) return [product.image];
  return [];
}

function getProductDescription(product) {
  const sections = Array.isArray(product?.descriptionSections)
    ? product.descriptionSections
    : [];
  if (sections.length > 0) {
    const fromSections = sections
      .map((sec) => {
        const title = String(sec?.title || "").trim();
        const content = String(sec?.content || "").trim();
        return [title, content].filter(Boolean).join("\n");
      })
      .filter(Boolean)
      .join("\n\n")
      .trim();
    if (fromSections) {
      return fromSections.length > 5000 ? `${fromSections.slice(0, 4997)}...` : fromSections;
    }
  }

  const long = String(product?.description || "").trim();
  if (long) return long.length > 5000 ? `${long.slice(0, 4997)}...` : long;

  const short = String(product?.shortDescription || "").trim();
  if (short) return short.length > 5000 ? `${short.slice(0, 4997)}...` : short;

  return "";
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
      price: product.salePrice && Number(product.salePrice) > 0 ? Number(product.salePrice) : Number(product.price || 0),
      availability: product.isAvailable !== false ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
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
