import * as React from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { cva } from "class-variance-authority";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed z-[100] flex flex-col gap-2 pointer-events-none",
      "left-1/2 bottom-[5.25rem] w-auto max-w-[calc(100vw-1.5rem)] -translate-x-1/2 items-center p-0",
      "sm:left-auto sm:right-4 sm:bottom-4 sm:translate-x-0 sm:items-end sm:max-w-sm sm:p-4",
      "md:bottom-6 md:right-6 md:max-w-md",
      "lg:bottom-8 lg:right-8 lg:max-w-lg lg:p-5",
      className
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const toastVariants = cva(
  [
    "group pointer-events-auto relative flex w-full items-center overflow-hidden shadow-xl",
    "max-sm:w-auto max-sm:rounded-full max-sm:border max-sm:border-slate-200/90 max-sm:bg-white max-sm:backdrop-blur-md",
    "max-sm:px-3.5 max-sm:py-2.5 max-sm:gap-2.5 max-sm:pr-3.5 max-sm:shadow-[0_8px_24px_rgba(15,23,42,0.12)]",
    "sm:items-start sm:gap-4 sm:rounded-2xl sm:border sm:p-4 sm:pr-10 sm:bg-white sm:border-gray-200",
    "sm:[&.cart-add-toast]:min-w-[320px] sm:[&.cart-add-toast]:border-l-4 sm:[&.cart-add-toast]:border-l-[#08665F] sm:[&.cart-add-toast]:shadow-[0_12px_40px_rgba(8,102,95,0.18)] sm:[&.cart-add-toast]:pr-4 sm:[&.cart-add-toast]:gap-3",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "max-sm:text-slate-900 sm:border-gray-200 sm:bg-white sm:text-slate-900",
        destructive:
          "max-sm:bg-red-50 max-sm:text-red-800 max-sm:border-red-200 sm:border-transparent sm:bg-red-50 sm:text-red-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const Toast = React.forwardRef(({ className, variant, duration = 5000, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      duration={duration}
      style={{ willChange: "transform, opacity" }}
      className={cn(
        toastVariants({ variant }),
        "motion-reduce:transition-none",
        "max-sm:transition-all max-sm:duration-300 max-sm:ease-out",
        "max-sm:data-[state=open]:animate-toast-slide-up",
        "max-sm:data-[state=open]:opacity-100 max-sm:data-[state=open]:translate-y-0",
        "max-sm:data-[state=closed]:opacity-0 max-sm:data-[state=closed]:translate-y-3 max-sm:data-[state=closed]:pointer-events-none",
        "sm:transition-transform sm:duration-700 sm:ease-in-out",
        "sm:data-[state=open]:translate-x-0 sm:data-[state=open]:opacity-100",
        "sm:data-[state=closed]:translate-x-8 sm:data-[state=closed]:opacity-0",
        "sm:data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]",
        "sm:data-[swipe=cancel]:translate-x-0",
        "sm:data-[swipe=end]:translate-x-8",
        className
      )}
      {...props}
    />
  );
});
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastAction = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-9 items-center justify-center rounded-full px-3 py-1 text-sm font-semibold shadow-sm transition-transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2",
      "bg-amber-400 text-slate-900 hover:brightness-95",
      className
    )}
    {...props}
  />
));
ToastAction.displayName = ToastPrimitives.Action.displayName;

const ToastClose = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-3 top-3 rounded-md p-1 text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-300",
      "max-sm:hidden",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

const ToastTitle = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn(
      "text-sm font-semibold leading-5",
      "max-sm:text-slate-900 max-sm:font-medium max-sm:leading-tight",
      "sm:text-slate-900",
      className
    )}
    {...props}
  />
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn(
      "text-sm",
      "max-sm:text-slate-600 max-sm:text-xs",
      "sm:text-slate-600",
      className
    )}
    {...props}
  />
));
ToastDescription.displayName = ToastPrimitives.Description.displayName;

export {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
};
