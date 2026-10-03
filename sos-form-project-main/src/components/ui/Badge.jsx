import "./Badge.css";

const TONE_BY_STATUS = {
  PENDING: "warning",
  ACTIVE: "success",
  BLOCKED: "error",
  ADMIN: "primary",
  EMPLOYEE: "neutral",
};

const LABEL_BY_STATUS = {
  PENDING: "Pendente",
  ACTIVE: "Ativo",
  BLOCKED: "Bloqueado",
  ADMIN: "Admin",
  EMPLOYEE: "Funcionário",
};

export default function Badge({ tone, status, children }) {
  const resolvedTone = tone || TONE_BY_STATUS[status] || "neutral";
  const label = children ?? LABEL_BY_STATUS[status] ?? status;

  return <span className={`badge badge--${resolvedTone}`}>{label}</span>;
}
