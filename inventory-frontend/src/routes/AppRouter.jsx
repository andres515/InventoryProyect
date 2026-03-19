import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Pages
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Products from "../pages/Products";
import BusinessPage from "../pages/BusinessPage";
import CreateProduct from "../pages/CreateProduct";
import Cart from "../pages/Cart";
import Sales from "../pages/Sales";
import Business from "../pages/Business";
import Settings from "../pages/Settings";
import Layaways from "../pages/Layaways";
import Returns from "../pages/Returns"; // 🔥 NUEVA PAGINA
import Clients from "../pages/Clients";

// Components
import ProtectedRoute from "../components/ProtectedRoute";
import Layout from "../components/Layout";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ================= ROOT ================= */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* ================= PUBLICAS ================= */}
        <Route path="/login" element={<Login />} />

        {/* ================= SUPER ADMIN ================= */}
        <Route
          path="/business"
          element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
              <BusinessPage />
            </ProtectedRoute>
          }
        />

        {/* ================= PRIVADAS (CON LAYOUT) ================= */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >

          {/* Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Configuración empresa */}
          <Route
            path="/business/settings"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
                <Business />
              </ProtectedRoute>
            }
          />

          {/* Ajustes */}
          <Route path="/settings" element={<Settings />} />

          {/* Productos */}
          <Route path="/products" element={<Products />} />
          <Route path="/products/new" element={<CreateProduct />} />

          {/* Ventas */}
          <Route path="/cart" element={<Cart />} />
          <Route path="/sales" element={<Sales />} />

          {/* Separados */}
          <Route path="/layaways" element={<Layaways />} />

          {/* 🔥 DEVOLUCIONES */}
          <Route path="/returns" element={<Returns />} />

          <Route path="/clients" element={<Clients />} />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;