import { ShoppingBag } from "lucide-react";
import {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";

const BRAND = "#08665F";

function openCartSheet() {
  window.dispatchEvent(new CustomEvent("open-cart-sheet"));
}

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({
        id,
        title,
        description,
        action,
        duration = 5000,
        open,
        onOpenChange,
        variant,
        ...props
      }) {
        const isCartToast = title === "Added to cart" || variant === "cart";
        const toastDuration = isCartToast ? duration || 6000 : duration;

        return (
          <Toast
            key={id}
            open={open}
            onOpenChange={onOpenChange}
            duration={toastDuration}
            variant={variant === "cart" ? "default" : variant}
            data-cart-toast={isCartToast ? "true" : undefined}
            className={isCartToast ? "cart-add-toast" : undefined}
            {...props}
          >
            {isCartToast && (
              <div
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg max-sm:h-7 max-sm:w-7 sm:h-9 sm:w-9"
                style={{ backgroundColor: BRAND }}
                aria-hidden
              >
                <ShoppingBag className="h-3.5 w-3.5 text-white sm:h-4 sm:w-4" strokeWidth={2.25} />
              </div>
            )}

            <div className={isCartToast ? "max-sm:grid max-sm:gap-0 sm:grid sm:gap-1 sm:flex-1" : "grid gap-1"}>
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription className={isCartToast ? "max-sm:hidden sm:block" : undefined}>
                  {description}
                </ToastDescription>
              )}
            </div>

            {isCartToast && !action && (
              <ToastAction
                altText="View cart"
                className="hidden sm:inline-flex bg-[#08665F] text-white hover:brightness-95 focus:ring-[#08665F]"
                onClick={openCartSheet}
              >
                View cart
              </ToastAction>
            )}

            {action}
            <ToastClose />

            <span
              className="pointer-events-none absolute bottom-1 left-3 right-3 hidden h-[2px] overflow-hidden rounded-full bg-[#08665F]/15 max-sm:block"
              aria-hidden
            >
              <span
                className="block h-full origin-left rounded-full bg-[#08665F]"
                style={{
                  animation: `toast-progress ${toastDuration}ms linear forwards`,
                }}
                onAnimationEnd={() => onOpenChange?.(false)}
              />
            </span>
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
