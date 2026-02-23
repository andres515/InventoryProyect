import { createContext, useContext, useState } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export function AuthProvider({ children }) {

  const [token, setToken] = useState(localStorage.getItem("token"));

  const [user, setUser] = useState(
    token ? jwtDecode(token) : null
  );

  const login = (token) => {
    localStorage.setItem("token", token);

    const decoded = jwtDecode(token);

    setToken(token);
    setUser(decoded);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);