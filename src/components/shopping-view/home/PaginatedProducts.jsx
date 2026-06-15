import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";

const ACCENT = "#08665F";

export default function PaginatedProducts({
  products = [],
  pageSize = 4,
  renderProduct,
  sectionId = "paginated",
}) {
  const [page, setPage] = useState(0);

  const productIdsKey = useMemo(
    () => products.map((p) => p._id || p.id).join("|"),
    [products]
  );

  useEffect(() => {
    setPage(0);
  }, [productIdsKey]);

  if (!products || products.length === 0) return null;

  const totalPages = Math.ceil(products.length / pageSize);
  const start = page * pageSize;
  const end = start + pageSize;
  const visible = products.slice(start, end);

  const goPrev = () => setPage((p) => Math.max(0, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages - 1, p + 1));

  return (
    <div id={sectionId}>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
        {visible.map((product) => (
          <div key={product._id || product.id} className="transform hover:-translate-y-2 transition">
            {renderProduct(product)}
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="w-full mt-4 sm:mt-6 flex items-center justify-center gap-3 sm:gap-4">
          <Button
            onClick={goPrev}
            disabled={page === 0}
            className="px-4 py-2"
            style={{
              background: page === 0 ? "#F3F4F6" : ACCENT,
              color: page === 0 ? "#9CA3AF" : "#fff",
              border: `1px solid ${ACCENT}22`,
            }}
            aria-label="Previous products"
          >
            Prev
          </Button>

          <div className="text-sm font-semibold text-gray-600 self-center">
            {page + 1} / {totalPages}
          </div>

          <Button
            onClick={goNext}
            disabled={page === totalPages - 1}
            className="px-4 py-2"
            style={{
              background: page === totalPages - 1 ? "#F3F4F6" : ACCENT,
              color: page === totalPages - 1 ? "#9CA3AF" : "#fff",
              border: `1px solid ${ACCENT}22`,
            }}
            aria-label="Next products"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
