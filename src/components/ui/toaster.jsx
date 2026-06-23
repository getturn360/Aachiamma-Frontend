import { ShoppingBag } from "lucide-react";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";

const BRAND = "#08665F";

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
        ...props
      }) {
        const isCartToast = title === "Added to cart";

        return (
          <Toast
            key={id}
            open={open}
            onOpenChange={onOpenChange}
            duration={duration}
            {...props}
          >
            {isCartToast && (
              <div
                className="hidden max-sm:flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: BRAND }}
                aria-hidden
              >
                <ShoppingBag className="h-3.5 w-3.5 text-white" strokeWidth={2.25} />
              </div>
            )}

            <div className={isCartToast ? "max-sm:grid max-sm:gap-0 sm:grid sm:gap-1" : "grid gap-1"}>
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription className={isCartToast ? "max-sm:hidden" : undefined}>
                  {description}
                </ToastDescription>
              )}
            </div>

            {action}
            <ToastClose />

            <span
              className="pointer-events-none absolute bottom-1 left-3 right-3 hidden h-[2px] overflow-hidden rounded-full bg-[#08665F]/15 max-sm:block"
              aria-hidden
            >
              <span
                className="block h-full origin-left rounded-full bg-[#08665F]"
                style={{
                  animation: `toast-progress ${duration}ms linear forwards`,
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
