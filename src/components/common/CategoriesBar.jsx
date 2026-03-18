import React, { useEffect, useState } from "react";
import api from "@/api/axios";
import { useNavigate } from "react-router-dom";

const ACCENT = "#08665F";

export default function CategoriesBar({ max = 12 }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        const res = await api.get("/api/common/categories/get?sticky=true");
        if (!mounted) return;
        if (res && res.data && res.data.success) {
          setCategories((res.data.categories || []).slice(0, max));
        }
      } catch (e) {
        console.warn("CategoriesBar load error", e);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [max]);

  function handleNavigateToListingPage(cat) {
    if (!cat) return;
    navigate(`/shop/listing?category=${encodeURIComponent(cat.slug)}`);
    setTimeout(() => {
      try { window.scrollTo({ top: 0, behavior: "smooth" }); } catch (e) {}
    }, 60);
  }

  if (loading) {
    return (
      <div id="categories-bar" className="sticky top-6 z-0 mt-[15px]">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 overflow-x-auto py-3 no-scrollbar">
            <div className="text-sm text-gray-500 px-2">Loading categories…</div>
          </div>
        </div>
      </div>
    );
  }

  if (!categories || categories.length === 0) return null;

  return (
    <div id="categories-bar" className="sticky top-6 z-0 mt-[15px]">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-4 overflow-x-auto py-3 no-scrollbar">
          {categories.map((c) => {
            const imgSrc = c.image || c.img || null;
            return (
              <button
                key={c._id || c.slug}
                onClick={() => handleNavigateToListingPage(c)}
                className="flex-shrink-0 inline-flex items-center gap-3 px-4 py-2 rounded-2xl shadow-sm hover:shadow-md transition bg-white"
                style={{ border: `1px solid ${ACCENT}10` }}
                aria-label={`Open ${c.name}`}
              >
                {imgSrc ? (
                  <img src={imgSrc} alt={c.name} className="w-10 h-10 rounded-md object-cover" />
                ) : (
                  <div
                    className="w-10 h-10 rounded-md flex items-center justify-center font-semibold text-white"
                    style={{ background: ACCENT }}
                  >
                    {String(c.name || "").charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex flex-col text-left">
                  <span className="uppercase text-sm font-semibold" style={{ color: ACCENT }}>
                    {c.name}
                  </span>
                  <span className="text-xs text-gray-500">Explore</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
