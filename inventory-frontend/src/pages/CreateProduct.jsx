import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createProduct } from "../services/productService";

function CreateProduct() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    active: true,
    image: null
  });

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =========================
  // Inputs normales
  // =========================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value
    });
  };

  // =========================
  // Seleccionar imagen
  // =========================
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

  // limpiar memoria preview
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  // =========================
  // Enviar formulario
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("name", form.name);
      formData.append("description", form.description);
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
    <div className="create-product">
      <h2>Crear Producto</h2>

      {error && <p>{error}</p>}

      <form onSubmit={handleSubmit}>

        <input name="name" placeholder="Nombre" onChange={handleChange} />

        <textarea
          name="description"
          placeholder="Descripción"
          onChange={handleChange}
        />

        <input
          type="number"
          name="price"
          placeholder="Precio"
          onChange={handleChange}
        />

        <input
          type="number"
          name="stock"
          placeholder="Stock"
          onChange={handleChange}
        />

        <input
          name="category"
          placeholder="Categoría"
          onChange={handleChange}
        />

        <label>
          Activo
          <input
            type="checkbox"
            name="active"
            checked={form.active}
            onChange={handleChange}
          />
        </label>

        {/* IMAGEN */}
        <div>
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
              style={{
                width: "150px",
                marginTop: "10px",
                borderRadius: "10px"
              }}
            />
          )}
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Guardando..." : "Guardar Producto"}
        </button>

      </form>
    </div>
  );
}

export default CreateProduct;