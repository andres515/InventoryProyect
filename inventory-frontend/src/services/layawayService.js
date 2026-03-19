import api from "./api";

/* ===============================
   OBTENER TODOS LOS SEPARADOS
================================ */
export const getLayaways = async () => {
  const { data } = await api.get("/layaways");
  return data;
};

/* ===============================
   CREAR SEPARADO
================================ */
export const createLayaway = async (payload) => {
  const { data } = await api.post("/layaways", payload);
  return data;
};

/* ===============================
   AGREGAR ABONO A UN SEPARADO
================================ */
export const addPayment = async (id, paymentData) => {
  const { data } = await api.post(
    `/layaways/${id}/payment`,
    paymentData
  );
  return data;
};

/* ===============================
   OBTENER TODOS LOS ABONOS
   (PARA DASHBOARD / INGRESOS)
================================ */
export const getLayawayPayments = async () => {
  const { data } = await api.get("/layaways/payments");
  return data;
};