import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * PopupModal — full component (modern creative animation + right-side radius/clipping)
 *
 * Features:
 * - 3D tilt entrance, clip-path wipe reveal, subtle floating loop, shine sweep
 * - Close on ESC + overlay click
 * - Parent + inner content use overflow-hidden + rounded corners so growth keeps rounded edges
 * - Image/HTML container has explicit right-side rounding so right expansion preserves radius
 *
 * Usage: <PopupModal open={open} onClose={...} popup={popupObj} showNextButton onNext={...} />
 */
export default function PopupModal({ open, onClose, popup, onNext, showNextButton = false }) {
  const [btnFocused, setBtnFocused] = useState(false);

  // handle ESC to close (only when open)
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose && onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const ACCENT = "#08665F";

  const backdrop = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.28 } },
    exit: { opacity: 0, transition: { duration: 0.18 } },
  };

  const panelOuter = {
    hidden: { opacity: 0, y: 28, rotateX: 16, scale: 0.992 },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 30, mass: 0.6 },
    },
    exit: { opacity: 0, y: 16, scale: 0.995, transition: { duration: 0.18 } },
  };

  const contentReveal = {
    hidden: {
      clipPath: "polygon(0 0, 0 0, 0 100%, 0 100%)",
      opacity: 0.95,
      scale: 0.997,
    },
    visible: {
      clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
      opacity: 1,
      scale: 1,
      transition: { duration: 0.56, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.18, ease: "easeIn" },
    },
  };

  // Always render AnimatePresence so exit animations run.
  return (
    <AnimatePresence initial={false} mode="wait">
      {open && popup && (
        <motion.div
          key="popup-root"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          variants={backdrop}
          initial="hidden"
          animate="visible"
          exit="exit"
          role="dialog"
          aria-modal="true"
        >
          {/* overlay */}
          <motion.div
            key="overlay"
            className="absolute inset-0 bg-black/55 backdrop-blur-sm"
            onClick={onClose}
            variants={backdrop}
            initial="hidden"
            animate="visible"
            exit="exit"
          />

          {/* PANEL WRAPPER: perspective + rounded + overflow-hidden so corners are clipped */}
          <motion.div
            key="panel"
            className="relative w-full max-w-2xl rounded-2xl shadow-2xl bg-transparent overflow-hidden"
            variants={panelOuter}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            role="document"
            aria-label={popup.title || "Promotion"}
            style={{ perspective: 1200 }}
          >
            {/* INNER: wipe reveal + overflow-hidden so animated content stays rounded */}
            <motion.div
              className="relative overflow-hidden rounded-2xl bg-black/0"
              variants={contentReveal}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* Floating container (subtle loop while open) */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.9 }}
                style={{ willChange: "transform" }}
              >
                {/* Close button */}
                <motion.button
                  aria-label="Close popup"
                  onClick={onClose}
                  onFocus={() => setBtnFocused(true)}
                  onBlur={() => setBtnFocused(false)}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.98 }}
                  className="absolute top-3 right-3 z-40 flex items-center justify-center p-2 rounded-full focus:outline-none"
                  style={{
                    background: btnFocused ? ACCENT : "rgba(0,0,0,0.45)",
                    color: "#fff",
                    boxShadow: btnFocused
                      ? `0 12px 40px ${ACCENT}33, 0 4px 10px rgba(0,0,0,0.20)`
                      : "0 8px 20px rgba(2,6,23,0.22)",
                    transition: "background 160ms ease, box-shadow 160ms ease, transform 120ms ease",
                  }}
                >
                  <X size={18} />
                </motion.button>

                {/* Optional Next button */}
                {showNextButton && onNext && (
                  <motion.button
                    aria-label="Next popup"
                    onClick={onNext}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.98 }}
                    className="absolute top-3 right-14 z-40 flex items-center justify-center p-2 rounded-full focus:outline-none"
                    style={{
                      background: "rgba(0,0,0,0.35)",
                      color: "#fff",
                      boxShadow: "0 6px 20px rgba(2,6,23,0.18)",
                      transition: "transform 120ms ease",
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M9 6l6 6-6 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </motion.button>
                )}

                {/* CONTENT: image OR html; explicit right-side rounding on content */}
                {popup.url ? (
                  <motion.img
                    key={popup.url}
                    src={popup.url}
                    alt={popup.title || "Promo"}
                    // parent clips corners; image has explicit right-side rounding to preserve radius when resized to right
                    className="w-full h-auto max-h-[78vh] object-contain block rounded-r-2xl"
                    initial={{ opacity: 0.92, scale: 0.997 }}
                    animate={{ opacity: 1, scale: 1, transition: { duration: 0.36 } }}
                    exit={{ opacity: 0, transition: { duration: 0.22 } }}
                    draggable={false}
                  />
                ) : popup.html ? (
                  <motion.div
                    // html container also gets explicit right rounding; parent will enforce overall rounded corners
                    className="w-full max-h-[78vh] overflow-auto rounded-r-2xl"
                    initial={{ opacity: 0.92, scale: 0.997 }}
                    animate={{ opacity: 1, scale: 1, transition: { duration: 0.36 } }}
                    exit={{ opacity: 0, transition: { duration: 0.22 } }}
                    dangerouslySetInnerHTML={{ __html: popup.html }}
                  />
                ) : (
                  <motion.div
                    className="w-full min-h-[160px] flex items-center justify-center text-sm text-slate-400 bg-white/5 rounded-2xl"
                    initial={{ opacity: 0.9 }}
                    animate={{ opacity: 1, transition: { duration: 0.25 } }}
                    exit={{ opacity: 0, transition: { duration: 0.18 } }}
                  >
                    No preview available
                  </motion.div>
                )}
              </motion.div>

              {/* SHINE sweep (one-time polish overlay) */}
              <motion.div
                aria-hidden
                initial={{ x: "-120%", opacity: 0 }}
                animate={{ x: "120%", opacity: [0, 0.34, 0] }}
                transition={{ delay: 0.28, duration: 0.95, ease: "easeInOut" }}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "40%",
                  height: "140%",
                  transform: "skewX(-18deg)",
                  pointerEvents: "none",
                  background:
                    "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.78) 50%, rgba(255,255,255,0) 100%)",
                  mixBlendMode: "overlay",
                }}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
