import { Link, Outlet, useLocation } from "react-router-dom";
import "./Layout.css";

function Layout() {
  const location = useLocation();

  return (
    <div className="app-container">

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">INVENTORY SYSTEM</div>

        <nav className="menu">
          <Link
            to="/dashboard"
            className={`menu-item ${
              location.pathname === "/dashboard" ? "active" : ""
            }`}
          >
            Dashboard
          </Link>

          <Link
            to="/products"
            className={`menu-item ${
              location.pathname.startsWith("/products") ? "active" : ""
            }`}
          >
            Productos
          </Link>

          <Link
            to="/products/new"
            className={`menu-item ${
              location.pathname === "/products/new" ? "active" : ""
            }`}
          >
            Crear Producto
          </Link>
        </nav>
      </aside>

      {/* Contenido dinámico */}
      <main className="main-content">
        <Outlet />
      </main>

    </div>
  );
}

export default Layout;