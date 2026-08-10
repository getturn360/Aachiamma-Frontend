import React, { useEffect, useState } from "react";
import maveliWalkWebp from "../../../assets/maveli-walk.webp";
import maveliWalkGif from "../../../assets/maveli-walk.gif";

/**
 * Maveli walks left → right behind the navbar logo.
 * Fully hidden (opacity 0) while under the logo so no body parts show through.
 */
export default function MaveliWalk({ className = "" }) {
  const [walkSrc, setWalkSrc] = useState(maveliWalkWebp);

  useEffect(() => {
    const test = new Image();
    test.onerror = () => setWalkSrc(maveliWalkGif);
    test.src = maveliWalkWebp;
  }, []);

  return (
    <div
      className={`maveli-behind-walk pointer-events-none select-none ${className}`}
      aria-hidden
    >
      <img
        src={walkSrc}
        alt=""
        className="maveli-behind-walk__img"
        draggable={false}
      />
      <style>{`
        .maveli-behind-walk {
          position: absolute;
          left: 50%;
          bottom: 0;
          /* Slightly larger, still fits the existing 220×80 logo stage */
          width: 58px;
          height: 76px;
          z-index: 1;
          transform-origin: 50% 100%;
          animation: maveli-lr-walk 6.8s linear infinite;
          will-change: transform, opacity;
        }

        .maveli-behind-walk__img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          object-position: bottom center;
          display: block;
          filter: drop-shadow(0 1px 2px rgba(0,0,0,0.14));
          user-select: none;
          pointer-events: none;
          transform: scaleX(-1);
        }

        /*
          Visible only on the left and right of the logo.
          Mid band (behind logo) → opacity 0 so nothing peeks through.
        */
        @keyframes maveli-lr-walk {
          0% {
            opacity: 0;
            transform: translate(-175%, 6px) scale(0.72);
          }
          6% {
            opacity: 1;
            transform: translate(-155%, 3px) scale(0.78);
          }
          18% {
            opacity: 1;
            transform: translate(-120%, 5px) scale(0.82);
          }
          28% {
            opacity: 1;
            transform: translate(-100%, 3px) scale(0.84);
          }
          /* Entering logo cover — fade out completely */
          36% {
            opacity: 0;
            transform: translate(-82%, 4px) scale(0.8);
          }
          42%, 58% {
            opacity: 0;
            transform: translate(-50%, 4px) scale(0.78);
          }
          /* Leaving logo cover — fade back in */
          64% {
            opacity: 0;
            transform: translate(-18%, 4px) scale(0.8);
          }
          72% {
            opacity: 1;
            transform: translate(0%, 3px) scale(0.84);
          }
          84% {
            opacity: 1;
            transform: translate(35%, 5px) scale(0.82);
          }
          94% {
            opacity: 1;
            transform: translate(55%, 3px) scale(0.78);
          }
          100% {
            opacity: 0;
            transform: translate(75%, 6px) scale(0.72);
          }
        }

        @media (min-width: 640px) {
          .maveli-behind-walk {
            width: 66px;
            height: 86px;
          }
        }

        @media (min-width: 768px) {
          .maveli-behind-walk {
            width: 74px;
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
