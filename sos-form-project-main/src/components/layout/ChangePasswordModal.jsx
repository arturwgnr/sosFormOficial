import { useEffect, useState } from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Field from "../ui/Field";
import Alert from "../ui/Alert";
import PasswordInput from "../ui/PasswordInput";
import { authApi } from "../../api/auth";
import { ApiError } from "../../api/client";
import { useToast } from "../../context/useToast";
import "./ChangePasswordModal.css";

const MIN_LENGTH = 8; // mesma regra do backend (registro e troca de senha)
const EMPTY = { currentPassword: "", newPassword: "", confirmPassword: "" };

// Validação local só pra dar resposta rápida; o backend valida tudo de novo.
function validate(values) {
  const errors = {};
  if (!values.currentPassword) errors.currentPassword = "Informe a senha atual.";
  if (!values.newPassword) {
    errors.newPassword = "Informe a nova senha.";
  } else if (values.newPassword.length < MIN_LENGTH) {
    errors.newPassword = `A nova senha precisa de pelo menos ${MIN_LENGTH} caracteres.`;
  } else if (values.newPassword === values.currentPassword) {
    errors.newPassword = "A nova senha precisa ser diferente da atual.";
  }
  if (!values.confirmPassword) {
    errors.confirmPassword = "Confirme a nova senha.";
  } else if (values.newPassword && values.confirmPassword !== values.newPassword) {
    errors.confirmPassword = "As duas senhas novas não são iguais.";
  }
  return errors;
}

export default function ChangePasswordModal({ open, onClose }) {
  const toast = useToast();
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Cada abertura começa limpa: senha nunca fica guardada entre usos.
  useEffect(() => {
    if (open) {
      setValues(EMPTY);
      setErrors({});
      setFormError("");
    }
  }, [open]);

  function setField(key, value) {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function handleClose() {
    if (!submitting) onClose();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    setFormError("");
    if (Object.keys(found).length) return;

    setSubmitting(true);
    try {
      const { closedSessions } = await authApi.changePassword(
        values.currentPassword,
        values.newPassword,
        values.confirmPassword
      );
      toast.success("Senha alterada", {
        description:
          closedSessions > 0
            ? `${closedSessions} outra(s) sessão(ões) aberta(s) foram encerradas. Este aparelho continua conectado.`
            : "As outras sessões abertas foram encerradas. Este aparelho continua conectado.",
        sound: "approve",
      });
      setValues(EMPTY);
      onClose();
    } catch (err) {
      if (err instanceof ApiError && err.issues?.length) {
        const byField = {};
        err.issues.forEach((i) => {
          if (i.path && !byField[i.path]) byField[i.path] = i.message;
        });
        setErrors(byField);
      } else {
        setFormError(err instanceof ApiError ? err.message : "Não foi possível alterar a senha.");
        // Senha atual errada: limpa só ela, as novas continuam.
        if (err instanceof ApiError && err.status === 403) {
          setValues((prev) => ({ ...prev, currentPassword: "" }));
        }
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="Alterar senha" icon="lock_reset">
      <form onSubmit={handleSubmit} noValidate className="change-password">
        <p className="change-password__intro">
          Por segurança, ao alterar a senha as outras sessões abertas da sua conta (outros
          aparelhos ou navegadores) são encerradas.
        </p>

        {formError && (
          <div className="change-password__error">
            <Alert tone="error">{formError}</Alert>
          </div>
        )}

        <Field label="Senha atual" required error={errors.currentPassword}>
          <PasswordInput
            name="current-password"
            autoComplete="current-password"
            autoFocus
            value={values.currentPassword}
            onChange={(e) => setField("currentPassword", e.target.value)}
            disabled={submitting}
            aria-invalid={Boolean(errors.currentPassword)}
          />
        </Field>

        <Field
          label="Nova senha"
          required
          error={errors.newPassword}
          hint={`Pelo menos ${MIN_LENGTH} caracteres.`}
        >
          <PasswordInput
            name="new-password"
            autoComplete="new-password"
            value={values.newPassword}
            onChange={(e) => setField("newPassword", e.target.value)}
            disabled={submitting}
            aria-invalid={Boolean(errors.newPassword)}
          />
        </Field>

        <Field label="Confirmar nova senha" required error={errors.confirmPassword}>
          <PasswordInput
            name="confirm-password"
            autoComplete="new-password"
            value={values.confirmPassword}
            onChange={(e) => setField("confirmPassword", e.target.value)}
            disabled={submitting}
            aria-invalid={Boolean(errors.confirmPassword)}
          />
        </Field>

        <div className="change-password__actions">
          <Button variant="ghost" onClick={handleClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button type="submit" icon="check" loading={submitting}>
            Salvar nova senha
          </Button>
        </div>
      </form>
    </Modal>
  );
}
