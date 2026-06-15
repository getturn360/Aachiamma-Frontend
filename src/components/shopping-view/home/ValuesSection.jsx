import val1 from "@/assets/v-i1.png";
import val2 from "@/assets/v-i2.png";
import val3 from "@/assets/v-i3.png";
import val4 from "@/assets/v-i4.png";

export default function ValuesSection() {
  const values = [
    {
      id: "authenticity",
      title: "Handpicked at Source",
      image: val1,
      desc: "We begin at trusted local farms — selecting only the freshest produce and purest spices. Every ingredient is chosen for quality, taste, and authenticity.",
    },
    {
      id: "experience",
      title: "Prepared the Traditional Way",
      image: val2,
      desc: "In our Agraharam kitchen, each recipe is cooked in small batches — following simple, time-honoured methods passed down through generations.",
    },
    {
      id: "sustainability",
      title: "Packed Fresh, Same Day",
      image: val3,
      desc: "Each jar is sealed the very day it’s made to lock in natural aroma and flavour. No preservatives. No artificial colours or flavours.",
    },
    {
      id: "purpose",
      title: "Shared with Care",
      image: val4,
      desc: "From our kitchen to your table, we deliver food that’s truly homemade — wholesome, safe, and filled with love.",
    },
  ];

  return (
    <section aria-label="Our values" className="w-full bg-[linear-gradient(180deg,#08665F,#0a5d54)] py-12">
      <div className="container mx-auto px-2 sm:px-4">
        <h2 className="text-center font-extrabold text-white mb-8" style={{ fontSize: "clamp(20px,2.6vw,36px)" }}>The Honest Journey</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((v) => (
            <div key={v.id} className="rounded-lg p-4 flex flex-col items-center text-center" style={{ backdropFilter: "blur(4px)" }}>
              <div className="w-full mb-4">
                <div className="aspect-[4/4] rounded-md overflow-hidden grid place-items-center">
                  <img src={v.image} alt={v.title} className="w-full h-full object-contain" draggable={false} loading="lazy" />
                </div>
              </div>

              <h3 className="font-extrabold text-white tracking-wide mb-2" style={{ fontSize: "clamp(14px,1.4vw,18px)" }}>{v.title}</h3>
              <p className="text-white/90 text-sm leading-relaxed" style={{ fontSize: "clamp(12px,1.0vw,14px)" }}>{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
