import React from "react";

// Pre-drawn vector cloud shape definitions for high resolution rendering
const CloudShape1 = () => (
  <svg viewBox="0 0 100 60" fill="currentColor" className="w-full h-full">
    <path d="M 20 40 A 15 15 0 0 1 35 15 A 20 20 0 0 1 70 15 A 15 15 0 0 1 85 40 A 10 10 0 0 1 80 50 L 20 50 A 10 10 0 0 1 20 40 Z" />
  </svg>
);

const CloudShape2 = () => (
  <svg viewBox="0 0 120 50" fill="currentColor" className="w-full h-full">
    <path d="M 15 35 A 12 12 0 0 1 30 15 A 15 15 0 0 1 65 10 A 12 12 0 0 1 85 20 A 10 10 0 0 1 105 35 A 8 8 0 0 1 100 45 L 20 45 A 8 8 0 0 1 15 35 Z" />
  </svg>
);

/**
 * CloudsEffect Component
 * Renders multiple vector clouds drifting across the screen at staggered speeds, delays, and heights.
 * Placed behind the rain overlay but in front of slide backgrounds for a realistic parallax look.
 */
export default function CloudsEffect() {
  const clouds = [
    {
      id: 1,
      shape: <CloudShape1 />,
      width: "180px",
      height: "108px",
      top: "2%",
      opacity: 0.65,
      duration: "55s",
      delay: "-15s",
    },
    {
      id: 2,
      shape: <CloudShape2 />,
      width: "220px",
      height: "92px",
      top: "14%",
      opacity: 0.55,
      duration: "75s",
      delay: "-40s",
    },
    {
      id: 3,
      shape: <CloudShape1 />,
      width: "140px",
      height: "84px",
      top: "5%",
      opacity: 0.6,
      duration: "40s",
      delay: "-8s",
    },
    {
      id: 4,
      shape: <CloudShape2 />,
      width: "260px",
      height: "108px",
      top: "22%",
      opacity: 0.45,
      duration: "95s",
      delay: "-60s",
    },
    {
      id: 5,
      shape: <CloudShape1 />,
      width: "200px",
      height: "120px",
      top: "9%",
      opacity: 0.58,
      duration: "65s",
      delay: "-28s",
    },
    {
      id: 6,
      shape: <CloudShape2 />,
      width: "160px",
      height: "67px",
      top: "18%",
      opacity: 0.48,
      duration: "50s",
      delay: "-48s",
    },
    {
      id: 7,
      shape: <CloudShape1 />,
      width: "240px",
      height: "144px",
      top: "4%",
      opacity: 0.5,
      duration: "85s",
      delay: "-2s",
    },
    {
      id: 8,
      shape: <CloudShape2 />,
      width: "130px",
      height: "54px",
      top: "27%",
      opacity: 0.52,
      duration: "45s",
      delay: "-35s",
    },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-[12]">
      {/* Self-contained styling for drifting animation */}
      <style>{`
        @keyframes cloud-drift {
          0% {
            left: -25%;
          }
          100% {
            left: 105%;
          }
        }
        .animate-cloud-drift {
          animation: cloud-drift linear infinite;
        }
      `}</style>
      
      {clouds.map((cloud) => (
        <div
          key={cloud.id}
          className="absolute text-white animate-cloud-drift filter blur-[0.5px]"
          style={{
            top: cloud.top,
            width: cloud.width,
            height: cloud.height,
            opacity: cloud.opacity,
            animationDuration: cloud.duration,
            animationDelay: cloud.delay,
          }}
        >
          {cloud.shape}
        </div>
      ))}
    </div>
  );
}
