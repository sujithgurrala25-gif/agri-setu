import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AppShell from "./components/AppShell";
import FarmerHome from "./pages/FarmerHome";
import FarmerProducts from "./pages/FarmerProducts";
import OrdersPage from "./pages/OrdersPage";
import Earnings from "./pages/Earnings";
import FairPricePage from "./pages/FairPricePage";
import AnalyticsPage from "./pages/AnalyticsPage";
import Marketplace from "./pages/Marketplace";
import ProductDetail from "./pages/ProductDetail";
import Nearby from "./pages/Nearby";
import CartPage from "./pages/CartPage";
import Checkout from "./pages/Checkout";
import TrackOrder from "./pages/TrackOrder";
import FarmerPublic from "./pages/FarmerPublic";
import BulkPage from "./pages/BulkPage";
import BuyerHome from "./pages/BuyerHome";
import AdminHome, { AdminFarmers, AdminFinance, AdminRisk, AdminUsers } from "./pages/AdminPages";
import NotificationsPage from "./pages/NotificationsPage";
import SettingsPage from "./pages/SettingsPage";
import { homeFor } from "./lib/utils";

function Guard({ roles, children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-10 text-sm text-mute">Loading session…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={homeFor(user.role)} replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/app"
        element={
          <Guard>
            <AppShell />
          </Guard>
        }
      >
        <Route path="farmer" element={<Guard roles={["farmer"]}><FarmerHome /></Guard>} />
        <Route path="farmer/products" element={<Guard roles={["farmer"]}><FarmerProducts /></Guard>} />
        <Route path="farmer/orders" element={<Guard roles={["farmer"]}><OrdersPage farmer /></Guard>} />
        <Route path="farmer/earnings" element={<Guard roles={["farmer"]}><Earnings /></Guard>} />
        <Route path="farmer/price" element={<Guard roles={["farmer"]}><FairPricePage /></Guard>} />
        <Route path="farmer/analytics" element={<Guard roles={["farmer"]}><AnalyticsPage /></Guard>} />
        <Route path="farmer/bulk" element={<Guard roles={["farmer"]}><BulkPage /></Guard>} />
        <Route path="market" element={<Marketplace />} />
        <Route path="nearby" element={<Nearby />} />
        <Route path="product/:id" element={<ProductDetail />} />
        <Route path="farmer/:userId" element={<FarmerPublic />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="checkout" element={<Guard roles={["consumer", "institutional"]}><Checkout /></Guard>} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="track/:id" element={<TrackOrder />} />
        <Route path="buyer" element={<Guard roles={["institutional"]}><BuyerHome /></Guard>} />
        <Route path="buyer/bulk" element={<Guard roles={["institutional"]}><BulkPage /></Guard>} />
        <Route path="admin" element={<Guard roles={["admin"]}><AdminHome /></Guard>} />
        <Route path="admin/users" element={<Guard roles={["admin"]}><AdminUsers /></Guard>} />
        <Route path="admin/farmers" element={<Guard roles={["admin"]}><AdminFarmers /></Guard>} />
        <Route path="admin/orders" element={<Guard roles={["admin"]}><OrdersPage farmer /></Guard>} />
        <Route path="admin/finance" element={<Guard roles={["admin"]}><AdminFinance /></Guard>} />
        <Route path="admin/risk" element={<Guard roles={["admin"]}><AdminRisk /></Guard>} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
