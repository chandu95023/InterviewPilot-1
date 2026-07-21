// src/services/adminApi.ts
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api/admin",
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem("admin_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default {
  login: (email: string, password: string) => api.post("/login", { email, password }),
  refresh: (refreshToken: string) => api.post("/refresh", { token: refreshToken }),
  profile: () => api.get("/profile"),
  // generic CRUD helpers
  get: (resource: string, params = {}) => api.get(`/${resource}`, { params }),
  post: (resource: string, data: any) => api.post(`/${resource}`, data),
  put: (resource: string, id: string, data: any) => api.put(`/${resource}/${id}`, data),
  delete: (resource: string, id: string) => api.delete(`/${resource}/${id}`),
};
