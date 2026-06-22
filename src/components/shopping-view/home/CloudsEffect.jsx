import React, { useEffect, useRef, useState } from "react";
import Cloud1 from "@/assets/Cloud-1.png";
import Cloud2 from "@/assets/Cloud-2.png";
import Cloud3 from "@/assets/Cloud-3.png";

export default function CloudsEffect() {
  const containerRef = useRef(null);
  const domRefs = useRef([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Update container boundaries dynamically on resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const cloudsConfig = [
    { id: 1, image: Cloud1, width: 220, topPercent: 8, baseSpeed: 0.22, bobFrequency: 1.1, bobMagnitude: 6, parallaxFactor: 0.15, opacity: 0.75 },
    { id: 2, image: Cloud2, width: 280, topPercent: 25, baseSpeed: 0.18, bobFrequency: 0.7, bobMagnitude: 10, parallaxFactor: 0.25, opacity: 0.7 },
    { id: 3, image: Cloud3, width: 180, topPercent: 45, baseSpeed: 0.25, bobFrequency: 1.4, bobMagnitude: 5, parallaxFactor: 0.1, opacity: 0.65 },
    { id: 4, image: Cloud1, width: 320, topPercent: 15, baseSpeed: 0.3, bobFrequency: 0.9, bobMagnitude: 8, parallaxFactor: 0.38, opacity: 0.68, blur: "0.5px" }
  ];

  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return;
    if (dimensions.width < 768) return; // Skip physics loop execution on mobile/tablet screens

    let animId;
    let time = 0;

    // Mouse tracking variables
    const mouse = { x: -1000, y: -1000, lastX: 0, lastY: 0, vx: 0, vy: 0 };
    let currentScrollY = window.scrollY;

    const onMouseMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newX = e.clientX - rect.left;
      const newY = e.clientY - rect.top;

      const dt = 16.6; // average frame time
      mouse.vx = (newX - mouse.lastX) / dt;
      mouse.vy = (newY - mouse.lastY) / dt;

      mouse.x = newX;
      mouse.y = newY;
      mouse.lastX = newX;
      mouse.lastY = newY;
    };

    const onMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
      mouse.vx = 0;
      mouse.vy = 0;
    };

    const onScroll = () => {
      currentScrollY = window.scrollY;
    };

    const parent = containerRef.current;
    if (parent) {
      parent.addEventListener("mousemove", onMouseMove);
      parent.addEventListener("mouseleave", onMouseLeave);
    }
    window.addEventListener("scroll", onScroll);

    // Initialize cloud physics states
    const cloudStates = cloudsConfig.map((cloud, idx) => {
      // Stagger clouds evenly on page load to avoid grouping
      const initialX = (idx / cloudsConfig.length) * (dimensions.width + cloud.width) - cloud.width;
      const baseY = cloud.topPercent * dimensions.height * 0.01 + 30; // offset slightly downward
      return {
        ...cloud,
        x: initialX,
        y: baseY,
        baseY: baseY,
        speed: cloud.baseSpeed,
        angle: 0,
        swaySpeed: 0,
      };
    });

    // Physics update and render tick loop
    const tick = () => {
      time += 0.015;

      // Slowly decay mouse velocity to simulate drag
      mouse.vx *= 0.96;
      mouse.vy *= 0.96;

      cloudStates.forEach((cloud, idx) => {
        const el = domRefs.current[idx];
        if (!el) return;

        // 1. Horizontal drift speed influenced by mouse movement (wind gust)
        // Sweeping mouse right speeds them up; sweeping left slows down or moves backwards
        const windBoost = mouse.vx * cloud.parallaxFactor * 1.5;
        const finalSpeed = cloud.speed + windBoost;
        cloud.x += finalSpeed;

        // Wrap around viewport boundaries cleanly
        const padding = cloud.width;
        if (cloud.x > dimensions.width + padding) {
          cloud.x = -padding;
        } else if (cloud.x < -padding) {
          cloud.x = dimensions.width + padding;
        }

        // 2. Float Bobbing (Sine wave)
        const bobOffset = Math.sin(time * cloud.bobFrequency + cloud.id) * cloud.bobMagnitude;

        // 3. Scroll Parallax (fades/floats up when scrolling)
        const parallaxY = -currentScrollY * cloud.parallaxFactor * 0.35;

        // 4. Cursor Repulsion (dynamic air pocket pushes clouds away)
        let repulsionX = 0;
        let repulsionY = 0;
        const cloudCenterX = cloud.x + cloud.width / 2;
        const cloudCenterY = cloud.baseY + bobOffset + parallaxY + (cloud.width * 0.3); // center estimation
        
        const dx = mouse.x - cloudCenterX;
        const dy = mouse.y - cloudCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const repulsionRadius = 180;

        if (distance < repulsionRadius && distance > 5) {
          const force = (1 - distance / repulsionRadius) * 22; // max push of 22px
          const forceAngle = Math.atan2(dy, dx);
          repulsionX = -Math.cos(forceAngle) * force;
          repulsionY = -Math.sin(forceAngle) * force;
        }

        // 5. Sway Rotation (Angle tilts relative to speed, swipe gusts, and repulsion)
        const targetAngle = (finalSpeed - cloud.speed) * 12 + (repulsionX * -0.15);
        cloud.angle += (targetAngle - cloud.angle) * 0.1; // Smooth interpolation (lerp)

        // 6. Assemble positions
        const renderX = cloud.x + repulsionX;
        const renderY = cloud.baseY + bobOffset + parallaxY + repulsionY;

        // 7. Write to style direct (GPU accelerated translate3d)
        el.style.transform = `translate3d(${renderX}px, ${renderY}px, 0px) rotate(${cloud.angle}deg)`;
      });

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animId);
      if (parent) {
        parent.removeEventListener("mousemove", onMouseMove);
        parent.removeEventListener("mouseleave", onMouseLeave);
      }
      window.removeEventListener("scroll", onScroll);
    };
  }, [dimensions]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-hidden select-none hidden md:block"
      style={{
        zIndex: 28, // Below navigation arrows and dropdowns
      }}
    >
      {cloudsConfig.map((cloud, idx) => (
        <div
          key={cloud.id}
          ref={(el) => (domRefs.current[idx] = el)}
          className="absolute left-0 top-0 pointer-events-none will-change-transform"
          style={{
            width: `${cloud.width}px`,
            opacity: cloud.opacity,
            filter: cloud.blur ? `blur(${cloud.blur})` : undefined,
            transition: "opacity 0.5s ease",
          }}
        >
          <img
            src={cloud.image}
            alt=""
            className="w-full h-auto object-contain select-none pointer-events-none"
            draggable={false}
          />
        </div>
      ))}
    </div>
  );
}
