// src/utils/idGenerator.ts

// Paleteira
export function generatePalletReportId() {
  const key = "pallet_lastReportId";
  const lastId = localStorage.getItem(key);
  const nextId = lastId ? parseInt(lastId) + 1 : 1;
  localStorage.setItem(key, nextId.toString());
  return String(nextId).padStart(4, "0"); // 0001, 0002...
}

// Empilhadeira
export function generateForkliftReportId() {
  const key = "forklift_lastReportId";
  const lastId = localStorage.getItem(key);
  const nextId = lastId ? parseInt(lastId) + 1 : 1;
  localStorage.setItem(key, nextId.toString());
  return String(nextId).padStart(4, "0");
}