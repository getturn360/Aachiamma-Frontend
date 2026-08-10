import React, { useEffect, useRef } from "react";

/**
 * RainAndCloudsEffect Component
 * Unified high-fidelity weather simulation.
 * Includes:
 * 1. Dense Cloudbed (ceiling under the navbar) with slow billowing sways.
 * 2. Drifting Volumetric Cloud Masses in the mid-sky.
 * 3. Procedural Jagged Lightning Bolts (thunder lines) striking down from the cloudbed.
 * 4. Ambient Sheet Lightning flashes.
 * 5. Three-layer Parallax Raindrops.
 */
export default function RainAndCloudsEffect() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animationFrameId;

    // 3. Responsive sizing
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

    // 4. Parallax Rain configuration (3 layers)
    const rainParticles = [];
    const createRainParticle = (initY = false) => {
      const layer = Math.floor(Math.random() * 3);
      let speed, length, width, alpha;

      switch (layer) {
        case 0: // Back layer (small, slow, light)
          speed = 6 + Math.random() * 3;
          length = 10 + Math.random() * 5;
          width = 0.5 + Math.random() * 0.2;
          alpha = 0.10 + Math.random() * 0.12;
          break;
        case 1: // Mid layer (standard)
          speed = 10 + Math.random() * 4;
          length = 16 + Math.random() * 7;
          width = 0.9 + Math.random() * 0.3;
          alpha = 0.22 + Math.random() * 0.18;
          break;
        case 2: // Front layer (thick, fast, close)
          speed = 15 + Math.random() * 5;
          length = 24 + Math.random() * 9;
          width = 1.3 + Math.random() * 0.4;
          alpha = 0.35 + Math.random() * 0.2;
          break;
      }

      const windAngle = -2.2 - Math.random() * 1.2;

      return {
        x: Math.random() * (canvas.width + 120) - 60,
        y: initY ? Math.random() * canvas.height : -length - 20,
        xs: windAngle,
        ys: speed,
        length,
        width,
        alpha,
      };
    };

    const getRainDensity = () => {
      const area = canvas.width * canvas.height;
      return Math.max(120, Math.min(400, Math.floor(area / 2500)));
    };

    let targetRainCount = getRainDensity();
    for (let i = 0; i < targetRainCount; i++) {
      rainParticles.push(createRainParticle(true));
    }

    // 7. Core animation loop
    const updateAndDraw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // --- Draw Parallax Rain Particles ---
      const currentTargetRain = getRainDensity();
      if (rainParticles.length < currentTargetRain) {
        while (rainParticles.length < currentTargetRain) {
          rainParticles.push(createRainParticle(false));
        }
      } else if (rainParticles.length > currentTargetRain) {
        rainParticles.splice(currentTargetRain);
      }

      for (let i = 0; i < rainParticles.length; i++) {
        const p = rainParticles[i];

        // Calculate rotation angle of descent dynamically based on velocity
        const angle = Math.atan2(p.xs, p.ys);

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(angle);

        ctx.beginPath();
        // Pointy top of the illustrated teardrop
        ctx.moveTo(0, -p.length / 2);

        // Left curve
        ctx.bezierCurveTo(
          -p.width * 0.8, -p.length / 4,
          -p.width * 0.8, p.length / 2,
          0, p.length / 2
        );

        // Right curve
        ctx.bezierCurveTo(
          p.width * 0.8, p.length / 2,
          p.width * 0.8, -p.length / 4,
          0, -p.length / 2
        );
        ctx.closePath();

        // Beautiful hand-drawn/illustrated blue-white fill
        ctx.fillStyle = `rgba(200, 235, 255, ${p.alpha * 0.95})`;
        ctx.fill();

        // Crisp hand-drawn white border outline
        ctx.strokeStyle = `rgba(255, 255, 255, ${p.alpha * 1.3})`;
        ctx.lineWidth = 0.7;
        ctx.stroke();

        ctx.restore();

        p.x += p.xs;
        p.y += p.ys;

        if (p.y > canvas.height || p.x < -60 || p.x > canvas.width + 60) {
          rainParticles[i] = createRainParticle(false);
        }
      }

      animationFrameId = requestAnimationFrame(updateAndDraw);
    };

    // Begin looping
    animationFrameId = requestAnimationFrame(updateAndDraw);

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
