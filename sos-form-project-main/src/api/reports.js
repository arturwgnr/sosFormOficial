import { api } from "./client";

export const reportsApi = {
  create: (payload) => api.post("/reports", payload),
  list: (filters) => api.get("/reports", filters),
  get: (id) => api.get(`/reports/${id}`),
  stats: () => api.get("/reports/stats"),
  // Ação sensível (só admin): o backend confere a senha de ações administrativas.
  remove: (ids, actionPassword) => api.post("/reports/delete", { ids, actionPassword }),
};
