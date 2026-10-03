import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import Field from "../../components/ui/Field";
import Button from "../../components/ui/Button";
import Alert from "../../components/ui/Alert";
import { useAuth } from "../../context/useAuth";
import { ApiError } from "../../api/client";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("As senhas não são iguais.");
      return;
    }

    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate("/aguardando-aprovacao", { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.issues?.[0]?.message || err.message);
      } else {
        setError("Não foi possível conectar ao servidor. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Novo cadastro"
      title="Criar sua conta"
      subtitle="Depois de criar, um administrador precisa aprovar antes de você poder entrar."
      footer={
        <>
          Já tem conta? <Link to="/login">Entrar</Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        <Alert tone="error">{error}</Alert>

        <Field label="Nome" required>
          <input
            type="text"
            name="name"
            autoComplete="name"
            value={form.name}
            onChange={handleChange}
            required
            minLength={2}
            placeholder="Seu nome completo"
          />
        </Field>

        <Field label="E-mail" required>
          <input
            type="email"
            name="email"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            required
            placeholder="voce@exemplo.com"
          />
        </Field>

        <Field label="Senha" required hint="Mínimo de 8 caracteres.">
          <input
            type="password"
            name="password"
            autoComplete="new-password"
            value={form.password}
            onChange={handleChange}
            required
            minLength={8}
            placeholder="••••••••"
          />
        </Field>

        <Field label="Confirmar senha" required>
          <input
            type="password"
            name="confirmPassword"
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            minLength={8}
            placeholder="••••••••"
          />
        </Field>

        <Button type="submit" variant="primary" block loading={loading}>
          Criar conta
        </Button>
      </form>
    </AuthLayout>
  );
}
