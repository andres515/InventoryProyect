import axios from "axios";
import { API_URL } from "../config/config";

export const getClients = async () => {

  const token = localStorage.getItem("token");

  const response = await axios.get(`${API_URL}/clients`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return response.data;
};