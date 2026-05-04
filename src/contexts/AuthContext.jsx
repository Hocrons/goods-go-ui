import { createContext, useContext, useEffect, useState } from "react";
import api, { extractError } from "@/services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [seller, setSeller] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedSeller = localStorage.getItem("seller");
    if (storedToken) setToken(storedToken);
    if (storedSeller) {
      try {
        setSeller(JSON.parse(storedSeller));
      } catch {
        /* ignore */
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await api.post("/auth/login", { email, password });
      const jwt = data.token || data.access_token;
      if (!jwt) throw new Error("Token não retornado pela API");
      localStorage.setItem("token", jwt);
      setToken(jwt);
      if (data.seller) {
        localStorage.setItem("seller", JSON.stringify(data.seller));
        setSeller(data.seller);
      }
      return { success: true };
    } catch (error) {
      return { success: false, message: extractError(error, "Falha ao entrar") };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("seller");
    setToken(null);
    setSeller(null);
  };

  return (
    <AuthContext.Provider
      value={{ seller, token, loading, login, logout, isAuthenticated: !!token }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
