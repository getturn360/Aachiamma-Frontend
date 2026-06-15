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
      navigate,
      productId,
      quantity,
      productObj,
      fromPath: location.pathname,
    }).then((data) => {
      if (data?.redirectedToLogin) return;
      if (data?.payload?.success) {
        toast({ title: "Product added to cart" });
      } else {
        const msg = data?.payload?.message || "Failed to add product to cart";
        toast({ title: msg, variant: "destructive" });
      }
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
        {filteredProducts.length === 0 ? (
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
