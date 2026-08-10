import React, { useEffect, useMemo, useState } from "react";

/**
 * MaveliSkateWalk — King Maveli skateboard frames skate L→R through the navbar,
 * hidden (opacity 0) while under the logo so nothing shows through.
 */
const frameModules = import.meta.glob(
  "../../../assets/maveli-skate/frame-*.png",
  { eager: true, import: "default" }
);

function sortedFrameSrcs() {
  return Object.entries(frameModules)
    .sort(([a], [b]) => {
      const na = Number((a.match(/frame-(\d+)/i) || [])[1] || 0);
      const nb = Number((b.match(/frame-(\d+)/i) || [])[1] || 0);
      return na - nb;
    })
    .map(([, src]) => src);
}

export default function MaveliWalk({ className = "", fps = 8 }) {
  const frames = useMemo(() => sortedFrameSrcs(), []);
  const [index, setIndex] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!frames.length) return undefined;
    let cancelled = false;
    Promise.all(
      frames.map(
        (src) =>
          new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve();
            img.onerror = () => resolve();
            img.src = src;
          })
      )
    ).then(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [frames]);

  useEffect(() => {
    if (!ready || frames.length < 2) return undefined;
    const ms = Math.max(40, Math.round(1000 / fps));
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % frames.length);
    }, ms);
    return () => window.clearInterval(id);
  }, [ready, frames, fps]);

  if (!frames.length) return null;

  return (
    <div
      className={`maveli-behind-walk pointer-events-none select-none ${className}`}
      aria-hidden
    >
      <img
        src={frames[index]}
        alt=""
        className="maveli-behind-walk__img"
        draggable={false}
      />
      <style>{`
        .maveli-behind-walk {
          position: absolute;
          left: 50%;
          bottom: -2px;
          width: 88px;
          height: 78px;
          z-index: 1;
          transform-origin: 50% 100%;
          animation: maveli-lr-skate 12s linear infinite;
          will-change: transform, opacity;
        }

        .maveli-behind-walk__img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          object-position: bottom center;
          display: block;
          user-select: none;
          pointer-events: none;
        }

        /* Visible beside logo; fully hidden under logo cover plate */
        @keyframes maveli-lr-skate {
          0% {
            opacity: 0;
            transform: translate(-190%, 4px) scale(0.78);
          }
          5% {
            opacity: 1;
            transform: translate(-170%, 2px) scale(0.84);
          }
          22% {
            opacity: 1;
            transform: translate(-115%, 3px) scale(0.9);
          }
          30% {
            opacity: 1;
            transform: translate(-95%, 2px) scale(0.92);
          }
          36% {
            opacity: 0;
            transform: translate(-78%, 2px) scale(0.88);
          }
          42%, 58% {
            opacity: 0;
            transform: translate(-50%, 2px) scale(0.86);
          }
          64% {
            opacity: 0;
            transform: translate(-22%, 2px) scale(0.88);
          }
          70% {
            opacity: 1;
            transform: translate(-5%, 2px) scale(0.92);
          }
          82% {
            opacity: 1;
            transform: translate(40%, 3px) scale(0.9);
          }
          94% {
            opacity: 1;
            transform: translate(70%, 2px) scale(0.84);
          }
          100% {
            opacity: 0;
            transform: translate(95%, 4px) scale(0.78);
          }
        }

        @media (min-width: 640px) {
          .maveli-behind-walk {
            width: 102px;
            height: 88px;
          }
        }

        @media (min-width: 768px) {
          .maveli-behind-walk {
            width: 118px;
            height: 96px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .maveli-behind-walk {
            animation: none;
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
