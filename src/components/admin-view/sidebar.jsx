import React, { Fragment } from "react";
import {
  BadgeCheck,
  LayoutDashboard,
  ShoppingBasket,
  Truck,
  Mail,
  Tag,
  PlusCircle,
  Star,
  TrendingUp,
  List,
  FileText, 
  MessageSquare, 
  MessageCircle, 
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { motion } from "framer-motion";
import adminLogo from "@/assets/logo-3.png";
import { useSelector } from "react-redux";

const adminSidebarMenuItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/admin/dashboard",
    icon: <LayoutDashboard size={18} />,
  },
  {
    id: "products",
    label: "Products",
    path: "/admin/products",
    icon: <ShoppingBasket size={18} />,
  },
  {
    id: "orders",
    label: "Orders",
    path: "/admin/orders",
    icon: <BadgeCheck size={18} />,
  },
  {
    id: "reviews",
    label: "Reviews",
    path: "/admin/reviews",
    icon: <TrendingUp size={18} />,
  },
  {
    id: "contact_messages",
    label: "Contact Messages",
    path: "/admin/contact-messages",
    icon: <MessageCircle size={18} />,
  },
  {
    id: "categories",
    label: "Categories",
    path: "/admin/categories",
    icon: <List size={18} />,
  },
  {
    id: "newsletter",
    label: "Newsletter",
    path: "/admin/newsletter",
    icon: <Mail size={18} />,
  },
  {
    id: "coupons",
    label: "Coupons",
    path: "/admin/coupons",
    icon: <Tag size={18} />,
  },
  {
    id: "coupons-add",
    label: "Add Coupon",
    path: "/admin/coupons/add",
    icon: <PlusCircle size={18} />,
  },
  {
    id: "topbar",
    label: "Topbar",
    path: "/admin/topbar",
    icon: <Star size={18} />,
  },
  {
    id: "shipping",
    label: "Shipping",
    path: "/admin/shipping",
    icon: <Truck size={18} />,
  },
  {
    id: "message_templates",
    label: "Message Templates",
    path: "/admin/templates",
    icon: <MessageSquare size={18} />,
  },
  {
    id: "invoice_control",
    label: "Invoice Control",
    path: "/admin/invoice-control",
    icon: <FileText size={18} />,
  },
];

function MenuItems({ onNavigate }) {
 
  const { user } = useSelector((state) => state.auth || {});
  const role = user && user.role ? String(user.role).toLowerCase() : null;


  const allowedForAdmin = ["products", "orders", "reviews"];
  const listToRender =
    role === "admin" ? adminSidebarMenuItems.filter((mi) => allowedForAdmin.includes(mi.id)) : adminSidebarMenuItems;

  return (
    <nav className="mt-6 flex flex-col gap-2" aria-label="Admin navigation">
      {listToRender.map((menuItem) => (
        <NavLink
          key={menuItem.id}
          to={menuItem.path}
          onClick={() => onNavigate && onNavigate(menuItem.path)}
          className={({ isActive }) =>
            `group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-white/30 ${
              isActive
                ? "bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
                : "text-white/90 hover:bg-white/5"
            }`
          }
        >
          <motion.span
            whileHover={{ scale: 1.12 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="flex items-center justify-center w-8 h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 rounded-md bg-white/10 group-hover:bg-white/20"
            aria-hidden
          >
            {menuItem.icon}
          </motion.span>
          <span className="truncate">{menuItem.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

function AdminSideBar({ open, setOpen }) {
  const { user } = useSelector((state) => state.auth || {});
  const displayName = (user && (user.name || user.firstName || user.email)) || "Admin";
  const displayEmail = (user && user.email) || "admin@example.com";


  const initials = (displayName || "A")
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Fragment>
 
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-full sm:w-80 md:w-72 p-0 h-[100vh]">
          <div className="h-full flex flex-col bg-gradient-to-b from-[#0b5b57] to-[#08665F] text-white">
    
            <div className="px-4 py-5 flex items-center gap-3 border-b border-white/10">
              <div className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-lg bg-white/5 flex items-center justify-center overflow-hidden">
                <img src={adminLogo} alt="Admin Panel" className="w-full h-full object-contain p-3" draggable={false} />
              </div>
              <div>
                <div className="text-lg md:text-xl font-bold">Admin Panel</div>
                <div className="text-xs text-white/80">Management console</div>
              </div>
            </div>

         
            <div className="px-4 py-5 flex-1 overflow-auto">
              <MenuItems onNavigate={() => setOpen(false)} />
            </div>

      
            <div className="px-4 py-4 border-t border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-white/10 flex items-center justify-center text-sm font-semibold">
                  {initials}
                </div>
                <div>
                  <div className="text-sm font-medium">{displayName}</div>
                  <div className="text-xs text-white/80 truncate" title={displayEmail}>{displayEmail}</div>
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

     
      <aside className="hidden md:flex md:w-56 lg:w-64 xl:w-72 2xl:w-80 flex-col relative">
        <div className="h-screen flex flex-col bg-gradient-to-b from-[#0b5b57] to-[#08665F] text-white shadow-lg">
          <div className="px-4 md:px-6 py-5 md:py-6 border-b border-white/10 flex items-center gap-3 flex-shrink-0">
            <div className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-xl bg-white/5 flex items-center justify-center overflow-hidden shadow-sm">
              <img src={adminLogo} alt="Admin Panel" className="w-full h-full object-contain p-3" draggable={false} />
            </div>
            <div>
              <div className="text-xl md:text-2xl lg:text-2xl font-extrabold">Admin Panel</div>
              <div className="text-xs text-white/80">Control center</div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-6">
            <MenuItems />
          </div>

          <div className="px-4 py-4 border-t border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-white/10 flex items-center justify-center text-sm font-semibold">
                {initials}
              </div>
              <div>
                <div className="text-sm font-medium">{displayName}</div>
                <div className="text-xs text-white/80 truncate" title={displayEmail}>{displayEmail}</div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </Fragment>
  );
}

export default AdminSideBar;
