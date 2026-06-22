import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import UserCartItemsContent from "./cart-items-content";

const ACCENT = "#08665F";

function UserCartWrapper({ cartItems, setOpenCartSheet }) {
  const navigate = useNavigate();

  const items = Array.isArray(cartItems) ? cartItems : cartItems?.items || [];

  const totalCartAmount =
    items && items.length > 0
      ? items.reduce((sum, currentItem) => {
          const priceToUse =
            currentItem?.salePrice && currentItem.salePrice > 0
              ? Number(currentItem.salePrice)
              : Number(currentItem?.price || 0);
          const qty = Number(currentItem?.quantity || 0);
          return sum + priceToUse * qty;
        }, 0)
      : 0;

  const formatINR = (value) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(Number(value || 0));

  const isCartEmpty = !items || items.length === 0;

  return (
    <SheetContent
      className="sm:max-w-md w-full max-w-full px-4 sm:px-6 md:px-8 flex flex-col h-full"
      style={{ zIndex: 99999 }}
    >
      <SheetHeader className="relative flex items-center justify-center">
        <SheetTitle className="font-semibold tracking-tight text-lg sm:text-xl md:text-2xl">
          Your Cart
        </SheetTitle>
      </SheetHeader>

      <div className="mt-6 sm:mt-8 flex-1 overflow-y-auto space-y-4 pr-2">
        {items && items.length > 0 ? (
          items.map((item) => (
            <UserCartItemsContent key={item.productId || item.id} cartItem={item} />
          ))
        ) : (
          <p className="text-sm sm:text-base text-muted-foreground text-center mt-10">
            Your cart is empty
          </p>
        )}
      </div>

      <div className="mt-4 sm:mt-6 border-t pt-4 flex flex-col gap-4">
        <div className="flex justify-between text-base sm:text-lg">
          <span className="font-semibold">Total</span>
          <span className="font-bold text-[var(--accent)] text-base sm:text-lg">
            {formatINR(totalCartAmount)}
          </span>
        </div>

        <Button
          onClick={() => {
            if (isCartEmpty) return;
            navigate("/checkout");
            setOpenCartSheet(false);
          }}
          disabled={isCartEmpty}
          className={`w-full bg-[var(--accent)] hover:bg-[#06594f] text-white font-medium shadow-md hover:shadow-lg transition py-2 sm:py-3 text-sm sm:text-base ${
            isCartEmpty ? "opacity-50 cursor-not-allowed hover:shadow-none hover:bg-[var(--accent)]" : ""
          }`}
          style={{ ["--accent"]: ACCENT }}
          aria-disabled={isCartEmpty}
        >
          Checkout
        </Button>
      </div>
    </SheetContent>
  );
}

export default UserCartWrapper;
