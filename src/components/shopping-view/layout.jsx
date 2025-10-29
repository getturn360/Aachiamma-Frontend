// aachiamma/client/src/components/shopping-view/layout.jsx

import { Outlet } from "react-router-dom";
import ShoppingHeader from "./header";
// Footer import (relative path from shopping-view folder)
import Footer from "../Footer";

function ShoppingLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-white overflow-hidden">
      {/* fixed header is already in ShoppingHeader */}
      <ShoppingHeader />

      {/* header fixed aanenkil main-top padding kodukkanam.
          adjust 'pt-20' according to header height (eg. pt-16 / pt-20) */}
      <main className="flex-1 flex flex-col w-full pt-20">
        <Outlet />
      </main>

      {/* Footer will appear on all shop pages */}
      <Footer />
    </div>
  );
}

export default ShoppingLayout;
