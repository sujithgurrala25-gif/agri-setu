import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  LayoutDashboard,
  Leaf,
  LogOut,
  MapPin,
  Package,
  ShoppingBag,
  Sparkles,
  Store,
  Truck,
  Users,
  BarChart3,
  Shield,
  Wallet,
  Layers,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { Badge } from "./ui";
import { useEffect, useState } from "react";
import api from "../api/client";

const NAV = {
  farmer: [
    { to: "/app/farmer", label: "Overview", icon: LayoutDashboard },
    { to: "/app/farmer/products", label: "Inventory", icon: Package },
    { to: "/app/farmer/orders", label: "Orders", icon: Truck },
    { to: "/app/farmer/earnings", label: "Earnings", icon: Wallet },
    { to: "/app/farmer/price", label: "Fair price", icon: Sparkles },
    { to: "/app/farmer/analytics", label: "Demand", icon: BarChart3 },
    { to: "/app/farmer/bulk", label: "Bulk demand", icon: Layers },
  ],
  consumer: [
    { to: "/app/market", label: "Marketplace", icon: Store },
    { to: "/app/nearby", label: "Nearby farms", icon: MapPin },
    { to: "/app/orders", label: "My orders", icon: Truck },
    { to: "/app/cart", label: "Cart", icon: ShoppingBag },
  ],
  institutional: [
    { to: "/app/buyer", label: "Overview", icon: LayoutDashboard },
    { to: "/app/market", label: "Marketplace", icon: Store },
    { to: "/app/buyer/bulk", label: "Bulk matching", icon: Layers },
    { to: "/app/orders", label: "Orders", icon: Truck },
  ],
  admin: [
    { to: "/app/admin", label: "Overview", icon: LayoutDashboard },
    { to: "/app/admin/users", label: "Users", icon: Users },
    { to: "/app/admin/farmers", label: "Verification", icon: Shield },
    { to: "/app/admin/orders", label: "Orders", icon: Truck },
    { to: "/app/admin/finance", label: "Transactions", icon: Wallet },
    { to: "/app/admin/risk", label: "Risk & complaints", icon: Bell },
  ],
};

export default function AppShell() {
  const { user, farmerProfile, logout } = useAuth();
  const { items } = useCart();
  const nav = useNavigate();
  const loc = useLocation();
  const [unread, setUnread] = useState(0);
  const links = NAV[user?.role] || NAV.consumer;

  useEffect(() => {
    api.get("/notifications").then(({ data }) => setUnread(data.unread || 0)).catch(() => {});
  }, [loc.pathname]);

  const crumbs = loc.pathname.split("/").filter(Boolean);

  return (
    <div className="min-h-screen bg-cream">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[260px] flex-col border-r border-line bg-white/80 p-4 backdrop-blur md:flex">
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-ink text-white">
            <Leaf size={18} />
          </div>
          <div>
            <p className="text-sm font-bold">AgriSetu</p>
            <p className="text-[11px] text-mute">Direct farm bridge</p>
          </div>
        </div>
        <div className="mt-2 rounded-2xl border border-line bg-cream px-3 py-2 text-sm">
          <p className="text-[11px] uppercase tracking-wide text-mute">Workspace</p>
          <p className="font-semibold capitalize">{user?.role}</p>
          <p className="truncate text-xs text-mute">{user?.orgName || user?.name}</p>
        </div>
        <nav className="mt-4 flex-1 space-y-1">
          {links.map((l) => {
            const Icon = l.icon;
            return (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to.split("/").length <= 3}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-2xl px-3 py-2.5 text-sm ${
                    isActive ? "bg-sky/10 font-semibold text-sky" : "text-ink/80 hover:bg-cream"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={`h-4 w-0.5 rounded-full ${isActive ? "bg-sky" : "bg-transparent"}`} />
                    <Icon size={16} />
                    {l.label}
                    {l.to === "/app/cart" && items.length > 0 && (
                      <span className="ml-auto rounded-full bg-ink px-2 text-[10px] text-white">{items.length}</span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
        <button
          onClick={() => {
            logout();
            nav("/");
          }}
          className="flex items-center gap-2 rounded-2xl px-3 py-2 text-sm text-mute hover:bg-cream"
        >
          <LogOut size={16} /> Sign out
        </button>
      </aside>

      <div className="md:pl-[260px]">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-cream/80 px-4 py-4 backdrop-blur md:px-8">
          <div>
            <p className="text-xs text-mute">
              Pages / {crumbs.slice(1).join(" / ") || "home"}
            </p>
            <h1 className="text-xl font-bold md:text-2xl">
              {farmerProfile?.verificationStatus === "verified" && user?.role === "farmer" ? (
                <span className="mr-2 align-middle">
                  <Badge className="bg-emerald-50 text-emerald-800">Verified farmer</Badge>
                </span>
              ) : null}
              {pageTitle(loc.pathname)}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-50 text-emerald-800">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Operational
            </Badge>
            <button onClick={() => nav("/app/notifications")} className="relative rounded-2xl border border-line bg-white p-2">
              <Bell size={16} />
              {unread > 0 && <span className="absolute -right-1 -top-1 h-4 min-w-4 rounded-full bg-ink px-1 text-[10px] text-white">{unread}</span>}
            </button>
            <button onClick={() => nav("/app/settings")} className="rounded-2xl border border-line bg-white px-3 py-2 text-sm font-medium">
              {user?.name?.split(" ")[0]}
            </button>
          </div>
        </header>
        <main className="px-4 py-6 md:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function pageTitle(path) {
  const map = {
    "/app/farmer": "Farmer overview",
    "/app/farmer/products": "Inventory",
    "/app/farmer/orders": "Incoming orders",
    "/app/farmer/earnings": "Earnings",
    "/app/farmer/price": "Fair-price advisor",
    "/app/farmer/analytics": "Demand & supply",
    "/app/farmer/bulk": "Bulk demand",
    "/app/market": "Marketplace",
    "/app/nearby": "Nearby farmers",
    "/app/cart": "Cart",
    "/app/checkout": "Checkout",
    "/app/orders": "Orders",
    "/app/buyer": "Procurement",
    "/app/buyer/bulk": "Farmer aggregation",
    "/app/admin": "Control center",
    "/app/notifications": "Notifications",
    "/app/settings": "Profile & settings",
  };
  if (map[path]) return map[path];
  if (path.includes("/product/")) return "Product details";
  if (path.includes("/track/")) return "Order tracking";
  if (path.includes("/farmer/")) return "Farmer profile";
  return "AgriSetu";
}
