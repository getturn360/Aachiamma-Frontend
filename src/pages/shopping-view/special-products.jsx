import { useEffect, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllFilteredProducts } from "@/store/shop/products-slice";
import { addProductToCart } from "@/lib/add-to-cart";
import { useToast } from "@/components/ui/use-toast";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { ROUTES } from "@/config/routes";

const ACCENT = "#08665F";

export default function SpecialProductsPage() {
  const { type } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { toast } = useToast();

  const { productList, isLoading } = useSelector((state) => state.shopProducts);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    // Fetch all products if they aren't already fetched
    dispatch(
      fetchAllFilteredProducts({
        filterParams: {},
        sortParams: "price-lowtohigh",
      })
    );
  }, [dispatch]);

  // Determine metadata based on type
  const collectionInfo = useMemo(() => {
    switch (type) {
      case "trending":
        return {
          title: "Trending Collection",
          tag: "trending",
          gradient: "from-amber-500/10 via-orange-500/5 to-transparent",
        };
      case "best-selling":
        return {
          title: "Best Sellers",
          tag: "best-selling",
          gradient: "from-yellow-500/10 via-amber-500/5 to-transparent",
        };
      case "new-arrival":
        return {
          title: "New Arrivals",
          tag: "new-arrival",
          gradient: "from-teal-600/10 via-emerald-500/5 to-transparent",
        };
      case "coming-soon":
        return {
          title: "Coming Soon",
          tag: "coming-soon",
          gradient: "from-amber-500/10 via-orange-500/5 to-transparent",
        };
      default:
        return {
          title: "Special Collection",
          tag: type,
          gradient: "from-slate-500/10 via-slate-400/5 to-transparent",
        };
    }
  }, [type]);

  // Filter products matching this special category
  const filteredProducts = useMemo(() => {
    if (!productList || !Array.isArray(productList)) return [];
    return productList.filter(
      (product) =>
        product?.isAvailable !== false &&
        Array.isArray(product.special) &&
        product.special.includes(collectionInfo.tag)
    );
  }, [productList, collectionInfo.tag]);

  const handleGetProductDetails = (productId) => {
    navigate(ROUTES.product(productId));
  };

  const handleAddtoCart = (productId, quantity = 1, productObj = null) => {
    addProductToCart({
      dispatch,
      user,
      productId,
      quantity,
      productObj,
      toast,
    });
  };

  if (isLoading && (!productList || productList.length === 0)) {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: ACCENT }} />
        <p className="text-gray-500 text-sm font-medium">Loading collection...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] bg-gray-50/50 pb-16">
      {/* Premium Hero Banner */}
      <div className={`w-full bg-gradient-to-b ${collectionInfo.gradient} border-b border-gray-100 py-12 md:py-16 px-4`}>
        <div className="max-w-6xl mx-auto flex flex-col items-start gap-4">
          <Button
            onClick={() => navigate(ROUTES.listing)}
            className="flex items-center gap-2 text-white transition-all font-semibold shadow-md px-4 py-2 rounded-lg hover:opacity-90"
            style={{ background: ACCENT }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Products</span>
          </Button>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-wider mt-2 w-full text-center" style={{ color: ACCENT }}>
            {collectionInfo.title}
          </h1>
        </div>
      </div>

      {/* Product Grid */}
      <div className="max-w-6xl mx-auto px-4 mt-8 md:mt-12">
        {type === "coming-soon" ? (
          <div>
            <div className="mb-6 flex justify-between items-center text-sm text-gray-500 font-medium">
              <span>Exciting New Products Arriving Shortly</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* Static Demo Tile - Malli Kappi */}
              <div className="relative group rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm opacity-90 pointer-events-none flex flex-col h-full">
                {/* Coming soon badge */}
                <div className="absolute top-3 left-3 z-20">
                  <span className="bg-amber-400 text-slate-900 text-[10px] sm:text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wide shadow-sm">Coming Soon</span>
                </div>
                <div className="aspect-square bg-slate-50 flex items-center justify-center p-6 border-b border-gray-50 relative overflow-hidden">
                   {/* Placeholder visual */}
                   <div className="absolute inset-0 bg-gradient-to-tr from-slate-100 to-slate-50"></div>
                   
                </div>
                <div className="p-4 flex flex-col gap-2 flex-grow bg-white">
                  <h3 className="font-bold text-gray-800 text-sm md:text-base line-clamp-1">Malli Kappi</h3>
                 
                </div>
              </div>

              {/* Static Demo Tile - Turmeric Powder */}
              <div className="relative group rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm opacity-90 pointer-events-none flex flex-col h-full">
                {/* Coming soon badge */}
                <div className="absolute top-3 left-3 z-20">
                  <span className="bg-amber-400 text-slate-900 text-[10px] sm:text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wide shadow-sm">Coming Soon</span>
                </div>
                <div className="aspect-square bg-slate-50 flex items-center justify-center p-6 border-b border-gray-50 relative overflow-hidden">
                   {/* Placeholder visual */}
                   <div className="absolute inset-0 bg-gradient-to-tr from-slate-100 to-slate-50"></div>
                  
                </div>
                <div className="p-4 flex flex-col gap-2 flex-grow bg-white">
                  <h3 className="font-bold text-gray-800 text-sm md:text-base line-clamp-1">Turmeric Powder</h3>
                 
                </div>
              </div>

              {/* Static Demo Tile - Chilli Powder */}
              <div className="relative group rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm opacity-90 pointer-events-none flex flex-col h-full">
                {/* Coming soon badge */}
                <div className="absolute top-3 left-3 z-20">
                  <span className="bg-amber-400 text-slate-900 text-[10px] sm:text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wide shadow-sm">Coming Soon</span>
                </div>
                <div className="aspect-square bg-slate-50 flex items-center justify-center p-6 border-b border-gray-50 relative overflow-hidden">
                   {/* Placeholder visual */}
                   <div className="absolute inset-0 bg-gradient-to-tr from-slate-100 to-slate-50"></div>
                  
                </div>
                <div className="p-4 flex flex-col gap-2 flex-grow bg-white">
                  <h3 className="font-bold text-gray-800 text-sm md:text-base line-clamp-1">Chilli Powder</h3>
                 
                </div>
              </div>
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm px-6">
            <p className="text-gray-500 text-lg font-medium">
              No products found in the {collectionInfo.title}.
            </p>
            <Button
              className="mt-4 text-white uppercase font-bold"
              style={{ background: ACCENT }}
              onClick={() => navigate(ROUTES.listing)}
            >
              Explore All Products
            </Button>
          </div>
        ) : (
          <div>
            <div className="mb-6 flex justify-between items-center text-sm text-gray-500 font-medium">
              <span>Showing {filteredProducts.length} items</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.map((product) => (
                <div key={product._id || product.id} className="transform hover:-translate-y-1 transition duration-300 h-full flex flex-col">
                  <ShoppingProductTile
                    product={product}
                    handleGetProductDetails={handleGetProductDetails}
                    handleAddtoCart={handleAddtoCart}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
