// client/src/components/layouts/Footer.jsx
import React, { useEffect, useState } from "react";
import { ArrowUp, Facebook, Instagram, Phone, MessageCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "@/api/axios";
import Logo from "../assets/logo-1.png";

/**
 * Updated: when clicking a shop category link we set sessionStorage "filters"
 * to { category: [<category>] } so the listing page will restore that filter
 * and check the corresponding checkbox. This change is limited to this file only.
 *
 * Extra update: clicking the "Blog" link now shows a premium "Coming soon"
 * alert/modal (accessible). Navigation is prevented so we can show the alert
 * immediately. To enable navigation after acknowledging the alert, see the
 * `navigateToAfterClose` option in the code.
 *
 * Also: internal links now use navigateTo(...) which ensures the destination
 * page is scrolled to top after navigation.
 */

export default function Footer() {
  const navigate = useNavigate();

  const [showTop, setShowTop] = useState(false);
  const [rotateDeg, setRotateDeg] = useState(0);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle, loading, success, error
  const [errorMsg, setErrorMsg] = useState("");

  // premium alert state for "Blog - Coming soon"
  const [showPremiumAlert, setShowPremiumAlert] = useState(false);
  // if you want to navigate to the blog after the user closes the alert,
  // set this to a path (e.g. '/blog') when opening the alert. Otherwise null.
  const [navigateToAfterClose, setNavigateToAfterClose] = useState(null);

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = docHeight > 0 ? scrollTop / docHeight : 0;
      setRotateDeg(progress * 360);
      setShowTop(scrollTop > 400);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    // restore previously subscribed email (optional)
    try {
      const saved = localStorage.getItem("aachiamma_newsletter_email");
      if (saved) setEmail(saved);
    } catch (e) {
      // ignore
    }
  }, []);

  const validateEmail = (value) => {
    const re = /^\S+@\S+\.\S+$/;
    return re.test(value.trim());
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!validateEmail(email)) {
      setErrorMsg("Please enter a valid email address.");
      setStatus("error");
      return;
    }

    setStatus("loading");

    try {
      await api.post(
        "/api/newsletter",
        { email: email.trim() },
        { skipGlobalLoader: true }
      );
      setStatus("success");
      try {
        localStorage.setItem("aachiamma_newsletter_email", email.trim());
      } catch (e) {
        // ignore
      }
    } catch (err) {
      const data = err?.response?.data;
      setErrorMsg(
        data?.message || "Network error. Please try again later."
      );
      setStatus("error");
    }
  };

  const clearStatus = () => {
    setStatus("idle");
    setErrorMsg("");
  };

  // --- New helper to set filters into sessionStorage before navigation ---
  const setCategoryFilterForListing = (category) => {
    try {
      if (category) {
        // listing.jsx expects sessionStorage "filters" as JSON e.g. { category: ['pickles'] }
        sessionStorage.setItem("filters", JSON.stringify({ category: [category] }));
      } else {
        sessionStorage.removeItem("filters");
      }
    } catch (e) {
      // ignore storage errors
    }
  };

  // navigateTo helper: navigate then scroll to top (small delay for mount)
  const navigateTo = (path) => {
    try {
      navigate(path);
    } catch (e) {
      // fallback
      window.location.href = path;
    }
    // scroll to top after a short delay so mounted route can receive scroll
    setTimeout(() => {
      try {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (e) {}
    }, 60);
  };

  // --- Blog "Coming soon" handler ---
  const BLOG_ALERT_MESSAGE = `Blog coming soon — we're preparing tasty articles, recipes
and behind-the-scenes stories. Want early access? Join our newsletter!`;

  const handleBlogClick = (e) => {
    // prevent navigation and show premium alert immediately
    if (e && typeof e.preventDefault === "function") e.preventDefault();
    setNavigateToAfterClose(null); // change to '/blog' to navigate after close
    setShowPremiumAlert(true);
  };

  const closePremiumAlert = () => {
    setShowPremiumAlert(false);
    if (navigateToAfterClose) {
      navigateTo(navigateToAfterClose);
      setNavigateToAfterClose(null);
    }
  };

  return (
    // prevent horizontal overflow on very small screens and add extra bottom padding
    <footer className="bg-[#08665F] text-slate-100 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 sm:py-10">
        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-4 sm:p-6">
          {/* top grid */}
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
            {/* Brand / Logo / Address */}
            <div className="flex flex-col space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src={Logo}
                  alt="Aachiamma Foods"
                  className="w-12 h-12 sm:w-14 sm:h-14 object-contain rounded-md"
                />
                <div>
                  <div className="text-lg sm:text-2xl font-semibold tracking-wide">
                    AachiammaFoods
                  </div>
                  <div className="text-xs sm:text-sm text-slate-300">Taste of tradition</div>
                </div>
              </div>

              <address className="not-italic text-slate-300 text-xs sm:text-sm leading-relaxed">
                AachiammaFoods,
                <br />
                20/617-3, Mankavu, Palakkad
                <br />
                Kerala, India. PIN - 678001
              </address>

              <div className="flex gap-2 mt-2">
                <a
                  className="p-2 rounded-lg bg-white/5 hover:-translate-y-1 transition-transform"
                  href="https://www.facebook.com/aachiammafoods"
                  aria-label="Facebook"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Facebook size={16} />
                </a>
                <a
                  className="p-2 rounded-lg bg-white/5 hover:-translate-y-1 transition-transform"
                  href="https://www.instagram.com/aachiammafoods/"
                  aria-label="Instagram"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Instagram size={16} />
                </a>
                <a
                  className="p-2 rounded-lg bg-white/5 hover:-translate-y-1 transition-transform"
                  href="tel:+917356428330"
                  aria-label="Phone"
                >
                  <Phone size={16} />
                </a>
                <a
                  className="p-2 rounded-lg bg-white/5 hover:-translate-y-1 transition-transform"
                  href="https://wa.me/917356428330"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                >
                  <MessageCircle size={16} />
                </a>
              </div>
            </div>

            {/* Shop Links */}
            <nav aria-label="Shop links" className="space-y-2">
              <h4 className="text-sm font-medium">Shop</h4>
              <ul className="space-y-2 text-slate-300 text-sm">
                <li>
                  <button
                    className="block hover:text-white transition text-left w-full"
                    onClick={() => {
                      setCategoryFilterForListing("pickles");
                      navigateTo("/shop/listing?category=pickles");
                    }}
                  >
                    Pickles
                  </button>
                </li>
                <li>
                  <button
                    className="block hover:text-white transition text-left w-full"
                    onClick={() => {
                      setCategoryFilterForListing("snacks");
                      navigateTo("/shop/listing?category=snacks");
                    }}
                  >
                    Snacks
                  </button>
                </li>
                <li>
                  <button
                    className="block hover:text-white transition text-left w-full"
                    onClick={() => {
                      setCategoryFilterForListing("spices-and-powders");
                      navigateTo("/shop/listing?category=spices-and-powders");
                    }}
                  >
                    Spices & Powders
                  </button>
                </li>
                <li>
                  <button
                    className="block hover:text-white transition text-left w-full"
                    onClick={() => {
                      setCategoryFilterForListing("kondattam");
                      navigateTo("/shop/listing?category=kondattam");
                    }}
                  >
                    Kondattam
                  </button>
                </li>
                <li>
                  <button
                    className="block hover:text-white transition text-left w-full"
                    onClick={() => {
                      setCategoryFilterForListing("combos");
                      navigateTo("/shop/listing?category=combos");
                    }}
                  >
                    Combos
                  </button>
                </li>
              </ul>
            </nav>

            {/* Useful Links */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Useful Links</h4>
              <ul className="space-y-2 text-slate-300 text-sm">
                <li>
                  <button
                    className="block hover:text-white transition text-left w-full"
                    onClick={() => navigateTo("/shop/about")}
                  >
                    About
                  </button>
                </li>
                <li>
                  {/* Blog is "coming soon" — show premium alert and prevent navigation */}
                  <Link
                    className="block hover:text-white transition cursor-pointer text-sm"
                    to="/blog"
                    onClick={handleBlogClick}
                    aria-haspopup="dialog"
                    aria-expanded={showPremiumAlert}
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <button
                    className="block hover:text-white transition text-left w-full"
                    onClick={() => navigateTo("/shop/contact")}
                  >
                    Contact
                  </button>
                </li>
                <li>
                  <button
                    className="block hover:text-white transition text-left w-full"
                    onClick={() => navigateTo("/shop/faq")}
                  >
                    FAQ
                  </button>
                </li>
              </ul>
            </div>

            {/* Newsletter + Contact CTA */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Newsletter</h4>
              <p className="text-slate-300 text-sm">
                Get tasty updates, offers and recipes — once a month. No spam.
              </p>

              <form onSubmit={handleSubscribe} className="mt-2 flex flex-col gap-2" aria-labelledby="newsletter-heading">
                <label id="newsletter-heading" className="sr-only">Subscribe to Aachiamma newsletter</label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (status !== 'idle') clearStatus(); }}
                    placeholder="you@example.com"
                    aria-label="Email address"
                    required
                    className="w-full px-3 py-2 rounded-l-lg bg-white/5 text-slate-100 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-300 text-sm"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center px-3 sm:px-4 rounded-r-lg bg-amber-400 text-slate-900 font-semibold disabled:opacity-60 text-sm"
                    disabled={status === "loading"}
                  >
                    {status === "loading" ? "Subscribing..." : "Subscribe"}
                  </button>
                </div>

                <div aria-live="polite" className="min-h-[1.25rem] text-xs">
                  {status === "success" && (
                    <p className="text-emerald-300">Thanks! You are subscribed.</p>
                  )}
                  {status === "error" && errorMsg && (
                    <p className="text-amber-200">{errorMsg}</p>
                  )}
                </div>

                <p className="text-xs text-slate-400">By subscribing you agree to receive occasional emails. You can unsubscribe anytime.</p>
              </form>

              <div className="mt-3 sm:mt-4 flex flex-wrap gap-2">
                <div className="h-8 w-14 bg-white/4 rounded-md flex items-center justify-center text-xs">Visa</div>
                <div className="h-8 w-14 bg-white/4 rounded-md flex items-center justify-center text-xs">Master</div>
                <div className="h-8 w-14 bg-white/4 rounded-md flex items-center justify-center text-xs">UPI</div>
              </div>
            </div>
          </div>

          {/* bottom row */}
          <div className="mt-6 border-t border-white/5 pt-3 flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* reduced contrast for copyright text */}
            <div className="text-slate-400 text-[11px] sm:text-sm text-center sm:text-left">
              © 2025 Aachiammafoods by{' '}
              <a
                href="https://turn360.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white font-semibold relative group inline-block"
              >
                Turn360
                <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-white transition-all group-hover:w-full"></span>
              </a>
              <span className="block sm:inline mt-1 sm:mt-0"> — All rights reserved.</span>
            </div>

            <div className="flex flex-wrap justify-center sm:justify-start gap-3">
              <button className="text-slate-200 hover:text-white text-xs sm:text-sm" onClick={() => navigateTo("/shop/terms")}>Terms</button>
              <button className="text-slate-200 hover:text-white text-xs sm:text-sm" onClick={() => navigateTo("/shop/privacy")}>Privacy</button>
              <button className="text-slate-200 hover:text-white text-xs sm:text-sm" onClick={() => navigateTo("/shop/refunds")}>Refunds</button>
              <button className="text-slate-200 hover:text-white text-xs sm:text-sm" onClick={() => navigateTo("/shop/shipping")}>Shipping</button>
            </div>
          </div>
        </div>
      </div>

      {/* Back-to-top button (left unchanged) */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Back to top"
        className={`fixed right-4 bottom-4 w-10 h-10 sm:right-6 sm:bottom-6 sm:w-12 sm:h-12 rounded-full bg-amber-400 text-slate-900 shadow-lg flex items-center justify-center transition-all duration-500 z-50 ${showTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
      >
        <span
          className="absolute w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-white"
          style={{ transform: `rotate(${rotateDeg}deg)` }}
        ></span>
        <ArrowUp size={16} className="relative z-10" />
      </button>

      {/* Premium "Coming soon" modal */}
      {showPremiumAlert && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="premium-alert-title"
        >
          <div className="absolute inset-0 bg-black/50" onClick={closePremiumAlert} />

          <div className="relative max-w-lg w-full bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md text-slate-100 z-10">
            <h3 id="premium-alert-title" className="text-lg font-semibold">Coming soon — Blog</h3>
            <p className="mt-2 text-sm whitespace-pre-line">{BLOG_ALERT_MESSAGE}</p>

            <div className="mt-4 flex gap-2 justify-end">
              <button
                onClick={closePremiumAlert}
                className="px-4 py-2 rounded-md bg-amber-400 text-slate-900 font-semibold"
              >
                Okay
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
