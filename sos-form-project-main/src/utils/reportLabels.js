export const REPORT_TYPE_LABEL = {
  PALLET: "Paleteira",
  FORKLIFT: "Empilhadeira",
};

export const REPORT_TYPE_ICON = {
  PALLET: "inventory_2",
  FORKLIFT: "precision_manufacturing",
};

export function formatDate(dateLike) {
  return new Date(dateLike).toLocaleDateString("pt-BR");
}

export function formatDateTime(dateLike) {
  return new Date(dateLike).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
