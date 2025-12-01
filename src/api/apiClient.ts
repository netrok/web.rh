// src/api/apiClient.ts
import axios from "axios";

// Aquí forzamos a TypeScript a no chillar por import.meta.env
const API_BASE_URL =
  (import.meta as any).env?.VITE_API_URL ?? "http://localhost:8080";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// 1) Interceptor de REQUEST → agrega el token a cada petición
apiClient.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");

    if (accessToken) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 2) Interceptor de RESPONSE → maneja 401 (token inválido/expirado)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("username");
      localStorage.removeItem("roles");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
export { apiClient };
