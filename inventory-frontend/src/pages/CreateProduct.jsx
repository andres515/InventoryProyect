import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createProduct } from "../services/productService";
import "./CreateProduct.css";

function CreateProduct() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    basePrice: "",
    category: "",
    active: true,
    image: null
  });

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

   // 👇 AQUÍ VA
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

  /* =========================
     FORMATO PRECIO COLOMBIA
  ========================== */

  const formatPrice = (value) => {
    if (!value) return "";
    return Number(value).toLocaleString("es-CO");
  };

  const handlePriceChange = (value) => {
    const numericValue = value.replace(/\D/g, "");
    setForm({ ...form, price: numericValue });
  };

  const handleBasePriceChange = (value) => {
  const numericValue = value.replace(/\D/g, "");
  setForm({ ...form, basePrice: numericValue });
};

  /* =========================
     Inputs normales
  ========================== */

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value
    });
  };

  /* =========================
     Imagen
  ========================== */

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setForm({
        ...form,
        image: file
      });

      setPreview(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  /* =========================
     Enviar formulario
  ========================== */

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("basePrice", parseFloat(form.basePrice));
      formData.append("price", parseFloat(form.price));
      formData.append("stock", parseInt(form.stock));
      formData.append("category", form.category);
      formData.append("active", form.active);

      if (form.image) {
        formData.append("image", form.image);
      }

      await createProduct(formData);

      navigate("/products");

    } catch (err) {
      setError("Error al crear el producto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-container">
      <div className="create-card">
        <h2>Crear Producto</h2>

        {error && <p className="error">{error}</p>}

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Nombre</label>
            <input
              name="name"
              placeholder="Producto"
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Descripción</label>
            <textarea
              name="description"
              placeholder="Describe el producto..."
              onChange={handleChange}
            />
          </div>

           <div className="form-group">
            <label>Precio Base (COP)</label>
            <input
              type="text"
              value={formatPrice(form.basePrice)}
              onChange={(e) => handleBasePriceChange(e.target.value)}
              placeholder="800.000"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Precio (COP)</label>
              <input
                type="text"
                value={formatPrice(form.price)}
                onChange={(e) => handlePriceChange(e.target.value)}
                placeholder="1.000.000"
              />
            </div>
           

            <div className="form-group">
              <label>Stock</label>
              <input
                type="number"
                name="stock"
                placeholder="10"
                onChange={handleChange}
              />
            </div>
          </div>

         <div className="form-group">
            <label>Categoría</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
            >
              <option value="">Seleccionar categoría</option>

              {categories.map((cat, index) => (
                <option key={index} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                name="active"
                checked={form.active}
                onChange={handleChange}
              />
              Producto Activo
            </label>
          </div>

          <div className="form-group">
            <label>Imagen del producto</label>

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />

            {preview && (
              <img
                src={preview}
                alt="preview"
                className="image-preview"
              />
            )}
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Guardando..." : "Guardar Producto"}
          </button>

        </form>
      </div>
    </div>
  );
}

export default CreateProduct;