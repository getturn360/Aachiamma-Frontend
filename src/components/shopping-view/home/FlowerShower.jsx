import React, { useEffect, useRef } from "react";

/**
 * FlowerShower — Onam (Kerala) pookalam-inspired flower rain.
 * Draws realistic festival flowers commonly used in Onam floral carpets:
 * marigold (jambathi), ixora (chethi/thechi), hibiscus (chembarathi),
 * jasmine (mulla), thumba (white leucas), mukutti (yellow), and rose petals.
 */
export default function FlowerShower() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let time = 0;

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

    // Onam pookalam flower types
    const FLOWER_TYPES = [
      "marigold",
      "ixora",
      "hibiscus",
      "jasmine",
      "thumba",
      "mukutti",
      "rosePetal",
    ];

    const rgba = (r, g, b, a) => `rgba(${r},${g},${b},${a})`;

    const createFlower = (initY = false) => {
      const layer = Math.floor(Math.random() * 3);
      const type = FLOWER_TYPES[Math.floor(Math.random() * FLOWER_TYPES.length)];

      let speed; let size; let alpha;
      switch (layer) {
        case 0:
          speed = 0.55 + Math.random() * 0.4;
          size = 5 + Math.random() * 4;
          alpha = 0.35 + Math.random() * 0.2;
          break;
        case 1:
          speed = 0.9 + Math.random() * 0.55;
          size = 8 + Math.random() * 5;
          alpha = 0.5 + Math.random() * 0.25;
          break;
        default:
          speed = 1.25 + Math.random() * 0.7;
          size = 11 + Math.random() * 7;
          alpha = 0.65 + Math.random() * 0.25;
          break;
      }

      // Hibiscus / marigold a bit larger; thumba / mukutti smaller
      if (type === "hibiscus") size *= 1.25;
      if (type === "marigold") size *= 1.1;
      if (type === "thumba" || type === "mukutti") size *= 0.75;
      if (type === "jasmine") size *= 0.85;

      return {
        x: Math.random() * (canvas.width + 100) - 50,
        y: initY ? Math.random() * canvas.height : -size * 4,
        vx: (Math.random() - 0.5) * 0.45,
        vy: speed,
        size,
        alpha,
        sway: 0.5 + Math.random() * 0.8,
        swayPhase: Math.random() * Math.PI * 2,
        rotation: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.035,
        type,
        layer,
        hueShift: Math.random() * 0.15,
      };
    };

    const getDensity = () => {
      const area = canvas.width * canvas.height;
      return Math.max(36, Math.min(95, Math.floor(area / 10000)));
    };

    const flowers = [];
    for (let i = 0; i < getDensity(); i++) {
      flowers.push(createFlower(true));
    }

    // --- Draw helpers for each Onam flower ---

    const drawMarigold = (s, a) => {
      // Jambathi — dense orange-yellow pompon
      const petals = 16;
      for (let ring = 2; ring >= 0; ring--) {
        const rs = s * (0.55 + ring * 0.22);
        for (let i = 0; i < petals; i++) {
          const ang = (i / petals) * Math.PI * 2 + ring * 0.2;
          ctx.save();
          ctx.rotate(ang);
          ctx.beginPath();
          ctx.ellipse(0, -rs * 0.55, rs * 0.22, rs * 0.55, 0, 0, Math.PI * 2);
          const warm = ring === 0 ? [255, 200, 40] : ring === 1 ? [255, 160, 20] : [255, 120, 10];
          ctx.fillStyle = rgba(warm[0], warm[1], warm[2], a * (0.7 + ring * 0.1));
          ctx.fill();
          ctx.restore();
        }
      }
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.22, 0, Math.PI * 2);
      ctx.fillStyle = rgba(200, 90, 10, a);
      ctx.fill();
    };

    const drawIxora = (s, a) => {
      // Chethi / Thechi — tight cluster of tiny red tubular blooms
      const buds = 7;
      for (let i = 0; i < buds; i++) {
        const ang = (i / buds) * Math.PI * 2;
        const ox = Math.cos(ang) * s * 0.35;
        const oy = Math.sin(ang) * s * 0.35;
        ctx.beginPath();
        ctx.ellipse(ox, oy, s * 0.22, s * 0.32, ang, 0, Math.PI * 2);
        ctx.fillStyle = rgba(220, 35, 45, a);
        ctx.fill();
        // Tiny white tip
        ctx.beginPath();
        ctx.arc(ox + Math.cos(ang) * s * 0.18, oy + Math.sin(ang) * s * 0.18, s * 0.08, 0, Math.PI * 2);
        ctx.fillStyle = rgba(255, 230, 220, a * 0.9);
        ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.18, 0, Math.PI * 2);
      ctx.fillStyle = rgba(140, 20, 30, a);
      ctx.fill();
    };

    const drawHibiscus = (s, a) => {
      // Chembarathi — 5 large overlapping petals + prominent stamen
      const petals = 5;
      for (let i = 0; i < petals; i++) {
        const ang = (i / petals) * Math.PI * 2;
        ctx.save();
        ctx.rotate(ang);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(s * 0.55, -s * 0.15, s * 0.7, -s * 0.85, 0, -s * 1.05);
        ctx.bezierCurveTo(-s * 0.7, -s * 0.85, -s * 0.55, -s * 0.15, 0, 0);
        ctx.closePath();
        const grad = ctx.createRadialGradient(0, -s * 0.4, 0, 0, -s * 0.4, s);
        grad.addColorStop(0, rgba(255, 80, 100, a));
        grad.addColorStop(0.55, rgba(210, 25, 50, a));
        grad.addColorStop(1, rgba(160, 10, 40, a * 0.95));
        ctx.fillStyle = grad;
        ctx.fill();
        // Vein
        ctx.beginPath();
        ctx.moveTo(0, -s * 0.1);
        ctx.quadraticCurveTo(s * 0.05, -s * 0.5, 0, -s * 0.95);
        ctx.strokeStyle = rgba(255, 180, 190, a * 0.45);
        ctx.lineWidth = 0.8;
        ctx.stroke();
        ctx.restore();
      }
      // Stamen column
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -s * 0.75);
      ctx.strokeStyle = rgba(255, 210, 60, a);
      ctx.lineWidth = s * 0.08;
      ctx.lineCap = "round";
      ctx.stroke();
      for (let i = 0; i < 5; i++) {
        const ang = -Math.PI / 2 + (i - 2) * 0.35;
        ctx.beginPath();
        ctx.arc(Math.cos(ang) * s * 0.35, -s * 0.55 + Math.sin(ang) * s * 0.15, s * 0.09, 0, Math.PI * 2);
        ctx.fillStyle = rgba(255, 200, 40, a);
        ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.16, 0, Math.PI * 2);
      ctx.fillStyle = rgba(90, 10, 25, a);
      ctx.fill();
    };

    const drawJasmine = (s, a) => {
      // Mulla — white star-like petals with yellow center
      const petals = 6;
      for (let i = 0; i < petals; i++) {
        const ang = (i / petals) * Math.PI * 2;
        ctx.save();
        ctx.rotate(ang);
        ctx.beginPath();
        ctx.ellipse(0, -s * 0.55, s * 0.28, s * 0.55, 0, 0, Math.PI * 2);
        ctx.fillStyle = rgba(255, 255, 250, a);
        ctx.fill();
        ctx.strokeStyle = rgba(230, 230, 220, a * 0.6);
        ctx.lineWidth = 0.5;
        ctx.stroke();
        ctx.restore();
      }
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.2, 0, Math.PI * 2);
      ctx.fillStyle = rgba(255, 210, 70, a);
      ctx.fill();
    };

    const drawThumba = (s, a) => {
      // Thumba (Leucas) — tiny white tubular flowers, classic Onam pookalam
      for (let i = 0; i < 5; i++) {
        const ang = (i / 5) * Math.PI * 2;
        const ox = Math.cos(ang) * s * 0.25;
        const oy = Math.sin(ang) * s * 0.25;
        ctx.beginPath();
        ctx.ellipse(ox, oy - s * 0.1, s * 0.18, s * 0.35, ang * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = rgba(255, 255, 255, a);
        ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.14, 0, Math.PI * 2);
      ctx.fillStyle = rgba(200, 210, 190, a);
      ctx.fill();
    };

    const drawMukutti = (s, a) => {
      // Mukutti — small bright yellow 5-petal flower
      const petals = 5;
      for (let i = 0; i < petals; i++) {
        const ang = (i / petals) * Math.PI * 2;
        ctx.save();
        ctx.rotate(ang);
        ctx.beginPath();
        ctx.ellipse(0, -s * 0.5, s * 0.32, s * 0.5, 0, 0, Math.PI * 2);
        ctx.fillStyle = rgba(255, 215, 30, a);
        ctx.fill();
        ctx.restore();
      }
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.22, 0, Math.PI * 2);
      ctx.fillStyle = rgba(230, 140, 20, a);
      ctx.fill();
    };

    const drawRosePetal = (s, a) => {
      // Soft rose petal used to fill Onam rangoli edges
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.bezierCurveTo(s * 1.1, -s * 0.5, s * 0.95, s * 0.6, 0, s * 0.95);
      ctx.bezierCurveTo(-s * 0.95, s * 0.6, -s * 1.1, -s * 0.5, 0, -s);
      ctx.closePath();
      const grad = ctx.createLinearGradient(-s, 0, s, 0);
      grad.addColorStop(0, rgba(255, 120, 140, a));
      grad.addColorStop(0.5, rgba(230, 50, 80, a));
      grad.addColorStop(1, rgba(180, 30, 55, a));
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.7);
      ctx.quadraticCurveTo(s * 0.15, 0, 0, s * 0.7);
      ctx.strokeStyle = rgba(255, 200, 210, a * 0.5);
      ctx.lineWidth = 0.7;
      ctx.stroke();
    };

    const drawFlowerByType = (f) => {
      const s = f.size;
      const a = f.alpha;
      switch (f.type) {
        case "marigold":
          drawMarigold(s, a);
          break;
        case "ixora":
          drawIxora(s, a);
          break;
        case "hibiscus":
          drawHibiscus(s, a);
          break;
        case "jasmine":
          drawJasmine(s, a);
          break;
        case "thumba":
          drawThumba(s, a);
          break;
        case "mukutti":
          drawMukutti(s, a);
          break;
        case "rosePetal":
        default:
          drawRosePetal(s, a);
          break;
      }
    };

    const updateAndDraw = () => {
      time += 1;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const currentTarget = getDensity();
      if (flowers.length < currentTarget) {
        while (flowers.length < currentTarget) flowers.push(createFlower(false));
      } else if (flowers.length > currentTarget) {
        flowers.splice(currentTarget);
      }

      for (let i = 0; i < flowers.length; i++) {
        const f = flowers[i];

        f.swayPhase += 0.018 + f.sway * 0.008;
        f.x += f.vx + Math.sin(f.swayPhase + time * 0.01) * f.sway * 0.32;
        f.y += f.vy;
        f.rotation += f.spin;

        ctx.save();
        ctx.translate(f.x, f.y);
        ctx.rotate(f.rotation);
        // Soft flutter / depth squash
        const flutter = 0.72 + Math.sin(f.swayPhase) * 0.18;
        ctx.scale(1, flutter);
        ctx.shadowColor = "rgba(0,0,0,0.18)";
        ctx.shadowBlur = f.layer === 2 ? 4 : 2;
        drawFlowerByType(f);
        ctx.restore();

        if (f.y > canvas.height + 50 || f.x < -70 || f.x > canvas.width + 70) {
          flowers[i] = createFlower(false);
        }
      }

      animationFrameId = requestAnimationFrame(updateAndDraw);
    };

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
      style={{ mixBlendMode: "normal", display: "block" }}
      aria-hidden
    />
  );
}
