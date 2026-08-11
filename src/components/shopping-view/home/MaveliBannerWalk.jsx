import React, { useEffect, useState } from "react";
import maveliWalkWebp from "../../../assets/maveli-walk.webp";
import maveliWalkGif from "../../../assets/maveli-walk.gif";

/**
 * Walking Maveli along the baseline of the home hero banner.
 */
export default function MaveliBannerWalk({ className = "" }) {
  const [walkSrc, setWalkSrc] = useState(maveliWalkWebp);

  useEffect(() => {
    const test = new Image();
    test.onerror = () => setWalkSrc(maveliWalkGif);
    test.src = maveliWalkWebp;
  }, []);

  return (
    <div
      className={`maveli-banner-walk pointer-events-none select-none ${className}`}
      aria-hidden
    >
      <img
        src={walkSrc}
        alt=""
        className="maveli-banner-walk__img"
        draggable={false}
      />
      <style>{`
        .maveli-banner-walk {
          position: absolute;
          left: 0;
          bottom: 0;
          z-index: 25;
          width: 150px;
          height: 180px;
          animation: maveli-banner-lr 14s linear infinite;
          will-change: left, transform;
        }

        .maveli-banner-walk__img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          object-position: bottom center;
          display: block;
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.28));
          transform: scaleX(-1);
        }

        @keyframes maveli-banner-lr {
          0% {
            left: 0;
            transform: translateX(-100%);
          }
          100% {
            left: 100%;
            transform: translateX(0);
          }
        }

        @media (min-width: 640px) {
          .maveli-banner-walk {
            width: 196px;
            height: 236px;
          }
        }

        @media (min-width: 1024px) {
          .maveli-banner-walk {
            width: 250px;
            height: 300px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .maveli-banner-walk {
            animation: none;
            left: 8%;
            transform: none;
          }
        }
      `}</style>
    </div>
  );
}
