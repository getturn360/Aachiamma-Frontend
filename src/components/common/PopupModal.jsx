import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DOMPurify from "dompurify";
import RainAndCloudsEffect from "@/components/shopping-view/home/RainAndCloudsEffect";

/**
 * PopupModal Component
 * Shows standard popups, and handles split-screen animations if multiple popups are provided.
 */
export default function PopupModal({ 
  open, 
  onClose, 
  popup, 
  popups = [], 
  onNext, 
  showNextButton = false 
}) {
  const [btnFocused, setBtnFocused] = useState(false);
  const [isSplit, setIsSplit] = useState(false);
  const [showClose, setShowClose] = useState(false);

  const hasMultiple = Array.isArray(popups) && popups.length >= 2;
  const ACCENT = "#08665F";

  useEffect(() => {
    if (!open) {
      setIsSplit(false);
      setShowClose(false);
      return;
    }

    if (hasMultiple) {
      // Step 1: Modal mounts with first popup centered.
      // Step 2: Splits into 2 side-by-side after 1.2 seconds.
      const splitTimer = setTimeout(() => {
        setIsSplit(true);
      }, 1200);

      // Step 3: Master close button fades in after 1.9 seconds.
      const closeTimer = setTimeout(() => {
        setShowClose(true);
      }, 1900);

      return () => {
        clearTimeout(splitTimer);
        clearTimeout(closeTimer);
      };
    } else {
      setIsSplit(false);
      setShowClose(true); // Show close button immediately for single popup
    }
  }, [open, hasMultiple]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose && onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Animation configuration variants
  const backdrop = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  const panelOuter = {
    hidden: { opacity: 0, y: 30, rotateX: 10, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 260, damping: 26, mass: 0.7 },
    },
    exit: { opacity: 0, y: 20, scale: 0.98, transition: { duration: 0.2 } },
  };

  // Renders the specific media/HTML content of a popup
  const renderPopupContent = (item) => {
    if (!item) return null;
    const sanitizedHtml = item.html ? DOMPurify.sanitize(item.html) : "";

    if (item.url) {
      return (
        <motion.img
          key={item.url}
          src={item.url}
          alt={item.title || "Promo"}
          className="w-full h-full object-cover block rounded-2xl"
          initial={{ opacity: 0.9, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1, transition: { duration: 0.3 } }}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
          draggable={false}
        />
      );
    }

    if (sanitizedHtml) {
      return (
        <motion.div
          className="w-full max-h-[70vh] overflow-y-auto rounded-2xl p-6 bg-white text-slate-800"
          initial={{ opacity: 0.9, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1, transition: { duration: 0.3 } }}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
          dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        />
      );
    }

    return (
      <motion.div
        className="w-full min-h-[180px] flex items-center justify-center text-sm text-slate-400 bg-slate-900/50 rounded-2xl border border-slate-800"
        initial={{ opacity: 0.8 }}
        animate={{ opacity: 1, transition: { duration: 0.2 } }}
        exit={{ opacity: 0, transition: { duration: 0.15 } }}
      >
        No preview available
      </motion.div>
    );
  };

  return (
    <AnimatePresence initial={false} mode="wait">
      {open && (
        <motion.div
          key="popup-root"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
          variants={backdrop}
          initial="hidden"
          animate="visible"
          exit="exit"
          role="dialog"
          aria-modal="true"
        >
          {/* Glassmorphism backdrop blur */}
          <motion.div
            key="overlay"
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={onClose}
            variants={backdrop}
            initial="hidden"
            animate="visible"
            exit="exit"
          />

          {/* Fullscreen Rain Background */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            <RainAndCloudsEffect />
          </div>

          {/* Core popup container. Stretches dynamically based on split-state */}
          <motion.div
            layout
            className="relative z-10 flex flex-col md:flex-row gap-6 items-stretch justify-center w-full max-h-[85vh] overflow-hidden"
            style={{
              maxWidth: hasMultiple && isSplit ? "1080px" : "480px",
              perspective: 1200,
              transition: "max-width 0.75s cubic-bezier(0.25, 1, 0.5, 1)",
            }}
          >
            {/* Floating Master Close Button */}
            <AnimatePresence>
              {showClose && (
                <motion.button
                  key="master-close-btn"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.22 }}
                  aria-label="Close popups"
                  onClick={onClose}
                  onFocus={() => setBtnFocused(true)}
                  onBlur={() => setBtnFocused(false)}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  className="absolute top-2 right-2 md:-top-1 md:-right-1 z-50 flex items-center justify-center p-2.5 rounded-full shadow-lg"
                  style={{
                    background: btnFocused ? ACCENT : "rgba(15, 23, 42, 0.8)",
                    color: "#fff",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  <X size={18} />
                </motion.button>
              )}
            </AnimatePresence>

            {/* Popup 1 Container */}
            <motion.div
              layout
              className="relative flex-1 w-full bg-transparent flex flex-col items-center justify-center rounded-2xl"
              variants={panelOuter}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              style={{ 
                willChange: "transform",
                filter: "drop-shadow(0 20px 30px rgba(0, 0, 0, 0.4))"
              }}
            >
              {renderPopupContent(hasMultiple ? popups[0] : popup)}

              {/* Shine glow animation sweep */}
              <motion.div
                aria-hidden
                initial={{ x: "-120%", opacity: 0 }}
                animate={{ x: "120%", opacity: [0, 0.25, 0] }}
                transition={{ delay: 0.3, duration: 1.1, ease: "easeInOut" }}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "40%",
                  height: "140%",
                  transform: "skewX(-18deg)",
                  pointerEvents: "none",
                  background:
                    "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0) 100%)",
                  mixBlendMode: "overlay",
                }}
              />
            </motion.div>

            {/* Popup 2 Container (visible only when split is triggered) */}
            <AnimatePresence>
              {hasMultiple && isSplit && (
                <motion.div
                  layout
                  key="popup-2-container"
                  initial={{ opacity: 0, scale: 0.85, x: -80, rotateY: -10 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    x: 0,
                    rotateY: 0,
                    transition: {
                      type: "spring",
                      stiffness: 130,
                      damping: 18,
                      mass: 0.85,
                      delay: 0.08,
                    },
                  }}
                  exit={{ opacity: 0, scale: 0.85, x: -80, transition: { duration: 0.2 } }}
                  className="relative flex-1 w-full bg-transparent flex flex-col items-center justify-center rounded-2xl"
                  onClick={(e) => e.stopPropagation()}
                  style={{ 
                    willChange: "transform",
                    filter: "drop-shadow(0 20px 30px rgba(0, 0, 0, 0.4))"
                  }}
                >
                  {renderPopupContent(popups[1])}

                  {/* Shine glow sweep for Popup 2 */}
                  <motion.div
                    aria-hidden
                    initial={{ x: "-120%", opacity: 0 }}
                    animate={{ x: "120%", opacity: [0, 0.25, 0] }}
                    transition={{ delay: 0.5, duration: 1.1, ease: "easeInOut" }}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "40%",
                      height: "140%",
                      transform: "skewX(-18deg)",
                      pointerEvents: "none",
                      background:
                        "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0) 100%)",
                      mixBlendMode: "overlay",
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
