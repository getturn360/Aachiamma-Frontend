// client/src/components/common/Loader.jsx
import React from "react";
import ReactDOM from "react-dom";
import { useSelector } from "react-redux";

/**
 * PremiumLoader – clean animated loader overlay
 * Supports global usage through Redux (via ConnectedLoader)
 */
export function PremiumLoader({ message = "Loading..." }) {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/70 backdrop-blur-md">
      {/* spinning ring */}
      <div className="relative flex items-center justify-center">
        {/* Outer spinning ring with custom color */}
        <div className="h-16 w-16 rounded-full border-4 border-gray-200 border-t-[#08665F] animate-spin"></div>
        {/* Inner blurred glow */}
        <div className="absolute h-10 w-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 blur-sm"></div>
      </div>
    </div>
  );
}


/**
 * ConnectedLoader – reads `state.common.isLoading` + `state.common.loadingMessage`
 * and renders the loader globally into #portal-root.
 */
export function ConnectedLoader() {
    const { isLoading, loadingMessage } = useSelector((state) => state.common);

    if (!isLoading) return null;

    const portalRoot = document.getElementById("portal-root");
    if (!portalRoot) {
        console.warn("Portal root not found for ConnectedLoader");
        return <PremiumLoader message={loadingMessage} />;
    }

    return ReactDOM.createPortal(
        <PremiumLoader message={loadingMessage} />,
        portalRoot
    );
}