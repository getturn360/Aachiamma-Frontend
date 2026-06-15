import { Outlet } from "react-router-dom";
import AdminSideBar from "./sidebar";
import AdminHeader from "./header";
import { AdminContentLoader } from "@/components/common/Loader";
import { useState } from "react";

function AdminLayout() {
  const [openSidebar, setOpenSidebar] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden">

      <AdminSideBar open={openSidebar} setOpen={setOpenSidebar} />

      <div className="flex flex-1 flex-col h-full min-w-0">

        <AdminHeader setOpen={setOpenSidebar} />

        <main className="relative flex-1 flex flex-col bg-muted/40 p-4 md:p-6 overflow-y-auto min-h-0">
          <AdminContentLoader />
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
