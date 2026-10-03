import "./StatCard.css";

export default function StatCard({ icon, label, value, hint, tone = "neutral" }) {
  return (
    <div className={`stat-card stat-card--${tone}`}>
      <div className="stat-card__icon">
        <span className="material-symbols-outlined" aria-hidden="true">
          {icon}
        </span>
      </div>
      <div className="stat-card__body">
        <p className="stat-card__label">{label}</p>
        <p className="stat-card__value">{value}</p>
        {hint && <p className="stat-card__hint">{hint}</p>}
      </div>
    </div>
  );
}
