import { useState, useEffect, useRef } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import SectionTitle from "./SectionTitle";

import t1 from "@/assets/t1.jpg";
import t2 from "@/assets/t2.jpg";
import t3 from "@/assets/t3.jpg";
import t4 from "@/assets/t4.jpg";
import t5 from "@/assets/t5.jpg";
import hi2 from "@/assets/h-i2.png";

const ACCENT = "#08665F";

export default function TestimonialSlider() {
  const testimonials = [
    {
      avatar: t1,
      rating: 5,
      quote:
        "I never imagined I would enjoy bitter gourd this much until I tried this pickle! It strikes the perfect balance of traditional taste and unique flavor, turning an everyday meal into something special. Highly recommended for anyone looking to add a healthy twist to their meals!",
      name: "Silpa S Nair, Manager, HP Inc, Chennai",
    },
    { avatar: t2, rating: 5, quote: "I ordered both the jackfruit chips and rice murukku, and I must say, they exceeded my expectations! The jackfruit chips were perfectly crisp with a natural sweetness, just the way I remember from childhood trips to Kerala. The rice murukku was equally delightful - crunchy, fresh, and full of authentic homemade flavor. LUV IT!", name: "Niyathi Saji – Bangalore" },
    { avatar: t3, rating: 5, quote: "Kondattam and the Bitter Gourd Pickle have truly brought me wonder! It’s really nice and tasty.  It’s become a must-have on my dining table now. Highly recommend it to anyone who loves genuine, quality pickles.", name: "Aneesh Karunan, AVP -  iBus Networks, Kochi" },
    { avatar: t4, rating: 5, quote: "These banana chips are just perfect ... super crispy, not too oily, and have that authentic Kerala flavor you don’t find everywhere. It’s become a must-have snack at our home!", name: "Shameer Ahammed Shaik, Calicut" },
    { avatar: t5, rating: 5, quote: "The Kadumango Pickle from Aachi Amma Foods is simply amazing! Perfect balance of spices. It reminds me of what my grandmother used to make. A must-have with curd rice and meals!", name: "Nyjil Joseph, Alappuzha - Ritzee Bags" },
  ];

  const [index, setIndex] = useState(0);
  const [testiGrab, setTestiGrab] = useState(false);
  const [isWide, setIsWide] = useState(typeof window !== "undefined" ? window.innerWidth > 1200 : true);

  const testiPointerStart = useRef(null);
  const testiPointerActive = useRef(false);
  const [dragDx, setDragDx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const animatingRef = useRef(false);

  useEffect(() => {
    const onResize = () => setIsWide(typeof window !== "undefined" ? window.innerWidth > 1200 : true);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const startDrag = (clientX) => {
    testiPointerActive.current = true;
    testiPointerStart.current = clientX;
    setTestiGrab(true);
    setIsDragging(true);
  };

  const onPointerDown = (e) => {
    if (animatingRef.current) return;
    const clientX = e.clientX ?? (e.touches && e.touches[0] && e.touches[0].clientX);
    startDrag(clientX);
    if (e.target && e.pointerId && e.target.setPointerCapture) {
      try {
        e.target.setPointerCapture(e.pointerId);
      } catch (err) { }
    }
  };

  const onPointerMove = (e) => {
    if (!testiPointerActive.current || testiPointerStart.current == null) return;
    const clientX = e.clientX ?? (e.touches && e.touches[0] && e.touches[0].clientX);
    const dx = clientX - testiPointerStart.current;
    setDragDx(dx);
  };

  const finishSwipe = (endX) => {
    if (!testiPointerActive.current || testiPointerStart.current == null) {
      testiPointerActive.current = false;
      testiPointerStart.current = null;
      setIsDragging(false);
      setDragDx(0);
      setTestiGrab(false);
      return;
    }
    const dx = endX - testiPointerStart.current;
    const threshold = 80; 
    if (Math.abs(dx) >= threshold) {
      animatingRef.current = true;
      if (dx > 0) {
        setIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
      } else {
        setIndex((prev) => (prev + 1) % testimonials.length);
      }
  
      setTimeout(() => {
        setDragDx(0);
        animatingRef.current = false;
      }, 360);
    } else {
    
      setDragDx(0);
    }
    testiPointerActive.current = false;
    testiPointerStart.current = null;
    setIsDragging(false);
    setTestiGrab(false);
  };

  const onPointerUp = (e) => {
    const endX = e.clientX ?? (e.changedTouches && e.changedTouches[0] && e.changedTouches[0].clientX);
    finishSwipe(endX);
    if (e.target && e.pointerId && e.target.releasePointerCapture) {
      try {
        e.target.releasePointerCapture(e.pointerId);
      } catch (err) { }
    }
  };

  const onTouchStartTesti = (e) => {
    if (animatingRef.current) return;
    startDrag(e.touches[0].clientX);
  };

  const onTouchMoveTesti = (e) => {
    onPointerMove(e);
  };

  const onTouchEndTesti = (e) => {
    const endX = e.changedTouches[0].clientX;
    finishSwipe(endX);
  };

  const onPointerCancelOrLeave = () => {
    testiPointerActive.current = false;
    testiPointerStart.current = null;
    setIsDragging(false);
    setDragDx(0);
    setTestiGrab(false);
  };

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rotateDeg = clamp(dragDx / 25, -8, 8); 
  const scaleVal = isDragging ? 0.985 : 1;
  const opacityVal = clamp(1 - Math.abs(dragDx) / 600, 0.18, 1); 

  const wrapperStyle = {
    transform: `translateX(${dragDx}px) rotate(${rotateDeg}deg) scale(${scaleVal})`,
    transition: isDragging || animatingRef.current ? "none" : "transform 360ms cubic-bezier(.2,.9,.2,1), opacity 360ms ease",
    opacity: opacityVal,
    cursor: testiGrab ? "grabbing" : "grab",
    willChange: "transform, opacity",
  };

  return (
    <section aria-label="Customer testimonials" className="bg-[#F5F1E5]">
      <div className="w-full mx-auto px-2 sm:px-4 py-8 md:py-12" style={{ paddingBottom: 0 }}>
        <SectionTitle text="WHAT OUR CUSTOMERS ARE SAYING" />

        <div
          className="relative w-full text-center overflow-visible"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancelOrLeave}
          onTouchStart={onTouchStartTesti}
          onTouchMove={onTouchMoveTesti}
          onTouchEnd={onTouchEndTesti}
          onMouseLeave={onPointerCancelOrLeave}
          style={{ touchAction: "pan-y" }}
          role="region"
          aria-roledescription="carousel"
          aria-label="Customer testimonials"
        >
          <div className="w-full min-h-[300px] sm:min-h-[340px] md:min-h-[380px] lg:min-h-[440px] relative bg-transparent flex flex-col items-center justify-center px-4">
            
            <div className="flex flex-col items-center justify-center px-3 sm:px-6" style={wrapperStyle}>
              <div className="flex items-center justify-center -mt-8">
                <div className="w-20 sm:w-24 md:w-28 rounded-full overflow-hidden shadow-md bg-transparent transform transition-transform">
                  <img src={testimonials[index].avatar} alt={`avatar-${index + 1}`} className="w-full h-full object-cover" draggable={false} loading="lazy" />
                </div>
              </div>

              <div className="mt-3 flex justify-center gap-1" aria-hidden>
                {Array.from({ length: testimonials[index].rating }).map((_, i) => (
                  <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill={ACCENT} xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.402 8.168L12 18.896l-7.336 3.856 1.402-8.168L.132 9.21l8.2-1.192L12 .587z" />
                  </svg>
                ))}
              </div>

              <blockquote className="mt-3 leading-relaxed italic text-gray-600 text-sm md:text-base text-center max-w-[920px]">
                “{testimonials[index].quote}”
              </blockquote>

              <div className="mt-3 font-semibold text-sm text-gray-700">{testimonials[index].name}</div>

              <div className="mt-4 flex items-center justify-center gap-3" role="tablist" aria-label="testimonial dots">
                {testimonials.map((_, i) => {
                  const active = i === index;
                  return (
                    <button
                      key={i}
                      aria-label={`Go to testimonial ${i + 1}`}
                      aria-selected={active}
                      onClick={() => setIndex(i)}
                      className={`rounded-full transition-transform ${active ? "scale-125" : "opacity-70"}`}
                      style={{
                        width: active ? 14 : 9,
                        height: active ? 14 : 9,
                        background: active ? ACCENT : "#D1D5DB",
                        border: active ? `2px solid ${ACCENT}` : "1px solid rgba(0,0,0,0.05)",
                        padding: 0,
                      }}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {isWide && (
            <>
              <button
                aria-label="Previous testimonial"
                onClick={() => setIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
                className="absolute left-20 sm:left-24 top-1/2 -translate-y-1/2 bg-white border rounded-full w-10 h-10 sm:w-12 sm:h-12 grid place-items-center shadow-md hover:scale-105 transition-transform"
                style={{ zIndex: 30 }}
              >
                <ChevronLeftIcon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: ACCENT }} />
              </button>

              <button
                aria-label="Next testimonial"
                onClick={() => setIndex((prev) => (prev + 1) % testimonials.length)}
                className="absolute right-20 sm:right-24 top-1/2 -translate-y-1/2 bg-white border rounded-full w-10 h-10 sm:w-12 sm:h-12 grid place-items-center shadow-md hover:scale-105 transition-transform"
                style={{ zIndex: 30 }}
              >
                <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: ACCENT }} />
              </button>
            </>
          )}
        </div>

        <div className="w-full mt-[-20px]">
          <img src={hi2} alt="testimonial decorative" className="w-full object-cover block" draggable={false} loading="lazy" />
        </div>
      </div>
    </section>
  );
}
