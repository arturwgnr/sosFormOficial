import "./Alert.css";

const ICON_BY_TONE = {
  error: "error",
  success: "check_circle",
  warning: "warning",
  info: "info",
};

export default function Alert({ tone = "info", children }) {
  if (!children) return null;

  return (
    <div className={`alert alert--${tone}`} role={tone === "error" ? "alert" : "status"}>
      <span className="material-symbols-outlined" aria-hidden="true">
        {ICON_BY_TONE[tone]}
      </span>
      <span>{children}</span>
    </div>
  );
}
