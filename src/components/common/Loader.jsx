import React from "react";
import ReactDOM from "react-dom";
import { useSelector } from "react-redux";

function LoaderSpinner() {
  return (
    <div className="relative flex items-center justify-center">
      <div className="h-16 w-16 rounded-full border-4 border-gray-200 border-t-[#08665F] animate-spin" />
      <div className="absolute h-10 w-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 blur-sm" />
    </div>
  );
}

export function PremiumLoader({ message = "Loading...", scoped = false }) {
  const positionClass = scoped ? "absolute inset-0 z-50" : "fixed inset-0 z-[9999]";

  return (
    <div
      className={`${positionClass} flex flex-col items-center justify-center bg-white/70 backdrop-blur-md`}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <LoaderSpinner />
    </div>
  );
}

export function ConnectedLoader({ scoped = false }) {
  const { isLoading, loadingMessage } = useSelector((state) => state.commonFeature);

  if (!isLoading) return null;

  if (scoped) {
    return <PremiumLoader message={loadingMessage} scoped />;
  }

  const portalRoot = document.getElementById("portal-root");
  if (!portalRoot) {
    return <PremiumLoader message={loadingMessage} />;
  }

  return ReactDOM.createPortal(
    <PremiumLoader message={loadingMessage} />,
    portalRoot
  );
}

/** Loader scoped to the admin main content panel (sidebar/header stay visible). */
export function AdminContentLoader() {
  const { isLoading, loadingMessage } = useSelector((state) => state.commonFeature);

  if (!isLoading) return null;

  return <PremiumLoader message={loadingMessage} scoped />;
}