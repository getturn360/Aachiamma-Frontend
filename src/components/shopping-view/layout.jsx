import { Outlet } from "react-router-dom";
import ShoppingHeader from "./header";

import Footer from "../common/Footer";

function ShoppingLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-white overflow-hidden">

      <ShoppingHeader />


      <main className="flex-1 flex flex-col w-full" style={{ paddingTop: "var(--header-height, 80px)" }}>
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

export default ShoppingLayout;
