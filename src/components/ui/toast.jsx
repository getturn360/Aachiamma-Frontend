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
      // responsive positioning + sizing:
      // - mobile (default): smaller right/bottom offsets and narrower max-width
      // - sm, md, lg: progressively larger offsets and wider max-width
      "fixed right-2 bottom-2 z-[100] flex w-full max-w-xs flex-col gap-3 p-3",
      "sm:bottom-4 sm:right-4 sm:max-w-sm sm:p-4",
      "md:bottom-6 md:right-6 md:max-w-md md:p-4",
      "lg:bottom-8 lg:right-8 lg:max-w-lg lg:p-5",
      className
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-start gap-4 overflow-hidden rounded-2xl border p-4 pr-10 shadow-xl bg-white border-gray-200",
  {
    variants: {
      variant: {
        default: "border-gray-200 bg-white text-slate-900",
        destructive: "destructive border-transparent bg-red-50 text-red-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const Toast = React.forwardRef(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      duration={2000} // visible for 2s
      // style for smoother compositing (transform + opacity)
      style={{ willChange: "transform, opacity" }}
      className={cn(
        toastVariants({ variant }),
        // slower, smooth transition
        "transition-transform duration-700 ease-in-out motion-reduce:transition-none",
        // open/closed states
        "data-[state=open]:opacity-100 data-[state=open]:translate-x-0",
        "data-[state=closed]:opacity-0 data-[state=closed]:translate-x-8",
        // swipe support (Radix sets --radix-toast-swipe-move-x)
        "data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]",
        "data-[swipe=cancel]:translate-x-0",
        "data-[swipe=end]:translate-x-8",
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
    className={cn("text-sm font-semibold leading-5 text-slate-900", className)}
    {...props}
  />
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-sm text-slate-600", className)}
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
