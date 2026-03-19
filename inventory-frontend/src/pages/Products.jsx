import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProducts, updateProduct } from "../services/productService";
import { API_URL } from "../config/config";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import "./Products.css";

function Products() {
  const { user } = useAuth();
  const { cartItems, addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const categories = [
  "Pañales",
  "Toallitas Húmedas",
  "Leche y Fórmulas",
  "Biberones",
  "Chupos y Mordedores",
  "Higiene del Bebé",
  "Cremas y Pomadas",
  "Ropa de Bebé",
  "Accesorios",
  "Juguetes",
  "Cochecitos y Sillas",
  "Maternidad",
  "Ofertas"
];

  const [editForm, setEditForm] = useState({
    name: "",
    description:"",
    price: "",
     basePrice: "",
    stock: "",
    category: "",
    active: true,
  });
  // Formatear número a formato colombiano
const formatPrice = (value) => {
  if (!value) return "";
  return Number(value).toLocaleString("es-CO");
};

// Manejar cambio del precio
const handlePriceChange = (value) => {
  // Quitar todo lo que no sea número
  const numericValue = value.replace(/\D/g, "");
  setEditForm({ ...editForm, price: numericValue });
};

  const [newImage, setNewImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  /* ===============================
     ESTADÍSTICAS
  ================================= */
  const totalProducts = products.length;

  const lowStockProducts = products.filter(
    (product) => product.stock > 0 && product.stock <= 5
  ).length;

  const outOfStockProducts = products.filter(
    (product) => product.stock === 0
  ).length;

  /* ===============================
   VALOR INVENTARIO Y GANANCIA
================================= */

// valor total invertido en inventario
const totalInventoryValue = products.reduce((total, product) => {
  const base = Number(product.basePrice || 0);
  const stock = Number(product.stock || 0);
  return total + base * stock;
}, 0);

// ganancia potencial
const totalPotentialProfit = products.reduce((total, product) => {
  const base = Number(product.basePrice || 0);
  const price = Number(product.price || 0);
  const stock = Number(product.stock || 0);

  const profit = price - base;

  return total + profit * stock;
}, 0);

  /* ===============================
     FILTRO BUSCADOR
  ================================= */
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /* ===============================
     CARGAR PRODUCTOS
  ================================= */
  const loadProducts = async () => {
    try {
      setLoadingProducts(true);
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error("Error cargando productos:", error);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  /* ===============================
     ABRIR MODAL
  ================================= */
  const handleEditClick = (product) => {
    setSelectedProduct(product);

    setEditForm({
      name: product.name,
      description:product.description,
      price: product.price,
      basePrice: product.basePrice || "",
      stock: product.stock,
      category: product.category,
      active: product.active,
    });

     // 🔥 CORRECCIÓN AQUÍ
  setPreviewImage(
    product.imageUrl
      ? `${API_URL}/uploads/${product.imageUrl}`
      : null
  );

    setNewImage(null);
    setShowModal(true);
  };

  /* ===============================
     GUARDAR CAMBIOS
  ================================= */
 const handleSave = async () => {
  if (!editForm.name || !editForm.price || editForm.stock === "") {
    setToast({ type: "error", message: "Todos los campos son obligatorios" });
    setTimeout(() => setToast(null), 3000);
    return;
  }

  try {
    setSaving(true);

    const formData = new FormData();

    formData.append("name", editForm.name);
    formData.append("description", editForm.description);
    formData.append("price", editForm.price);
    formData.append("basePrice", editForm.basePrice); // 🔥 Enviar al backend
    formData.append("stock", editForm.stock);
    formData.append("category", editForm.category);
    formData.append("active", editForm.active);

    // 🔥 Solo agrega imagen si existe
    if (newImage) {
      formData.append("image", newImage);
    }

    await updateProduct(selectedProduct.id, formData);

    setToast({
      type: "success",
      message: "Producto actualizado correctamente",
    });

    setShowModal(false);
    loadProducts();

  } catch (error) {
    console.error(error);
    setToast({ type: "error", message: "Error actualizando producto" });
  } finally {
    setSaving(false);
    setTimeout(() => setToast(null), 3000);
  }
};

  return (
    <div className="products-container">
      {/* ================= HEADER ================= */}
      <div className="products-header">
        <h1>INVENTARIO DE PRODUCTOS</h1>

       <div className="header-actions">

          <input
            type="text"
            placeholder="Buscar producto..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {user?.role === "ADMIN" && (
            <button
              className="stats-btn"
              onClick={() => setShowStatsModal(true)}
            >
              📊 Ver estadísticas
            </button>
          )}

          {user?.role === "ADMIN" && (
            <Link to="/products/new" className="create-btn">
              + Crear Producto
            </Link>
          )}

        </div>
      </div>

      {/* ================= ESTADÍSTICAS ================= */}
      <div className="stats-container">
        <div className="stat-card total">
          <h4>Total Productos</h4>
          <h2>{totalProducts}</h2>
        </div>

        <div className="stat-card low">
          <h4>Bajo Stock</h4>
          <h2>{lowStockProducts}</h2>
        </div>

        <div className="stat-card out">
          <h4>Agotados</h4>
          <h2>{outOfStockProducts}</h2>
        </div>
      </div>


   {/* ================= GRID ================= */}
{loadingProducts ? (
  <p>Cargando productos...</p>
) : filteredProducts.length === 0 ? (
  <p style={{ marginTop: "20px" }}>No se encontraron productos.</p>
) : (
  <div className="products-grid">
    {filteredProducts.map((product) => {
      const stockStatus =
        product.stock === 0
          ? "agotado"
          : product.stock <= 5
          ? "bajo"
          : "en-stock";

      const isAdmin = user?.role === "ADMIN";
      const isUser = user?.role === "USER";
      const cartItem = cartItems.find(item => item.id === product.id);
const quantityInCart = cartItem ? cartItem.quantity : 0;

      return (
        <div key={product.id} className="product-card">
          <div className="image-container">
            <img
              src={
                product.imageUrl
                  ? `${API_URL}/uploads/${product.imageUrl}`
                  : "https://via.placeholder.com/250x180?text=Sin+Imagen"
              }
              alt={product.name}
              className="product-image"
            />
          </div>

          <div className="card-header">
            <span className={`badge ${stockStatus}`}>
              {stockStatus === "agotado"
                ? "Agotado"
                : stockStatus === "bajo"
                ? "Bajo Stock"
                : "En Stock"}
            </span>

            <span
              className={`status ${
                product.active ? "active" : "inactive"
              }`}
            >
              {product.active ? "Activo" : "Inactivo"}
            </span>
          </div>

          <span className="category">{product.category}</span>
          <h3>{product.name}</h3>
          <span>{product.description}</span>

          <div className="price-section">
            <div>
              <span className="price-label">PRECIO VENTA</span>
              <h3 className="price-value">
                ${Number(product.price).toLocaleString("es-CO")}
              </h3>
              <p className="price-label">Stock: {product.stock}</p>
              {isAdmin && (
                <div className="base-price">
                  <span className="price-label">PRECIO BASE</span>
                  <h4 className="price-value">
                    ${Number(product.basePrice).toLocaleString("es-CO")}
                  </h4>
                </div>
              )}
            </div>

            <div className="price-actions">
              
              {/* ✏️ EDITAR SOLO ADMIN */}
              {isAdmin && (
                <button
                  className="icon-btn edit"
                  onClick={() => handleEditClick(product)}
                >
                  ✏️
                </button>
              )}

              {/* ➕ AGREGAR AL CARRITO ADMIN Y USER */}
              {(isAdmin || isUser) && (
               <button
                className="icon-btn add"
                onClick={() => addToCart(product)}
                disabled={product.stock === 0 || quantityInCart >= product.stock}
              >
                {quantityInCart > 0 ? (
                  <span className="counter-badge">
                    {quantityInCart}
                  </span>
                ) : (
                  "+"
                )}
              </button>
              )}

            </div>
          </div>
        </div>
      );
    })}
  </div>
)}
     {/* ================= MODAL ================= */}
{showModal && (
  <div className="modal-overlay" onClick={() => setShowModal(false)}>
    <div className="modern-modal" onClick={(e) => e.stopPropagation()}>
      
      {/* HEADER */}
      <div className="modal-header">
        <div>
          <h2>Editar Producto</h2>
          <span>Editando: {editForm.name}</span>
        </div>
        <button className="close-btn" onClick={() => setShowModal(false)}>
          ✕
        </button>
      </div>

      {/* BODY */}
      <div className="modal-body">

        {/* Imagen */}
        <div className="image-section">
          {previewImage ? (
            <img src={previewImage} alt="Preview" />
          ) : (
            <div className="image-placeholder">Sin imagen</div>
          )}

          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              setNewImage(file);
              if (file) setPreviewImage(URL.createObjectURL(file));
            }}
          />
        </div>

        {/* FORM GRID */}
        <div className="form-grid">
          
          <div className="form-group full">
            <label>Nombre del producto</label>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) =>
                setEditForm({ ...editForm, name: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label>Categoría</label>
            <select
              value={editForm.category}
              onChange={(e) =>
                setEditForm({ ...editForm, category: e.target.value })
              }
            >
              <option value="">Seleccionar</option>
              {categories.map((cat, index) => (
                <option key={index} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Stock</label>
            <input
              type="number"
              value={editForm.stock}
              onChange={(e) =>
                setEditForm({ ...editForm, stock: e.target.value })
              }
            />
          </div>

          {user?.role === "ADMIN" && (
            <div className="form-group">
              <label>Precio Base</label>
              <input
                type="text"
                value={formatPrice(editForm.basePrice)}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    basePrice: e.target.value.replace(/\D/g, ""),
                  })
                }
              />
            </div>
          )}

          <div className="form-group">
            <label>Precio Venta</label>
            <input
              type="text"
              value={formatPrice(editForm.price)}
              onChange={(e) => handlePriceChange(e.target.value)}
            />
          </div>

          <div className="form-group full">
            <label>Descripción</label>
            <textarea
              value={editForm.description}
              onChange={(e) =>
                setEditForm({ ...editForm, description: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label>Estado</label>
            <select
              value={editForm.active}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  active: e.target.value === "true",
                })
              }
            >
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
            </select>
          </div>

        </div>
      </div>

      {/* FOOTER */}
      <div className="modal-footer">
        <button
          className="btn-cancel"
          onClick={() => setShowModal(false)}
        >
          Cancelar
        </button>

        <button
          className="btn-save"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </div>
  </div>
)}

{showStatsModal && (
  <div className="modal-overlay" onClick={() => setShowStatsModal(false)}>
    <div className="stats-modal" onClick={(e) => e.stopPropagation()}>

      <div className="modal-header">
        <h2>Estadísticas del Inventario</h2>
        <button className="x" onClick={() => setShowStatsModal(false)}>✕</button>
      </div>

      <div className="stats-content">

        <div className="stats-box inventory">
          <h4>Valor total del inventario</h4>
          <h2>${totalInventoryValue.toLocaleString("es-CO")}</h2>
          <p>Suma de todos los precios base × stock</p>
        </div>

        <div className="stats-box profit">
          <h4>Ganancia potencial</h4>
          <h2>${totalPotentialProfit.toLocaleString("es-CO")}</h2>
          <p>Diferencia entre precio venta y base × stock</p>
        </div>

      </div>

    </div>
  </div>
)}
      {toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}
    </div>
  );
}

export default Products;