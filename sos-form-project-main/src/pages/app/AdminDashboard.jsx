import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { reportsApi } from "../../api/reports";
import StatCard from "../../components/ui/StatCard";
import Spinner from "../../components/ui/Spinner";
import EmptyState from "../../components/ui/EmptyState";
import BarChart from "../../components/ui/BarChart";
import Button from "../../components/ui/Button";
import { REPORT_TYPE_LABEL, REPORT_TYPE_ICON, formatDate } from "../../utils/reportLabels";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    reportsApi
      .stats()
      .then((res) => active && setStats(res))
      .catch(() => active && setError("Não foi possível carregar as estatísticas."));

    reportsApi.list({ pageSize: 6 }).then((res) => active && setRecent(res.reports));

    return () => {
      active = false;
    };
  }, []);

  if (error) {
    return <EmptyState icon="error" title="Algo deu errado" description={error} />;
  }

  if (!stats) {
    return (
      <div style={{ padding: "var(--space-16)", textAlign: "center" }}>
        <Spinner size={28} />
      </div>
    );
  }

  const maxTechnicianCount = Math.max(1, ...stats.byTechnician.map((t) => t.count));
  const maxServiceTypeCount = Math.max(1, ...Object.values(stats.serviceTypeBreakdown));
  const maxClientCount = Math.max(1, ...stats.topClients.map((c) => c.count));

  return (
    <div>
      {stats.pendingUsersCount > 0 && (
        <div className="admin-dashboard__pending-banner">
          <span className="material-symbols-outlined" aria-hidden="true">
            person_add
          </span>
          <div>
            <strong>
              {stats.pendingUsersCount} solicitaç{stats.pendingUsersCount === 1 ? "ão" : "ões"} de acesso
              aguardando
            </strong>
            <p>Aprove ou recuse cadastros novos.</p>
          </div>
          <Link to="/app/admin/solicitacoes">
            <Button variant="primary" size="sm">
              Revisar
            </Button>
          </Link>
        </div>
      )}

      <div className="grid-stats" style={{ marginBottom: "var(--space-8)" }}>
        <StatCard icon="calendar_month" label={`Relatórios em ${stats.monthLabel}`} value={stats.totalThisMonth} />
        <StatCard
          icon="inventory_2"
          label="Paleteira no mês"
          value={stats.byTypeThisMonth.PALLET}
          tone="accent"
        />
        <StatCard
          icon="precision_manufacturing"
          label="Empilhadeira no mês"
          value={stats.byTypeThisMonth.FORKLIFT}
          tone="accent"
        />
        <StatCard icon="group" label="Solicitações pendentes" value={stats.pendingUsersCount} tone="warning" />
      </div>

      <div className="admin-dashboard__grid">
        <div>
          <div className="card card--padded" style={{ marginBottom: "var(--space-6)" }}>
            <h2 className="section-title">Relatórios por mês</h2>
            <BarChart
              data={stats.monthlySeries.map((m) => ({ label: m.label, value: m.count }))}
              height={180}
            />
          </div>

          <h2 className="section-title">Últimos relatórios criados</h2>
          <div className="card">
            {recent === null ? (
              <div style={{ padding: "var(--space-8)", textAlign: "center" }}>
                <Spinner size={24} />
              </div>
            ) : recent.length === 0 ? (
              <EmptyState icon="description" title="Nenhum relatório ainda" />
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

        <div>
          <div className="card card--padded" style={{ marginBottom: "var(--space-6)" }}>
            <h2 className="section-title">Relatórios por técnico (mês)</h2>
            {stats.byTechnician.length === 0 ? (
              <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>
                Nenhum relatório este mês.
              </p>
            ) : (
              <div className="breakdown-list">
                {stats.byTechnician.map((t) => (
                  <div className="breakdown-row" key={t.authorId}>
                    <span className="breakdown-row__label" title={t.name} style={{ textTransform: "none" }}>
                      {t.name}
                    </span>
                    <div className="breakdown-row__track">
                      <div
                        className="breakdown-row__fill"
                        style={{ width: `${(t.count / maxTechnicianCount) * 100}%` }}
                      />
                    </div>
                    <span className="breakdown-row__value">{t.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card card--padded" style={{ marginBottom: "var(--space-6)" }}>
            <h2 className="section-title">Serviços por tipo (empilhadeira)</h2>
            <div className="breakdown-list">
              {Object.entries(stats.serviceTypeBreakdown).map(([key, count]) => (
                <div className="breakdown-row" key={key}>
                  <span className="breakdown-row__label">{key}</span>
                  <div className="breakdown-row__track">
                    <div
                      className="breakdown-row__fill"
                      style={{ width: `${(count / maxServiceTypeCount) * 100}%` }}
                    />
                  </div>
                  <span className="breakdown-row__value">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card card--padded">
            <h2 className="section-title">Clientes mais atendidos</h2>
            {stats.topClients.length === 0 ? (
              <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>
                Nenhum relatório com cliente informado ainda.
              </p>
            ) : (
              <div className="breakdown-list">
                {stats.topClients.map((c) => (
                  <div className="breakdown-row" key={c.client}>
                    <span className="breakdown-row__label" title={c.client} style={{ textTransform: "none" }}>
                      {c.client}
                    </span>
                    <div className="breakdown-row__track">
                      <div className="breakdown-row__fill" style={{ width: `${(c.count / maxClientCount) * 100}%` }} />
                    </div>
                    <span className="breakdown-row__value">{c.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
