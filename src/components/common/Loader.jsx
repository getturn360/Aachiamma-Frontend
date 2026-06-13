import React from "react";
import ReactDOM from "react-dom";
import { useSelector } from "react-redux";

export function PremiumLoader({ message = "Loading..." }) {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/70 backdrop-blur-md">
 
      <div className="relative flex items-center justify-center">
     
        <div className="h-16 w-16 rounded-full border-4 border-gray-200 border-t-[#08665F] animate-spin"></div>
    
        <div className="absolute h-10 w-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 blur-sm"></div>
      </div>
    </div>
  );
}


export function ConnectedLoader() {
    const { isLoading, loadingMessage } = useSelector((state) => state.commonFeature);

    if (!isLoading) return null;

    const portalRoot = document.getElementById("portal-root");
    if (!portalRoot) {
        return <PremiumLoader message={loadingMessage} />;
    }

    return ReactDOM.createPortal(
        <PremiumLoader message={loadingMessage} />,
        portalRoot
    );
}