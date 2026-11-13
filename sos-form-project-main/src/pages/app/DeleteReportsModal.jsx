import { useEffect, useState } from "react";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Field from "../../components/ui/Field";
import Alert from "../../components/ui/Alert";
import Badge from "../../components/ui/Badge";
import { reportsApi } from "../../api/reports";
import { ApiError } from "../../api/client";
import { useToast } from "../../context/useToast";
import { REPORT_TYPE_LABEL, formatDateTime } from "../../utils/reportLabels";

// Confirmação + senha de ações administrativas, num passo só. A senha e o
// papel de admin são conferidos no backend; nada aqui é segurança.
export default function DeleteReportsModal({ reports, onClose, onDeleted }) {
  const toast = useToast();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const open = reports.length > 0;
  const count = reports.length;
  const plural = count === 1 ? "relatório" : "relatórios";

  useEffect(() => {
    if (open) {
      setPassword("");
      setError("");
    }
  }, [open]);

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
      const { deleted, publicIds } = await reportsApi.remove(
        reports.map((r) => r.id),
        password
      );
      toast.success(deleted === 1 ? "Relatório excluído" : `${deleted} relatórios excluídos`, {
        description:
          publicIds.length <= 3
            ? `${publicIds.join(", ")} ${deleted === 1 ? "foi removido" : "foram removidos"} do sistema.`
            : `${publicIds.slice(0, 3).join(", ")} e mais ${publicIds.length - 3} foram removidos do sistema.`,
        sound: "reject",
      });
      setPassword("");
      onDeleted(reports.map((r) => r.id));
    } catch (err) {
      setPassword("");
      setError(err instanceof ApiError ? err.message : "Não foi possível excluir os relatórios.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={count === 1 ? "Excluir relatório" : `Excluir ${count} relatórios`}
      icon="delete_forever"
      tone="danger"
    >
      {open && (
        <form onSubmit={handleSubmit} noValidate>
          <div className="delete-reports__warning" role="note">
            <span className="material-symbols-outlined" aria-hidden="true">
              warning
            </span>
            <p>
              <strong>Esta ação é irreversível.</strong> {count === 1 ? "O relatório abaixo será apagado" : `Os ${count} ${plural} abaixo serão apagados`}{" "}
              do sistema junto com as assinaturas, e o PDF não poderá mais ser gerado.
            </p>
          </div>

          <ul className="delete-reports__list" aria-label={`${plural} a excluir`}>
            {reports.map((r) => (
              <li key={r.id} className="delete-reports__item">
                <span className="delete-reports__id">{r.publicId}</span>
                <span className="delete-reports__client">{r.data?.client || "Cliente não informado"}</span>
                <Badge tone={r.type === "PALLET" ? "primary" : "accent"}>{REPORT_TYPE_LABEL[r.type]}</Badge>
                <span className="delete-reports__date">{formatDateTime(r.createdAt)}</span>
              </li>
            ))}
          </ul>

          {error && (
            <div className="remove-user__error">
              <Alert tone="error">{error}</Alert>
            </div>
          )}

          <Field label="Senha de ações administrativas" required>
            {/* "new-password": evita o navegador preencher a senha de login salva. */}
            <input
              type="password"
              name="admin-action-password"
              autoComplete="new-password"
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
              {count === 1 ? "Excluir definitivamente" : `Excluir ${count} definitivamente`}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
