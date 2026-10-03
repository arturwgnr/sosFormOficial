import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { reportsApi } from "../../api/reports";
import { useAuth } from "../../context/useAuth";
import StatCard from "../../components/ui/StatCard";
import Spinner from "../../components/ui/Spinner";
import EmptyState from "../../components/ui/EmptyState";
import { REPORT_TYPE_LABEL, REPORT_TYPE_ICON, formatDate } from "../../utils/reportLabels";

function monthRange() {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();
  return { from, to };
}

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [recent, setRecent] = useState(null);
  const [monthTotal, setMonthTotal] = useState(null);

  useEffect(() => {
    let active = true;

    reportsApi.list({ pageSize: 5 }).then((res) => {
      if (active) setRecent(res.reports);
    });

    const { from, to } = monthRange();
    reportsApi.list({ from, to, pageSize: 1 }).then((res) => {
      if (active) setMonthTotal(res.total);
    });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div>
      <p style={{ color: "var(--color-text-muted)", marginBottom: "var(--space-6)" }}>
        Olá, {user?.name?.split(" ")[0]}. O que você quer fazer agora?
      </p>

      <div className="employee-dashboard__shortcuts">
        <Link to="/app/paleteira" className="shortcut-card shortcut-card--pallet">
          <div className="shortcut-card__icon">
            <span className="material-symbols-outlined" aria-hidden="true">
              inventory_2
            </span>
          </div>
          <div className="shortcut-card__body">
            <h3>Novo relatório de paleteira</h3>
            <p>Registrar um atendimento agora</p>
          </div>
          <span className="material-symbols-outlined" aria-hidden="true">
            arrow_forward
          </span>
        </Link>

        <Link to="/app/empilhadeira" className="shortcut-card shortcut-card--forklift">
          <div className="shortcut-card__icon">
            <span className="material-symbols-outlined" aria-hidden="true">
              precision_manufacturing
            </span>
          </div>
          <div className="shortcut-card__body">
            <h3>Novo relatório de empilhadeira</h3>
            <p>Registrar um atendimento agora</p>
          </div>
          <span className="material-symbols-outlined" aria-hidden="true">
            arrow_forward
          </span>
        </Link>
      </div>

      <div className="grid-stats" style={{ marginBottom: "var(--space-8)" }}>
        <StatCard
          icon="calendar_month"
          label="Meu total no mês"
          value={monthTotal === null ? <Spinner size={18} /> : monthTotal}
          tone="accent"
        />
      </div>

      <h2 className="section-title">Meus relatórios recentes</h2>
      <div className="card">
        {recent === null ? (
          <div style={{ padding: "var(--space-8)", textAlign: "center" }}>
            <Spinner size={24} />
          </div>
        ) : recent.length === 0 ? (
          <EmptyState
            icon="description"
            title="Nenhum relatório ainda"
            description="Os relatórios que você criar vão aparecer aqui."
          />
        ) : (
          <ul className="dashboard-list">
            {recent.map((r) => (
              <li key={r.id} className="dashboard-list__item">
                <div className="dashboard-list__icon">
                  <span className="material-symbols-outlined" aria-hidden="true">
                    {REPORT_TYPE_ICON[r.type]}
                  </span>
                </div>
                <div className="dashboard-list__info">
                  <strong>{r.data?.client || "Sem cliente informado"}</strong>
                  <span>
                    {r.publicId} · {REPORT_TYPE_LABEL[r.type]}
                  </span>
                </div>
                <span className="dashboard-list__meta">{formatDate(r.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
