import { api } from "./client";

export const reportsApi = {
  create: (payload) => api.post("/reports", payload),
  list: (filters) => api.get("/reports", filters),
  get: (id) => api.get(`/reports/${id}`),
  stats: () => api.get("/reports/stats"),
};
