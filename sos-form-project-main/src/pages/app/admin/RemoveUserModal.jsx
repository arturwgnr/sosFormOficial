import { useEffect, useState } from "react";
import Modal from "../../../components/ui/Modal";
import Button from "../../../components/ui/Button";
import Field from "../../../components/ui/Field";
import Alert from "../../../components/ui/Alert";
import { adminApi } from "../../../api/admin";
import { ApiError } from "../../../api/client";
import { useToast } from "../../../context/useToast";

// Confirmação + senha de ações administrativas, num passo só. A senha é
// conferida no backend (com limite de tentativas); nada aqui é segurança.
export default function RemoveUserModal({ user, onClose, onRemoved }) {
  const toast = useToast();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Zera o campo a cada usuário novo (a senha nunca fica de um pro outro).
  useEffect(() => {
    setPassword("");
    setError("");
  }, [user?.id]);

  function handleClose() {
    if (!submitting) onClose();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!password) {
      setError("Informe a senha de ações administrativas.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const { keptReports } = await adminApi.removeUser(user.id, password);
      toast.success("Usuário removido", {
        description:
          keptReports > 0
            ? `${user.name} saiu do sistema. ${keptReports} relatório(s) dele(a) continuam guardados.`
            : `${user.name} saiu do sistema.`,
        sound: "reject",
      });
      setPassword("");
      onRemoved(user);
    } catch (err) {
      setPassword("");
      setError(err instanceof ApiError ? err.message : "Não foi possível remover o usuário.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={Boolean(user)}
      onClose={handleClose}
      title="Remover usuário"
      icon="person_remove"
      tone="danger"
    >
      {user && (
        <form onSubmit={handleSubmit} noValidate>
          <p style={{ margin: "0 0 var(--space-4)", color: "var(--color-text-muted)" }}>
            Esta ação apaga a conta do sistema e não pode ser desfeita.
          </p>

          <div className="remove-user__card">
            <span className="admin-request-card__avatar" aria-hidden="true">
              {user.name.trim().charAt(0).toUpperCase()}
            </span>
            <div className="admin-request-card__info">
              <strong>{user.name}</strong>
              <span>{user.email}</span>
            </div>
          </div>

          <p className="remove-user__note">
            <span className="material-symbols-outlined" aria-hidden="true">
              description
            </span>
            Os relatórios criados por este usuário são mantidos e continuam mostrando o nome do técnico.
          </p>

          <Alert tone="error">{error}</Alert>

          <Field label="Senha de ações administrativas" required>
            <input
              type="password"
              autoComplete="off"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
            />
          </Field>

          <div className="remove-user__actions">
            <Button variant="ghost" onClick={handleClose} disabled={submitting}>
              Cancelar
            </Button>
            <Button type="submit" variant="danger" icon="delete" loading={submitting}>
              Remover definitivamente
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
