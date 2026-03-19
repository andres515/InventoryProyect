import axios from "axios";
import { API_URL } from "../config/config";

export const processReturn = async (data) => {

  const token = localStorage.getItem("token");

  const res = await axios.post(
    `${API_URL}/api/returns`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  return res.data;
};


// 🔥 obtener devoluciones
export const getReturns = async () => {

  const token = localStorage.getItem("token");

  const res = await axios.get(
    `${API_URL}/api/returns`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  return res.data;

};