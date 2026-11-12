import { useEffect, useState } from "react";
import PageHeader from "../../../components/ui/PageHeader";
import Badge from "../../../components/ui/Badge";
import Switch from "../../../components/ui/Switch";
import Button from "../../../components/ui/Button";
import Spinner from "../../../components/ui/Spinner";
import EmptyState from "../../../components/ui/EmptyState";
import Alert from "../../../components/ui/Alert";
import RemoveUserModal from "./RemoveUserModal";
import { adminApi } from "../../../api/admin";
import { useAuth } from "../../../context/useAuth";
import "./AdminPages.css";

const TABS = [
  { value: "", label: "Todos" },
  { value: "ACTIVE", label: "Ativos" },
  { value: "PENDING", label: "Pendentes" },
  { value: "BLOCKED", label: "Bloqueados" },
];

export default function UsersPage() {
  const [status, setStatus] = useState("");
  const [users, setUsers] = useState(null);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  // Modo "remover usuário": mostra o botão de remover nas linhas que
  // podem ser removidas. O backend confere tudo de novo (senha, admin,
  // a si mesmo); isto aqui é só UX.
  const [removeMode, setRemoveMode] = useState(false);
  const [removeTarget, setRemoveTarget] = useState(null);
  const { user: me } = useAuth();

  const canRemove = (u) => u.role !== "ADMIN" && u.id !== me?.id;

  function load() {
    setUsers(null);
    adminApi
      .listUsers(status || undefined)
      .then((res) => setUsers(res.users))
      .catch(() => setError("Não foi possível carregar os usuários."));
  }

  useEffect(load, [status]);

  function updateUser(id, patch) {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)));
  }

  async function handleTogglePermission(user, canViewAllReports) {
    setBusyId(user.id);
    setError("");
    try {
      const { user: updated } = await adminApi.setPermissions(user.id, canViewAllReports);
      updateUser(user.id, updated);
    } catch {
      setError("Não foi possível atualizar a permissão.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleToggleBlock(user) {
    setBusyId(user.id);
    setError("");
    try {
      const { user: updated } =
        user.status === "BLOCKED" ? await adminApi.unblock(user.id) : await adminApi.block(user.id);
      updateUser(user.id, updated);
    } catch {
      setError("Não foi possível atualizar o status.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <PageHeader title="Usuários e permissões" subtitle="Controle quem acessa o sistema e o que cada um vê." />

      <Alert tone="error">{error}</Alert>

      <div className="admin-toolbar">
        <div className="admin-tabs admin-tabs--inline">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              className={`admin-tabs__item ${status === tab.value ? "is-active" : ""}`}
              onClick={() => setStatus(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className={`admin-actions ${removeMode ? "is-armed" : ""}`} role="group" aria-label="Ações administrativas">
          <span className="admin-actions__label">
            <span className="material-symbols-outlined" aria-hidden="true">
              shield_lock
            </span>
            Ações administrativas
          </span>
          <Button
            variant={removeMode ? "danger" : "subtle"}
            size="sm"
            icon={removeMode ? "close" : "person_remove"}
            onClick={() => setRemoveMode((v) => !v)}
            aria-pressed={removeMode}
          >
            {removeMode ? "Cancelar remoção" : "Remover usuário"}
          </Button>
        </div>
      </div>

      {removeMode && (
        <p className="admin-actions__hint">
          <span className="material-symbols-outlined" aria-hidden="true">
            info
          </span>
          Escolha quem remover na lista. Administradores e a sua conta não podem ser removidos. Os
          relatórios do usuário continuam guardados.
        </p>
      )}

      {users === null ? (
        <div style={{ padding: "var(--space-16)", textAlign: "center" }}>
          <Spinner size={28} />
        </div>
      ) : users.length === 0 ? (
        <EmptyState icon="group_off" title="Nenhum usuário encontrado" />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Usuário</th>
                <th>Papel</th>
                <th>Status</th>
                <th>Vê todos os relatórios</th>
                <th style={{ textAlign: "right" }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <strong style={{ display: "block" }}>{u.name}</strong>
                    <span style={{ color: "var(--color-text-muted)", fontSize: "var(--text-xs)" }}>{u.email}</span>
                  </td>
                  <td>
                    <Badge status={u.role} />
                  </td>
                  <td>
                    <Badge status={u.status} />
                  </td>
                  <td>
                    {u.role === "ADMIN" ? (
                      <span style={{ color: "var(--color-text-faint)", fontSize: "var(--text-xs)" }}>
                        Sempre (admin)
                      </span>
                    ) : (
                      <Switch
                        checked={u.canViewAllReports}
                        disabled={busyId === u.id}
                        onChange={(checked) => handleTogglePermission(u, checked)}
                      />
                    )}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {removeMode ? (
                      canRemove(u) ? (
                        <Button variant="danger" size="sm" icon="person_remove" onClick={() => setRemoveTarget(u)}>
                          Remover
                        </Button>
                      ) : (
                        <span style={{ color: "var(--color-text-faint)", fontSize: "var(--text-xs)" }}>
                          {u.id === me?.id ? "Sua conta" : "Protegido (admin)"}
                        </span>
                      )
                    ) : (
                      u.role !== "ADMIN" && (
                      <Button
                        variant={u.status === "BLOCKED" ? "primary" : "danger"}
                        size="sm"
                        icon={u.status === "BLOCKED" ? "lock_open" : "block"}
                        loading={busyId === u.id}
                        onClick={() => handleToggleBlock(u)}
                      >
                        {u.status === "BLOCKED" ? "Reativar" : "Bloquear"}
                      </Button>
                      )
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <RemoveUserModal
        user={removeTarget}
        onClose={() => setRemoveTarget(null)}
        onRemoved={(removed) => {
          setUsers((prev) => prev.filter((u) => u.id !== removed.id));
          setRemoveTarget(null);
        }}
      />
    </div>
  );
}
