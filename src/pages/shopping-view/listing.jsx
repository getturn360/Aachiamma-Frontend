import React, { useEffect, useMemo, useRef, useState } from "react";
import ProductFilter from "@/components/shopping-view/filter";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { sortOptions } from "@/config";
import { addProductToCart } from "@/lib/add-to-cart";
import {
  fetchAllFilteredProducts,
  fetchProductDetails,
  setProductDetails,
} from "@/store/shop/products-slice";
import { ArrowUpDownIcon, Search, X, SlidersHorizontal } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams, useNavigate } from "react-router-dom";
import noProductsImg from "@/assets/amma-1.png";

function createSearchParamsHelper(filterParams) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filterParams || {})) {
    if (Array.isArray(value) && value.length > 0) {
      params.set(key, value.join(","));
    } else if (value != null && value !== "") {
      params.set(key, String(value));
    }
  }
  return params;
}

function normalizeFilters(raw = {}) {
  const out = {};
  for (const [k, v] of Object.entries(raw || {})) {
    if (Array.isArray(v)) {
      out[k] = v.map((x) => String(x).trim()).filter(Boolean);
    } else if (typeof v === "string") {
     
      if (v.includes(",")) {
        out[k] = v
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      } else if (v.trim() === "") {
       
      } else {
        out[k] = [v.trim()];
      }
    } else if (v == null) {
 
    } else {
   
      out[k] = [String(v)];
    }
  }
  return out;
}

