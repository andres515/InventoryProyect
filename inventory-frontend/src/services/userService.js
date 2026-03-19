import axios from "axios";
import { API_URL } from "../config/config";

export const createUser = async (userData) => {
  const token = localStorage.getItem("token");

  const response = await axios.post(
    `${API_URL}/api/user`,// ✅ singular
    userData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const getUsers = async () => {
  const token = localStorage.getItem("token");

  const response = await axios.get(
    `${API_URL}/api/user`, // ✅ singular
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  

  return response.data;
};
export const deleteUser = async (id) => {
  const token = localStorage.getItem("token");

  await axios.delete(`${API_URL}/api/user/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};