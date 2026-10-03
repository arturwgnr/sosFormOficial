import "./EmptyState.css";

export default function EmptyState({ icon = "inbox", title, description, action }) {
  return (
    <div className="empty-state">
      <span className="material-symbols-outlined empty-state__icon" aria-hidden="true">
        {icon}
      </span>
      <h3 className="empty-state__title">{title}</h3>
      {description && <p className="empty-state__description">{description}</p>}
      {action && <div className="empty-state__action">{action}</div>}
    </div>
  );
}
