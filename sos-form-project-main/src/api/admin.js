import { api } from "./client";

export const adminApi = {
  listPending: () => api.get("/admin/users/pending"),
  listUsers: (status) => api.get("/admin/users", status ? { status } : undefined),
  approve: (id) => api.post(`/admin/users/${id}/approve`),
  reject: (id) => api.post(`/admin/users/${id}/reject`),
  block: (id) => api.post(`/admin/users/${id}/block`),
  unblock: (id) => api.post(`/admin/users/${id}/unblock`),
  setPermissions: (id, canViewAllReports) =>
    api.patch(`/admin/users/${id}/permissions`, { canViewAllReports }),
};
