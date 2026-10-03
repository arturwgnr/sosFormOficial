import { api } from "./client";

export const authApi = {
  me: () => api.get("/auth/me"),
  login: (email, password) => api.post("/auth/login", { email, password }),
  register: (name, email, password) => api.post("/auth/register", { name, email, password }),
  logout: () => api.post("/auth/logout"),
};
