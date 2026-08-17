import React from "react";
import { Helmet } from "react-helmet-async";

const DEFAULTS = {
  title: "Kerala Homemade Pickles, Snacks & Spices | Aachiammafoods",
  description:
    "Kerala homemade pickles, snacks & spices from Aachiammafoods. Taste the traditional foods made without preservatives. Order online.",
  author: "Aachiammafoods",
  viewport: "width=device-width, initial-scale=1",
  canonical: "https://aachiammafoods.com/",
  og: {
    title: "Kerala Homemade Pickles, Snacks & Spices | Aachiammafoods",
    description:
      "Kerala homemade pickles, snacks & spices from Aachiammafoods. Taste the traditional foods made without preservatives. Order online.",
    url: "https://aachiammafoods.com/",
    image: "https://aachiammafoods.com/wp-content/uploads/2025/07/LOGO-FINAL.png",
    siteName: "Aachiammafoods",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kerala Homemade Pickles, Snacks & Spices | Aachiammafoods",
    description:"Kerala homemade pickles, snacks & spices from Aachiammafoods. Taste the traditional foods made without preservatives. Order online.",
    image: "https://aachiammafoods.com/wp-content/uploads/2025/07/LOGO-FINAL.png",
    site: "@aachiammafoods",
    creator: "@aachiammafoods",
  },
};

export default function SEO({
  title = DEFAULTS.title,
  description = DEFAULTS.description,
  keywords,
  robots = DEFAULTS.robots,
  author = DEFAULTS.author,
  viewport = DEFAULTS.viewport,
  canonical = DEFAULTS.canonical,
  ogTitle = DEFAULTS.og.title,
  ogDescription = DEFAULTS.og.description,
  ogUrl = DEFAULTS.og.url,
  ogImage = DEFAULTS.og.image,
  ogSiteName = DEFAULTS.og.siteName,
  ogLocale = DEFAULTS.og.locale,
  ogType = DEFAULTS.og.type,
  twitterCard = DEFAULTS.twitter.card,
  twitterTitle = DEFAULTS.twitter.title,
  twitterDescription = DEFAULTS.twitter.description,
  twitterImage = DEFAULTS.twitter.image,
  twitterSite = DEFAULTS.twitter.site,
  twitterCreator = DEFAULTS.twitter.creator,
}) {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {Array.isArray(keywords) && keywords.length > 0 ? (
        <meta name="keywords" content={keywords.join(", ")} />
      ) : typeof keywords === "string" && keywords.trim() ? (
        <meta name="keywords" content={keywords} />
      ) : null}
      <meta name="robots" content={robots} />
      <meta name="author" content={author} />
      <meta name="viewport" content={viewport} />

      <link rel="canonical" href={canonical} />

      <meta property="og:title" content={ogTitle} />
      <meta property="og:description" content={ogDescription} />
      <meta property="og:url" content={ogUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={ogSiteName} />
      <meta property="og:locale" content={ogLocale} />
      <meta property="og:type" content={ogType} />

      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={twitterTitle} />
      <meta name="twitter:description" content={twitterDescription} />
      <meta name="twitter:image" content={twitterImage} />
      <meta name="twitter:site" content={twitterSite} />
      <meta name="twitter:creator" content={twitterCreator} />
    </Helmet>
  );
}

