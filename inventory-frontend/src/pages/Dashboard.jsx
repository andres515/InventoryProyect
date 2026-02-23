import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getProducts } from "../services/productService";
import { API_URL } from "../config/config";
import "./Dashboard.css";

function Dashboard() {
  const { user, logout } = useAuth();

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // =========================
  // CARGAR PRODUCTOS
  // =========================
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoadingProducts(true);
        const data = await getProducts();
        console.log("PRODUCTOS:", data);
        setProducts(data);
      } catch (error) {
        console.error("Error cargando productos:", error);
      } finally {
        setLoadingProducts(false);
      }
    };

    loadProducts();
  }, []);

  // =========================
  // RENDER
  // =========================
  return (
    <div className="dashboard-container">

      {/* HEADER */}
      <h1>Dashboard</h1>

      <div className="user-info">
        <p><strong>Usuario:</strong> {user?.sub}</p>
        <p><strong>Rol:</strong> {user?.role}</p>
        <button className="logout-btn" onClick={logout}>
          Cerrar sesión
        </button>
      </div>

      <hr />

      <h2>Productos</h2>

      {/* ================= LOADING ================= */}
      {loadingProducts ? (
        <p>Cargando productos...</p>
      ) : products.length === 0 ? (
        <p>No hay productos</p>
      ) : (

        <div className="products-grid">
          {products.map((product) => (

            <div key={product.id} className="product-card">

              {/* ===== IMAGEN ===== */}
              <div className="image-container">
                <img
                  src={
                    product.imageUrl
                      ? `${API_URL}${product.imageUrl}`
                      : "https://via.placeholder.com/250x180?text=Sin+Imagen"
                  }
                  alt={product.name}
                  className="product-image"
                />
              </div>

              {/* ===== HEADER ===== */}
              <div className="card-header">
                <h3>{product.name}</h3>

                <span
                  className={`status ${
                    product.active ? "active" : "inactive"
                  }`}
                >
                  {product.active ? "Activo" : "Inactivo"}
                </span>
              </div>

              {/* ===== DESCRIPCIÓN ===== */}
              <p className="description">
                {product.description || "Sin descripción"}
              </p>

              {/* ===== INFO ===== */}
              <div className="card-info">
                <p><strong>Precio:</strong> ${product.price}</p>
                <p><strong>Stock:</strong> {product.stock}</p>
                <p><strong>Categoría:</strong> {product.category}</p>
              </div>

              {/* ===== BOTONES ===== */}
              <div className="card-actions">

                <button
                  className="btn add"
                  onClick={() => console.log("Agregar", product.id)}
                >
                  Agregar
                </button>

                <button
                  className="btn edit"
                  onClick={() => console.log("Editar", product.id)}
                >
                  Editar
                </button>

              </div>

            </div>

          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;