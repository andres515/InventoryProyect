import api from "./api";

/* ===============================
   OBTENER PRODUCTOS (PAGINADO)
================================= */
export const getProducts = async (page = 0, size = 10) => {
  const response = await api.get(`/products?page=${page}&size=${size}`);
  return response.data.content;
};

/* ===============================
   CREAR PRODUCTO (CON IMAGEN)
================================= */
export const createProduct = async (formData) => {
  const response = await api.post("/products", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

/* ===============================
   ACTUALIZAR PRODUCTO
================================= */
export const updateProduct = async (id, formData) => {
  const token = localStorage.getItem("token");

  const response = await api.put(
    `/products/${id}`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`
        // 🚫 NO pongas Content-Type manualmente
      }
    }
  );

  return response.data;
};