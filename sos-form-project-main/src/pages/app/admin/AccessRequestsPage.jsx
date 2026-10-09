import { useEffect, useState } from "react";
import PageHeader from "../../../components/ui/PageHeader";
import Button from "../../../components/ui/Button";
import EmptyState from "../../../components/ui/EmptyState";
import Spinner from "../../../components/ui/Spinner";
import Alert from "../../../components/ui/Alert";
import { adminApi } from "../../../api/admin";
import { useToast } from "../../../context/useToast";
import { formatDateTime } from "../../../utils/reportLabels";
import "./AdminPages.css";

export default function AccessRequestsPage() {
  const [users, setUsers] = useState(null);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const toast = useToast();

  function load() {
    adminApi
      .listPending()
      .then((res) => setUsers(res.users))
      .catch(() => setError("Não foi possível carregar as solicitações."));
  }

  useEffect(load, []);

  async function handleDecision(user, action) {
    setBusyId(user.id);
    try {
      if (action === "approve") {
        await adminApi.approve(user.id);
        toast.success("Acesso aprovado", {
          description: `${user.name} já pode entrar no sistema.`,
          sound: "approve",
        });
      } else {
        await adminApi.reject(user.id);
        toast.warning("Cadastro recusado", {
          description: `${user.name} não terá acesso ao sistema.`,
          sound: "reject",
        });
      }
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } catch {
      toast.error("Não foi possível completar a ação", {
        description: "Verifique sua conexão e tente novamente.",
      });
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
                  onClick={() => handleDecision(u, "reject")}
                >
                  Recusar
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon="check"
                  loading={busyId === u.id}
                  onClick={() => handleDecision(u, "approve")}
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
