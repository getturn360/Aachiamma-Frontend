import React from "react";
import val1 from "@/assets/honest journey.2.png";
import val2 from "@/assets/honest journey 1.png";
import val3 from "@/assets/honest journey 3.png";
import val4 from "@/assets/honest journey 4.png";
import SectionTitle from "./SectionTitle";

export default function ValuesSection() {
  const values = [
    {
      id: "authenticity",
      title: "Handpicked at Source",
      image: val1,
      desc: " We collect fresh vegetables and ingredients from local farms to ensure the quality, taste, and authenticity.",
    },
    {
      id: "experience",
      title: "Agraharam Recipes ",
      image: val2,
      desc: "Every product is cooked based on the special Agraharam cooking style that has been passed down through generations.",
    },
    {
      id: "sustainability",
      title: "Same-Day Packing",
      image: val3,
      desc: "We don't use any preservatives or artificial flavours. So, we pack the food on the same day it is cooked to ensure its purity and freshness. ",
    },
    {
      id: "purpose",
      title: "Traditional Kerala Food",
      image: val4,
      desc: "All our products are handmade with care to ensure the authentic Kerala taste.",
    },
  ];

  return (
    <section aria-label="Our values" className="relative w-full bg-[#EDF7F5] py-16 lg:py-24 overflow-hidden">
      <div className="relative w-full mx-auto">
        <div className="mb-12 lg:mb-20">
          <SectionTitle text="THE HONEST JOURNEY" />
          <p className="text-gray-700 max-w-2xl mx-auto text-center text-lg md:text-xl font-medium tracking-wide px-4 -mt-4">
            Follow the path of our ingredients from their roots to your table.
          </p>
        </div>

        {/* Global Styles for the Journey Scroll */}
        <style dangerouslySetInnerHTML={{__html: `
          .hide-scrollbar::-webkit-scrollbar { display: none; }
          .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}} />

        {/* Horizontal Journey Flow (Desktop) / Vertical Stack (Mobile) */}
        <div className="w-full overflow-x-hidden md:overflow-x-auto md:snap-x md:snap-mandatory pb-12 pt-4 hide-scrollbar flex justify-center md:justify-start 2xl:justify-center">
          <div className="flex flex-col md:flex-row items-center md:items-start w-full md:w-max px-6 md:px-12 gap-12 md:gap-24">
            {values.map((v, index) => (
              <div key={v.id} className="relative max-w-[300px] w-full md:w-[320px] md:snap-center flex flex-col shrink-0 group">
                
                {/* Image Container - Bottom-aligned so all illustrations sit on the same "floor" */}
                <div className="relative z-20 w-full h-[200px] md:h-[240px] flex items-end justify-center mb-6">
                  <img 
                    src={v.image} 
                    alt={v.title} 
                    className="max-w-full max-h-full object-contain" 
                    draggable={false} 
                    loading="lazy" 
                  />
                </div>

                {/* Text Content */}
                <div className="relative z-20 text-center px-2 mt-2 flex flex-col flex-grow">
                  {/* Title Block - Top-aligned so 1-line and 2-line titles start at the exact same height */}
                  <div className="min-h-[3.5rem] md:min-h-[4rem] flex items-start justify-center mb-3 pt-1">
                    <h3 className="font-extrabold text-[#08665F] text-[18px] md:text-[22px] leading-tight">{v.title}</h3>
                  </div>
                  <p className="text-gray-700 text-sm md:text-base leading-relaxed font-normal">{v.desc}</p>
                </div>

                {/* Connecting Curved Arrow (Desktop) */}
                {index < values.length - 1 && (
                  <div className="hidden md:flex absolute top-[120px] -right-[96px] w-[96px] h-0 items-center justify-center z-10 -translate-y-1/2 pointer-events-none opacity-80">
                    <svg viewBox="0 0 100 50" className="w-[140%] overflow-visible">
                      {index % 2 === 0 ? (
                        <>
                          <path d="M 0 25 C 30 -15, 60 25, 95 25" fill="none" stroke="#08665F" strokeWidth="4" strokeDasharray="8 8" strokeLinecap="round" />
                          <path d="M 80 13 L 96 25 L 80 37" fill="none" stroke="#08665F" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                        </>
                      ) : (
                        <>
                          <path d="M 0 25 C 30 65, 60 25, 95 25" fill="none" stroke="#08665F" strokeWidth="4" strokeDasharray="8 8" strokeLinecap="round" />
                          <path d="M 80 13 L 96 25 L 80 37" fill="none" stroke="#08665F" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                        </>
                      )}
                    </svg>
                  </div>
                )}
                
                {/* Connecting Downward Arrow (Mobile) */}
                {index < values.length - 1 && (
                  <div className="flex md:hidden justify-center items-center w-full mt-6 -mb-4 pointer-events-none opacity-60">
                    <svg width="24" height="40" viewBox="0 0 24 40" fill="none">
                       <path d="M12 0 L12 40 M4 32 L12 40 L20 32" stroke="#08665F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 4"/>
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
