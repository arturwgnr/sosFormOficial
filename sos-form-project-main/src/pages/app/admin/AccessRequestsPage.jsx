import { useEffect, useState } from "react";
import PageHeader from "../../../components/ui/PageHeader";
import Button from "../../../components/ui/Button";
import EmptyState from "../../../components/ui/EmptyState";
import Spinner from "../../../components/ui/Spinner";
import Alert from "../../../components/ui/Alert";
import { adminApi } from "../../../api/admin";
import { formatDateTime } from "../../../utils/reportLabels";
import "./AdminPages.css";

export default function AccessRequestsPage() {
  const [users, setUsers] = useState(null);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  function load() {
    adminApi
      .listPending()
      .then((res) => setUsers(res.users))
      .catch(() => setError("Não foi possível carregar as solicitações."));
  }

  useEffect(load, []);

  async function handleDecision(id, action) {
    setBusyId(id);
    setError("");
    try {
      if (action === "approve") await adminApi.approve(id);
      else await adminApi.reject(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch {
      setError("Não foi possível completar a ação.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <PageHeader title="Solicitações de acesso" subtitle="Cadastros novos aguardando aprovação." />

      <Alert tone="error">{error}</Alert>

      {users === null ? (
        <div style={{ padding: "var(--space-16)", textAlign: "center" }}>
          <Spinner size={28} />
        </div>
      ) : users.length === 0 ? (
        <EmptyState icon="task_alt" title="Nada pendente" description="Todos os cadastros já foram avaliados." />
      ) : (
        <div className="admin-requests">
          {users.map((u) => (
            <div className="admin-request-card card" key={u.id}>
              <div className="admin-request-card__avatar">{u.name[0]?.toUpperCase()}</div>
              <div className="admin-request-card__info">
                <strong>{u.name}</strong>
                <span>{u.email}</span>
                <span className="admin-request-card__date">Cadastrado em {formatDateTime(u.createdAt)}</span>
              </div>
              <div className="admin-request-card__actions">
                <Button
                  variant="danger"
                  size="sm"
                  icon="close"
                  loading={busyId === u.id}
                  onClick={() => handleDecision(u.id, "reject")}
                >
                  Recusar
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon="check"
                  loading={busyId === u.id}
                  onClick={() => handleDecision(u.id, "approve")}
                >
                  Aprovar
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
