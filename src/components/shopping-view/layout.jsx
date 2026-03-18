import { Outlet } from "react-router-dom";
import ShoppingHeader from "./header";

import Footer from "../Footer";

function ShoppingLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-white overflow-hidden">

      <ShoppingHeader />


      <main className="flex-1 flex flex-col w-full pt-20">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

export default ShoppingLayout;
