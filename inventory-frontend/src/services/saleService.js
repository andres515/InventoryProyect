import api from "./api";

/*
  data = {
    items: cartItems,
    clientId: number | null,
    paymentMethod: "EFECTIVO" | "NEQUI" | "DAVIPLATA",
    amountReceived: number | null
  }
*/

export const createSale = async (data) => {

  const response = await api.post("/sales", {

    businessId: 1, // luego lo podemos hacer dinámico

    clientId: data.clientId, // 🔥 ESTA ES LA LINEA QUE FALTABA

    paymentMethod: data.paymentMethod,

    amountReceived: data.amountReceived,

    items: data.items.map((item) => ({
      productId: item.id,
      quantity: item.quantity
    }))

  });

  return response.data;
};

export const getSales = async () => {
  const response = await api.get("/sales");
  return response.data;
};