import axios from "axios";
import { handleMockApi } from "./demoFallback";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("agrisetu_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If backend is unavailable, 404, or 405 (e.g. static hosting on Vercel without backend server)
    if (!error.response || error.response.status === 405 || error.response.status === 404) {
      console.warn("AgriSetu API unreachable or 405/404. Falling back to demo mode.");
      const mockResult = handleMockApi(error.config || {});
      return Promise.resolve(mockResult);
    }
    return Promise.reject(error);
  }
);

export default api;
