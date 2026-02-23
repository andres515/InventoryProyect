import api from "./api";

export const getProducts = async (page = 0, size = 10) => {
  const response = await api.get(`/products?page=${page}&size=${size}`);
  return response.data.content;
};

export const createProduct = async (formData) => {
  const response = await api.post("/products", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });

  return response.data;
};