import { Link, Outlet, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { FaBoxOpen, FaChartLine, FaStore, FaTachometerAlt,FaCog, FaMoneyBillWave,FaExchangeAlt,FaUsers} from "react-icons/fa";
import "./Layout.css";

function Layout() {
  const location = useLocation();

  const { user, business, logout } = useAuth();
  const { cartItems } = useCart();

  // 🔥 CONTROL DE ROLES
  const isAdmin = user?.role === "ADMIN";
  const isUser = user?.role === "USER";

  // ✅ Construcción segura del logo
const logoUrl =
  business?.logoUrl
    ? (business.logoUrl.startsWith("http")
        ? business.logoUrl
        : `http://localhost:8080${business.logoUrl}`) + `?t=${Date.now()}`
    : "/logo.png";

  return (
    <div className="app-container">

      {/* ================= SIDEBAR ================= */}
      <aside className="sidebar">

        {/* ===== LOGO EMPRESA ===== */}
        
        <div className="logo-box">
        
          <img
            src={logoUrl}
            alt="Logo empresa"
            className="logo-img"
            onError={(e) => {
              e.target.src = "/logo.png";
            }}
          />

          <p className="logo-text">
            {business?.name || "Inventory System"}
          </p>
          <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Sofia"></link>
        </div>

        {/* ================= MENU ================= */}
        <nav className="menu">

          {/* PRODUCTOS (ADMIN Y USER) */}
          {(isAdmin || isUser) && (
            <Link
              to="/products"
              className={`menu-item ${
                location.pathname.startsWith("/products") ? "active" : ""
              }`}
            >
              <FaBoxOpen className="menu-icon" />
              Productos
            </Link>
          )}

          {/* VENTAS (SOLO ADMIN) */}
          {(isAdmin|| isUser) && (
            <Link
              to="/sales"
              className={`menu-item ${
                location.pathname === "/sales" ? "active" : ""
              }`}
            >
              <FaChartLine className="menu-icon" />
              Ventas
            </Link>
          )}
          {/* DEVOLUCIONES (ADMIN Y USER) */}
          {(isAdmin || isUser) && (
            <Link
              to="/returns"
              className={`menu-item ${
                location.pathname.startsWith("/returns") ? "active" : ""
              }`}
            >
              <FaExchangeAlt className="menu-icon" />
              Devoluciones
            </Link>
          )}
          {/* ABONOS (ADMIN Y USER) */}
          {(isAdmin || isUser) && (
            <Link
              to="/layaways"
              className={`menu-item ${
                location.pathname.startsWith("/layaways") ? "active" : ""
              }`}
            >
              <FaMoneyBillWave className="menu-icon" />
              Abonos
            </Link>
          )}

          <Link
            to="/clients"
            className={`menu-item ${
            location.pathname === "/clients" ? "active" : ""
            }`}
            >
            <FaUsers className="menu-icon" />
            Clientes
            </Link>

          {/* CONFIGURACIÓN NEGOCIO (SOLO ADMIN) */}
          {isAdmin && (
            <Link
              to="/business/settings"
              className={`menu-item ${
                location.pathname === "/business/settings" ? "active" : ""
              }`}
            >
              <FaStore className="menu-icon" />
              Negocio
            </Link>
          )}

          {/* DASHBOARD (SOLO ADMIN) */}
          {isAdmin && (
            <Link
              to="/dashboard"
              className={`menu-item ${
                location.pathname === "/dashboard" ? "active" : ""
              }`}
            >
              <FaTachometerAlt className="menu-icon" />
              Dashboard
            </Link>
          )}

          {/* settings (SOLO ADMIN) */}
          {isAdmin && (
            <Link
              to="/settings"
              className={`menu-item ${
                location.pathname === "/settings" ? "active" : ""
              }`}
            >
              <FaCog className="menu-icon" />
                Configuración
            </Link>
          )}
          

        </nav>

        {/* ================= FOOTER ================= */}
        <div className="sidebar-footer">

          <div className="user-row">

            {/* INFO USUARIO */}
            <div className="user-info">

              <div className="user-avatar">
                {user?.sub?.charAt(0)?.toUpperCase() || "U"}
              </div>

              <div>
                <p className="username">{user?.sub}</p>
                <p className="role">{user?.role}</p>
              </div>

            </div>

            {/* CARRITO (ADMIN Y USER) */}
            {(isAdmin || isUser) && (
              <Link to="/cart" className="cart-icon">
                🛒
                {cartItems.length > 0 && (
                  <span className="cart-badge">
                    {cartItems.length}
                  </span>
                )}
              </Link>
            )}

          </div>

          {/* LOGOUT */}
          <button onClick={logout} className="logout-btn">
            Cerrar sesión
          </button>

        </div>

      </aside>

      {/* ================= CONTENIDO ================= */}
      <main className="main-content">
        <Outlet />
      </main>

    </div>
  );
}

export default Layout;