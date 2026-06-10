import React, { useEffect, useState } from "react";
import api from "@/api/axios";
import { Link } from "react-router-dom";


export default function CategoriesSticky({ max = 10 }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        const res = await api.get("/api/common/categories/get?sticky=true");
        if (!mounted) return;
        if (res.data && res.data.success) {
          setCategories((res.data.categories || []).slice(0, max));
        }
      } catch (e) {
        /* categories optional */
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [max]);

  if (loading) {
    return <div className="py-2 px-4">Loading categories…</div>;
  }

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <nav
      className="w-full border-b bg-white"
      aria-label="Categories"
    >
      <div
        className="overflow-x-auto"
        style={{
          WebkitOverflowScrolling: "touch",
        }}
      >
        <div
          className="flex gap-3 items-center px-4 py-2"
          style={{
            minWidth: "max-content",
            flexWrap: "nowrap",
            scrollSnapType: "x mandatory",
          }}
          role="tablist"
          aria-label="Categories list"
        >
          {categories.map((c) => (
            <Link
              to={`/listing?category=${encodeURIComponent(c.slug)}`}
              key={c._id}
              className="inline-flex items-center gap-2 px-3 py-2 bg-white border rounded-full shadow-sm hover:shadow-md transition flex-shrink-0 whitespace-nowrap"
              role="tab"
              aria-label={c.name}
              title={c.name}
              style={{ scrollSnapAlign: "start" }}
            >
              <span className="text-sm font-medium">{c.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
