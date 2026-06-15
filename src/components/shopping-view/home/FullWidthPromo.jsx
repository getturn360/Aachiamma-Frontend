import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import bannerImg from "@/assets/feature-hero.jpg";

const ACCENT = "#08665F";
const PROMO_BG = "#5b1f18";
const PROMO_TAN = "#C28A4D";

export default function FullWidthPromo() {
  const navigate = useNavigate();
  return (
    <section aria-label="Featured hero promo" className="w-full">
      <div className="w-full grid grid-cols-1 min-[1512px]:grid-cols-2">
        <div className="relative order-1 min-[1440px]:order-1">
          <div className="w-full flex items-center justify-center" style={{ background: PROMO_TAN }}>
            <img src={bannerImg} alt="hero product" className="object-contain select-none " draggable={false} loading="lazy" />
          </div>
        </div>

        <div className="order-2 min-[1440px]:order-2 flex items-center" style={{ background: PROMO_BG }}>
          <div className="w-full px-4 sm:px-12 py-8 md:py-20 md:px-12 lg:px-20 text-white max-w-3xl mx-auto">
            <h2 className="font-extrabold tracking-tight leading-tight mb-4" style={{ fontSize: "clamp(20px, 3.2vw, 44px)" }}>
              One Pinch. Total Punch!
            </h2>
            <p className="opacity-95 mb-6" style={{ fontSize: "clamp(14px, 1.6vw, 18px)" }}>
              Bring your sambar to life with just a pinch! Aachiamma’s Sambar Powder is packed with the authentic flavours of hand-picked spices, roasted and blended to perfection — just like grandma’s secret recipe.
            </p>
            <ul className="mb-6 space-y-2" style={{ fontSize: "clamp(13px, 1.4vw, 16px)" }}>
              <li className="font-semibold">✨ No shortcuts. Just tradition in every bite.</li>
              <li className="font-semibold">✨ Pure spices. Big flavour. Happy hearts.</li>
            </ul>
            <p className="font-semibold mb-6" style={{ fontSize: "clamp(13px, 1.4vw, 16px)" }}>
              Experience the taste of tradition, made with love just for you!
            </p>
            <div>
              <Button className="uppercase px-6 py-2 shadow-md" style={{ background: ACCENT, color: "#fff" }} onClick={() => navigate("/about")}>
                READ MORE
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
