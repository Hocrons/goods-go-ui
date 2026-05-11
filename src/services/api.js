import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
});

// Interceptor de token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  config.headers = config.headers || {};
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de resposta para tratar 401 e limpar token inválido
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("seller");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const extractError = (error, fallback = "Erro inesperado") => {
  const data = error.response?.data;
  if (!data) {
    return error.message || fallback;
  }
  return (
    data.message ||
    data.error ||
    data.erro ||
    error.message ||
    fallback
  );
};

export default api;