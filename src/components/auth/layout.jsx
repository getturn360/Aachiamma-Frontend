import React, { useEffect, useState, useRef } from "react";
import { Outlet } from "react-router-dom";
import logoDefault from "../../assets/logo-3.png"; 
import backLogoDefault from "../../assets/logo-4.png"; 

export default function AuthLayout({
  logoUrl,
  backLogoUrl,
  pauseDuration = 3,        
  transitionSeconds = 0.6, 
  loop = true,            
}) {
  const logoSrc = logoUrl || logoDefault;
  const backSrc = backLogoUrl || backLogoDefault;

  const [flipped, setFlipped] = useState(false);
  const flipperRef = useRef(null);

  useEffect(() => {
  
    const kickoff = setTimeout(() => setFlipped((v) => !v), 150);

    let intervalId = null;
    if (loop) {
   
      intervalId = setInterval(() => setFlipped((v) => !v), pauseDuration * 1000);
    }

    return () => {
      clearTimeout(kickoff);
      if (intervalId) clearInterval(intervalId);
    };
  }, [pauseDuration, loop]);

  return (
    <div className="flex min-h-screen w-full">
     
      <div className="hidden lg:flex w-1/2 relative overflow-hidden items-center justify-center bg-gradient-to-br from-[#08665F] via-[#06665F] to-[#044c43] px-12">
    
        <svg
          className="absolute inset-0 h-full w-full opacity-10"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          viewBox="0 0 800 800"
          aria-hidden
        >
          <defs>
            <linearGradient id="g" x1="0" x2="1">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
          </defs>
          <rect width="800" height="800" fill="url(#g)" />
          <g fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2">
            <circle cx="200" cy="200" r="120" />
            <circle cx="520" cy="540" r="200" />
            <circle cx="680" cy="160" r="80" />
          </g>
        </svg>

        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
          <div
            style={{ ["--transition-duration"]: `${transitionSeconds}s` }}
            className="logo-3d mb-6"
            ref={flipperRef}
            aria-hidden={false}
          >
            <div className={`logo-flipper ${flipped ? "flipped" : ""}`}>
              <div className="logo-face logo-front">
                <img
                  src={logoSrc}
                  alt="Aachiamm Foods Logo - front"
                  className="w-[200px] h-auto object-contain drop-shadow-md"
                />
              </div>
              <div className="logo-face logo-back">
                <img
                  src={backSrc}
                  alt="Aachiamm Foods Logo - back"
                  className="w-[200px] h-auto object-contain drop-shadow-md"
                />
              </div>
            </div>
          </div>

          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white">
            Welcome to Aachiamma Family
          </h1>
          <p className="mt-4 text-lg opacity-90 text-white">
            Authentic flavours. Timeless recipes. Crafted with care for every table.
          </p>
        </div>

        <div className="absolute bottom-10 right-10 hidden md:block">
          <div className="rounded-2xl bg-white/6 px-6 py-4 shadow-lg backdrop-blur-sm max-w-xs text-sm text-white/90">
            Premium quality ingredients • Freshly prepared • Delivered with love
          </div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center bg-neutral-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="rounded-2xl bg-white p-8 shadow-lg">
            <Outlet />
          </div>
          <p className="mt-6 text-center text-sm text-neutral-500">
            © {new Date().getFullYear()} Aachiamm Foods — All rights reserved
          </p>
        </div>
      </div>

      <style>{`
        .logo-3d { perspective: 1200px; }
        .logo-flipper {
          width: 200px;
          height: 200px;
          position: relative;
          transform-style: preserve-3d;
          transition: transform var(--transition-duration, 0.6s) ease-in-out;
        }
        .logo-flipper.flipped { transform: rotateY(180deg); }
        .logo-face {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .logo-front { transform: rotateY(0deg); }
        .logo-back { transform: rotateY(180deg); }
        .logo-face img { display:block; width:200px; height:auto; }
      `}</style>
    </div>
  );
}
