import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import api from "../api/axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {

  const [token, setToken] = useState(localStorage.getItem("token"));

  const [user, setUser] = useState(
    token ? jwtDecode(token) : null
  );

  const [business, setBusiness] = useState(null);

  // ===============================
  // CARGAR NEGOCIO
  // ===============================
  const loadBusiness = async (decodedUser) => {
    try {

      if (!decodedUser?.businessId) {
        setBusiness(null);
        return;
      }

      const response = await api.get("/business/me");

      // 🔥 rompe cache del logo automáticamente
      const data = response.data;

      if (data.logoUrl) {
        data.logoUrl = `${data.logoUrl}?t=${Date.now()}`;
      }

      setBusiness(data);

    } catch (error) {

      console.error("Error cargando negocio", error);
      setBusiness(null);

    }
  };

  // ===============================
  // REFRESCAR NEGOCIO (🔥 NUEVO)
  // ===============================
  const refreshBusiness = async () => {

    if (!user?.businessId) return;

    try {

      const response = await api.get("/business/me");

      const data = response.data;

      if (data.logoUrl) {
        data.logoUrl = `${data.logoUrl}?t=${Date.now()}`;
      }

      setBusiness(data);

    } catch (error) {

      console.error("Error refrescando negocio", error);

    }

  };

  // ===============================
  // CUANDO CAMBIE TOKEN
  // ===============================
  useEffect(() => {

    if (!token) {

      setUser(null);
      setBusiness(null);
      return;

    }

    try {

      const decoded = jwtDecode(token);

      setUser(decoded);

      loadBusiness(decoded);

    } catch (error) {

      console.error("Token inválido");

      logout();

    }

  }, [token]);

  // ===============================
  // LOGIN
  // ===============================
  const login = (newToken) => {

    localStorage.setItem("token", newToken);

    const decoded = jwtDecode(newToken);

    setToken(newToken);
    setUser(decoded);

    loadBusiness(decoded);

  };

  // ===============================
  // LOGOUT
  // ===============================
  const logout = () => {

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken(null);
    setUser(null);
    setBusiness(null);

  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        business,
        loadBusiness,
        refreshBusiness, // 🔥 importante
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);