export default function ShoppingListing() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { productList, productDetails, loading: productsLoading } = useSelector(
    (state) => state.shopProducts
  );
  const { cartItems } = useSelector((state) => state.shopCart);
  const { user } = useSelector((state) => state.auth);

  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [query, setQuery] = useState("");
  const { toast } = useToast();

  const [showFilters, setShowFilters] = useState(false);

  const initialized = useRef(false);

  const skipUrlSyncRef = useRef(false);

  useEffect(() => {
    dispatch(setProductDetails());
  }, [dispatch]);

  useEffect(() => {

    const sp = Object.fromEntries([...searchParams.entries()]);
    const hasUrlParams = Object.keys(sp).length > 0;

    let initial = {};
    if (hasUrlParams) {
      initial = normalizeFilters(sp);
    } else {
      
      try {
        const saved = JSON.parse(sessionStorage.getItem("filters")) || {};
        initial = normalizeFilters(saved);
      } catch (e) {
      console.error("[listing.jsx] Error:", e);
        initial = {};
      }
    }

    setFilters(initial);

    if (sort == null) setSort("price-lowtohigh");

    initialized.current = true;
 
  }, []); 

  useEffect(() => {
    
    if (!initialized.current) return;

    const entries = Object.fromEntries([...searchParams.entries()]);
    const { _, __, ...relevant } = entries;

    const newFilters = normalizeFilters(relevant || {});
    const cur = JSON.stringify(filters || {});
    const next = JSON.stringify(newFilters || {});
    if (cur !== next) {
    
      skipUrlSyncRef.current = true;
      setFilters(newFilters);
      try {
        sessionStorage.setItem("filters", JSON.stringify(newFilters));
      } catch (e) {
      console.error("[listing.jsx] Error:", e);
    }
    }
   
  }, [searchParams]);

  useEffect(() => {
    try {
      sessionStorage.setItem("filters", JSON.stringify(filters || {}));
    } catch (err) {
      console.error("[listing.jsx] Error:", err);
    }
  }, [filters]);

  useEffect(() => {
   
    if (!initialized.current) return;

    if (skipUrlSyncRef.current) {
      skipUrlSyncRef.current = false;
      return;
    }

    if (filters && Object.keys(filters).length > 0) {
      const params = createSearchParamsHelper(filters);
      setSearchParams(params);
    } else {
      
      setSearchParams(new URLSearchParams());
    }
 
  }, [filters]);

  useEffect(() => {
    if (filters && sort) {
    
      dispatch(fetchAllFilteredProducts({ filterParams: filters, sortParams: sort }));
    }
  }, [filters, sort, dispatch]);

  useEffect(() => {
    if (productDetails) setOpenDetailsDialog(true);
  }, [productDetails]);

  const handleSort = (value) => setSort(value);

  const handleFilter = (sectionId, option) => {
    setFilters((prev) => {
      const copy = { ...(prev || {}) };

      if (sectionId === "category") {
        if (copy[sectionId] && copy[sectionId].includes(option)) {
          delete copy[sectionId];
        } else {
          copy[sectionId] = [option];
        }
        return copy;
      }

      const existing = copy[sectionId];

      let arr = [];
      if (Array.isArray(existing)) arr = [...existing];
      else if (typeof existing === "string") arr = existing.split(",").map((s) => s.trim()).filter(Boolean);
      else if (existing == null) arr = [];
      else arr = [String(existing)];

      const idx = arr.indexOf(option);
      if (idx === -1) {
        arr.push(option);
      } else {
        arr.splice(idx, 1);
      }

      if (arr.length === 0) delete copy[sectionId];
      else copy[sectionId] = arr;
      return copy;
    });
  };

  const handleGetProductDetails = (productOrId) => {
    const id = productOrId && productOrId._id ? productOrId._id : productOrId;
    const state = productOrId && productOrId._id ? { product: productOrId } : undefined;
    navigate(`/product/${id}`, { state });
  };

  const handleAddtoCart = (productId, stock, productObj = null) => {
    addProductToCart({
      dispatch,
      user,
      productId,
      quantity: 1,
      productObj,
    }).then((data) => {
      if (data?.payload?.success) {
        toast({ title: "Product added to cart" });
      } else {
        const msg = data?.payload?.message || "Failed to add product to cart";
        toast({ title: msg, variant: "destructive" });
      }
    });
  };

  const filteredList = useMemo(() => {
    if (!productList) return [];
    if (!query.trim()) return productList;
    const q = query.trim().toLowerCase();
    return productList.filter(
      (p) =>
        p.title?.toLowerCase().includes(q) ||
        p.description?.toLowerCase()?.includes(q) ||
        p.brand?.toLowerCase()?.includes(q)
    );
  }, [productList, query]);

  const selectedCategoryChips = (filters && Array.isArray(filters.category)) ? filters.category : [];

  return (
    <div className="p-4 md:p-6 mt-[30px] mb-[25px] bg-gray-50 min-h-[60vh]">
      <div className="mx-auto grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">

        <aside className="hidden md:block bg-white rounded-2xl sticky top-28 border-gray-100 w-full overflow-y-auto max-h-[calc(100vh-120px)]">
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Filters</h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setFilters({});
                  sessionStorage.removeItem("filters");
                }}
              >
                Reset
              </Button>
            </div>

            <ProductFilter filters={filters} handleFilter={handleFilter} />

            <div className="mt-4">
              <h4 className="text-xs text-gray-500 uppercase mb-2">Active</h4>
              <div className="flex flex-wrap gap-2">
                {Object.keys(filters).length === 0 ? (
                  <span className="text-sm text-gray-400">No filters</span>
                ) : (
                  Object.entries(filters).map(([k, vals]) =>
                    (Array.isArray(vals) ? vals : [vals]).map((v) => (
                      <button
                        key={`${k}-${v}`}
                        onClick={() => handleFilter(k, v)}
                        className="px-3 py-1 bg-gray-100 rounded-full text-sm hover:bg-gray-200 transition"
                      >
                        {k}: {v}
                      </button>
                    ))
                  )
                )}
              </div>
            </div>
          </div>
        </aside>

        <section className="flex flex-col gap-4">
         
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-white rounded-2xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full">
              <div className="mr-2">
                <h2 className="text-2xl font-extrabold text-gray-800">All Products</h2>
                <p className="text-sm text-gray-500">{productList?.length ?? 0} products • curated just for you</p>
              </div>

              <div className="flex items-center gap-3 ml-0 sm:ml-4 w-full sm:w-auto">
                <div className="hidden sm:flex items-center gap-3">
                  <Input
                    placeholder="Search products, descriptions..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-[420px]"
                  />
                  <Search className="h-4 w-4 text-gray-400" />
                </div>

                <div className="flex items-center gap-2 ml-auto sm:hidden w-full">
                  <Button variant="outline" className="flex-1 flex items-center gap-2" onClick={() => setShowFilters(true)}>
                    <SlidersHorizontal className="h-4 w-4" /> Filters
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="sm:hidden w-full">
                <Input placeholder="Search..." value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <ArrowUpDownIcon className="h-4 w-4" /> Sort
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[220px]">
                  <DropdownMenuRadioGroup value={sort} onValueChange={handleSort}>
                    {sortOptions.map((s) => (
                      <DropdownMenuRadioItem key={s.id} value={s.id}>
                        {s.label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold">Selected</div>
              <div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setFilters({});
                    setQuery("");
                    sessionStorage.removeItem("filters");
                  }}
                >
                  Clear filters
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {selectedCategoryChips.length === 0 ? (
                <span className="text-sm text-gray-400">No categories selected</span>
              ) : (
                selectedCategoryChips.map((c) => (
                  <button
                    key={`chip-${c}`}
                    onClick={() => handleFilter("category", c)}
                    className="px-3 py-1 bg-gray-100 rounded-full text-sm hover:bg-gray-200 transition"
                  >
                    Category: {c}
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {productsLoading && (!productList || productList.length === 0) ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="p-4 bg-white rounded-2xl border animate-pulse h-60" />
              ))
            ) : filteredList && filteredList.length > 0 ? (
              filteredList.map((product) => (
                <div
                  key={product.id || product._id}
                  className="transition-transform duration-300 hover:-translate-y-1 h-full flex flex-col"
                >
                  <ShoppingProductTile
                    product={product}
                    handleAddtoCart={handleAddtoCart}
                    handleGetProductDetails={handleGetProductDetails}
                  />
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center flex flex-col items-center justify-center">
                <img
                  src={noProductsImg}
                  alt="No products found"
                  className="max-w-[300px] w-full h-auto object-contain mb-6 drop-shadow-lg"
                  loading="lazy"
                />
                <h3 className="text-xl font-bold mb-2">No products found</h3>
                <p className="text-sm text-gray-500 mb-6">Try adjusting your filters or explore the options below.</p>

                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Button
                    onClick={() => {
                      setFilters({});
                      setQuery("");
                      sessionStorage.removeItem("filters");
                    }}
                  >
                    Clear filters
                  </Button>
                </div>

                <p className="text-xs text-gray-400 mt-3">Tip: try removing or changing filters, or search with broader keywords.</p>
              </div>
            )}
          </div>
        </section>
      </div>

      <div
        className={`fixed inset-0 z-50 md:hidden transition-opacity ${showFilters ? "" : "pointer-events-none"}`}
        aria-hidden={!showFilters}
      >
       
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity ${showFilters ? "opacity-100" : "opacity-0"}`}
          onClick={() => setShowFilters(false)}
        />

        <aside
          className={`fixed right-0 top-0 h-full w-full bg-white shadow-2xl transform transition-transform ${
            showFilters ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-bold">Filters</h3>
            <Button variant="ghost" onClick={() => setShowFilters(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="p-4 overflow-y-auto h-[calc(100vh-64px)]">
            <div className="mb-4">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setFilters({});
                  sessionStorage.removeItem("filters");
                }}
              >
                Reset
              </Button>
            </div>

            <ProductFilter filters={filters} handleFilter={handleFilter} />

            <div className="mt-4">
              <h4 className="text-xs text-gray-500 uppercase mb-2">Active</h4>
              <div className="flex flex-wrap gap-2">
                {Object.keys(filters).length === 0 ? (
                  <span className="text-sm text-gray-400">No filters</span>
                ) : (
                  Object.entries(filters).map(([k, vals]) =>
                    (Array.isArray(vals) ? vals : [vals]).map((v) => (
                      <button
                        key={`${k}-${v}`}
                        onClick={() => handleFilter(k, v)}
                        className="px-3 py-1 bg-gray-100 rounded-full text-sm hover:bg-gray-200 transition"
                      >
                        {k}: {v}
                      </button>
                    ))
                  )
                )}
              </div>
            </div>

            <div className="mt-6">
              <Button className="w-full" onClick={() => setShowFilters(false)}>
                Apply & Close
              </Button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
