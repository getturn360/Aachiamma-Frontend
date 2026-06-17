import React, { useEffect, useRef } from "react";

/**
 * RainEffect Component
 * Renders a highly performant, responsive canvas overlay with falling raindrops.
 * Optimized with requestAnimationFrame and divided into 3 distinct depth layers for a premium 3D effect.
 */
export default function RainEffect() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animationFrameId;

    // Handle resizing dynamically based on the parent component
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      } else {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };
    
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Rain drop physics particles
    const particles = [];

    // Helper to generate particle configurations
    const createParticle = (initY = false) => {
      // 3 layers of rain: Back (0), Middle (1), Front (2)
      const layer = Math.floor(Math.random() * 3);
      let speed, length, width, alpha;

      switch (layer) {
        case 0: // Far/back layer (thin, slow, light)
          speed = 6 + Math.random() * 4;
          length = 10 + Math.random() * 10;
          width = 0.5 + Math.random() * 0.5;
          alpha = 0.1 + Math.random() * 0.15;
          break;
        case 1: // Mid layer (standard)
          speed = 11 + Math.random() * 5;
          length = 20 + Math.random() * 15;
          width = 1.0 + Math.random() * 0.5;
          alpha = 0.25 + Math.random() * 0.2;
          break;
        case 2: // Close/front layer (thick, fast, more visible)
          speed = 16 + Math.random() * 6;
          length = 35 + Math.random() * 15;
          width = 1.5 + Math.random() * 0.8;
          alpha = 0.4 + Math.random() * 0.25;
          break;
        default:
          speed = 10;
          length = 20;
          width = 1;
          alpha = 0.3;
      }

      // Wind tilt (offset in X direction per frame)
      const windAngle = -2.5 - Math.random() * 2; // slight angle to simulate a fresh breeze

      return {
        x: Math.random() * (canvas.width + 120) - 60, // allow starting off-screen on the right/left
        y: initY ? Math.random() * canvas.height : -length - 20,
        xs: windAngle,
        ys: speed,
        length,
        width,
        alpha,
      };
    };

    // Calculate maximum particles based on area to preserve density across screen sizes
    const getDensityParticlesCount = () => {
      const area = canvas.width * canvas.height;
      // Normal density: roughly 1 drop per 8000 square pixels, capped between 40 and 150
      return Math.max(40, Math.min(150, Math.floor(area / 8000)));
    };

    let maxParticles = getDensityParticlesCount();

    // Pre-populate particles across the screen height initially
    for (let i = 0; i < maxParticles; i++) {
      particles.push(createParticle(true));
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Dynamically adjust particles array length if size changes drastically
      const currentTargetParticles = getDensityParticlesCount();
      if (particles.length < currentTargetParticles) {
        while (particles.length < currentTargetParticles) {
          particles.push(createParticle(false));
        }
      } else if (particles.length > currentTargetParticles) {
        particles.splice(currentTargetParticles);
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Draw raindrop
        ctx.strokeStyle = `rgba(180, 225, 255, ${p.alpha})`; // Premium soft rain-blue/white shade
        ctx.lineWidth = p.width;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + p.xs * (p.length / p.ys), p.y + p.length);
        ctx.stroke();

        // Move raindrop
        p.x += p.xs;
        p.y += p.ys;

        // Reset raindrop if it goes off-screen
        if (p.y > canvas.height || p.x < -60 || p.x > canvas.width + 60) {
          particles[i] = createParticle(false);
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-[15]"
      style={{ mixBlendMode: "screen", display: "block" }}
    />
  );
}
