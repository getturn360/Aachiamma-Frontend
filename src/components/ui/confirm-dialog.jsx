// aachiamma/client/src/components/ui/confirm-dialog.jsx
import React, { useEffect } from "react";
import { createPortal } from "react-dom";

/**
 * ConfirmDialog
 * Props:
 * - open: boolean
 * - title: string
 * - message: string (can be multiline)
 * - primaryLabel: string
 * - secondaryLabel: string (optional)
 * - onPrimary: function
 * - onSecondary: function (optional)
 * - onClose: function
 *
 * A minimal, accessible modal using Tailwind that fits the theme.
 */
export default function ConfirmDialog({
  open,
  title = "Attention",
  message = "",
  primaryLabel = "OK",
  secondaryLabel = "Cancel",
  onPrimary = () => {},
  onSecondary = () => {},
  onClose = () => {},
}) {
  useEffect(() => {
    if (open) {
      // prevent background scroll
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => {
          onClose();
        }}
      />
      <div className="relative w-full max-w-lg mx-auto rounded-2xl bg-white dark:bg-slate-900 shadow-2xl ring-1 ring-slate-200 dark:ring-slate-700 overflow-hidden">
        <div className="p-5">
          <h3 id="confirm-dialog-title" className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {title}
          </h3>
          <div className="mt-3 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{message}</div>
        </div>

        <div className="flex items-center justify-end gap-3 px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-gradient-to-t from-white/50 dark:from-transparent">
          {secondaryLabel ? (
            <button
              onClick={() => {
                onSecondary();
                onClose();
              }}
              className="px-4 py-2 text-sm rounded-lg bg-transparent border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50"
            >
              {secondaryLabel}
            </button>
          ) : null}
          <button
            onClick={() => {
              onPrimary();
              onClose();
            }}
            className="px-4 py-2 text-sm rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
          >
            {primaryLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}