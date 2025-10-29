import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { cn } from "@/lib/utils";

const DEFAULT_ACCENT = "#08665F";

const SIZE_MAP = {
  sm: { box: "h-5 w-5", icon: "w-2 h-2", stroke: 1.6, svgView: 20 },
  md: { box: "h-7 w-7", icon: "w-3 h-3", stroke: 2.0, svgView: 22 },
  lg: { box: "h-8 w-8", icon: "w-4 h-4", stroke: 2.4, svgView: 24 },
  xl: { box: "h-10 w-10", icon: "w-5 h-5", stroke: 3.0, svgView: 24 },
};

function hexToRgb(hex = DEFAULT_ACCENT) {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map(c => c + c).join("") : h;
  const bigint = parseInt(full, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `${r}, ${g}, ${b}`;
}

export const PremiumModernCheckbox = React.forwardRef(
  (
    {
      id,
      className,
      label,
      description,
      size = "md",
      accent = DEFAULT_ACCENT,
      checked,
      defaultChecked,
      onCheckedChange,
      disabled,
      name,
      value,
      ...props
    },
    ref
  ) => {
    const sizeCfg = SIZE_MAP[size] || SIZE_MAP.md;
    const internalId = id || React.useId();

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const accentRgb = hexToRgb(accent);

    return (
      <div className={cn("flex items-start gap-3", className)}>
        <div className="relative flex items-center">
          <CheckboxPrimitive.Root
            id={internalId}
            ref={ref}
            className={cn(
              "peer inline-flex items-center justify-center rounded-2xl border bg-white transition-transform duration-200 ease-out select-none",
              // make default (unchecked) border thicker:
              "border-2 border-slate-200", // <-- changed from border-[1px] to border-2
              sizeCfg.box
            )}
            style={{
              ["--accent"]: accent,
              ["--accent-rgb"]: accentRgb,
            }}
            onCheckedChange={onCheckedChange}
            checked={checked}
            defaultChecked={defaultChecked}
            disabled={disabled}
            name={name}
            value={value}
            {...props}
          >
            <span
              aria-hidden
              className={cn(
                "absolute inset-0 rounded-2xl pointer-events-none",
                "bg-white/35 backdrop-blur-sm"
              )}
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.62), rgba(255,255,255,0.36))",
                mixBlendMode: "overlay",
                borderRadius: 10,
              }}
            />

            <span
              aria-hidden
              className={cn("absolute -inset-[1px] rounded-[12px] pointer-events-none")}
              style={{ borderRadius: 12 }}
            />

            <CheckboxPrimitive.Indicator className={cn("flex items-center justify-center")}>
              <svg
                viewBox={`0 0 ${sizeCfg.svgView} ${sizeCfg.svgView}`}
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={cn("w-full h-full")}
                aria-hidden
              >
                <path
                  d="M4.5 11l3.5 3.5L16.5 6"
                  stroke="white"
                  strokeWidth={sizeCfg.stroke}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={prefersReducedMotion ? "" : "premium-check-draw"}
                />

                <path
                  d="M5.5 11h10"
                  stroke="white"
                  strokeWidth={sizeCfg.stroke}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={prefersReducedMotion ? "" : "premium-dash-draw"}
                />
              </svg>
            </CheckboxPrimitive.Indicator>

            <span
              aria-hidden
              className={cn(
                "absolute rounded-full opacity-0 pointer-events-none",
                prefersReducedMotion ? "" : "active:animate-premium-ripple"
              )}
              style={{
                width: "220%",
                height: "220%",
                left: "-60%",
                top: "-60%",
                background:
                  "radial-gradient(circle, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.01) 60%, transparent 70%)",
              }}
            />
          </CheckboxPrimitive.Root>
        </div>

        <div className="min-w-0">
          {label && (
            <label
              htmlFor={internalId}
              className="block text-sm font-semibold leading-tight text-gray-900 select-none"
            >
              {label}
            </label>
          )}
          {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
        </div>

        <style>{`
          .peer {
            position: relative;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 10px;
            overflow: visible;
            background: white;
            transition: transform 160ms cubic-bezier(.2,.9,.2,1), border-color 160ms, border-width 160ms;
          }

          /* unchecked border: stronger/thicker (kept by border-2 above) */
          .peer {
            border-color: rgba(15,23,42,0.06);
            /* border-width is handled by the tailwind class (border-2). */
          }

          /* checked / indeterminate: use accent color for background and border — make border thinner to emphasise accent */
          .peer[data-state="checked"],
          .peer[data-state="indeterminate"] {
            background: linear-gradient(180deg, var(--accent), color-mix(in srgb, var(--accent) 70%, black 6%));
            color: white;
            border-color: var(--accent);
            transform: translateY(-0.5px);
            /* make checked border thinner than unchecked */
            border-width: 1px; /* <-- thinner when checked */
          }

          .peer[data-state="checked"] {
            outline: none;
          }

          .peer::after {
            content: "";
            position: absolute;
            inset: -1px;
            border-radius: 12px;
            pointer-events: none;
            background: linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02));
            opacity: 0;
            transition: opacity 160ms;
            z-index: 0;
          }
          .peer:hover::after { opacity: 1; }

          .peer:focus-visible {
            outline: none;
            box-shadow: 0 0 0 3px rgba(var(--accent-rgb), 0.10);
          }

          .peer[data-state="checked"]::before {
            content: "";
            position: absolute;
            inset: -4px;
            border-radius: 14px;
            pointer-events: none;
            box-shadow: 0 0 0 3px rgba(var(--accent-rgb), 0.08);
            z-index: -1;
          }

          @keyframes premium-draw-check {
            from { stroke-dashoffset: 28; stroke-dasharray: 28; opacity: 0; }
            40% { opacity: 1; }
            to { stroke-dashoffset: 0; stroke-dasharray: 28; opacity: 1; }
          }
          @keyframes premium-draw-dash {
            from { stroke-dashoffset: 12; stroke-dasharray: 12; opacity: 0; transform: translateY(3px); }
            40% { opacity: 1; transform: translateY(0); }
            to { stroke-dashoffset: 0; stroke-dasharray: 12; opacity: 1; transform: translateY(0); }
          }

          .premium-check-draw {
            stroke-dasharray: 28;
            stroke-dashoffset: 28;
            animation: premium-draw-check 300ms cubic-bezier(.2,.9,.2,1) forwards 60ms;
            transform-origin: center;
          }

          .premium-dash-draw {
            stroke-dasharray: 12;
            stroke-dashoffset: 12;
            opacity: 0;
            animation: premium-draw-dash 260ms cubic-bezier(.2,.9,.2,1) forwards 40ms;
          }

          @keyframes premium-ripple {
            0% { transform: scale(0.6); opacity: 0.12; }
            100% { transform: scale(1); opacity: 0; }
          }
          .active\\:animate-premium-ripple:active {
            animation: premium-ripple 320ms ease-out forwards;
          }

          @media (prefers-reduced-motion: reduce) {
            .premium-check-draw, .premium-dash-draw, .active\\:animate-premium-ripple:active,
            .peer:hover, .peer:focus-visible {
              transition: none !important;
              animation: none !important;
            }
          }

          .peer svg { width: 60%; height: 60%; }

          .peer[disabled] {
            opacity: 0.5;
            transform: none;
            cursor: not-allowed;
            background: linear-gradient(180deg, rgba(245,245,245,0.95), rgba(245,245,245,0.8));
            border-color: rgba(15,23,42,0.04);
            border-width: 1px; /* keep disabled thin so it reads as inactive */
          }
        `}</style>
      </div>
    );
  }
);

PremiumModernCheckbox.displayName = "PremiumModernCheckbox";

export { PremiumModernCheckbox as Checkbox };
export default PremiumModernCheckbox;
