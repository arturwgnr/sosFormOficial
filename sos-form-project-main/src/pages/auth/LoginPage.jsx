import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import Field from "../../components/ui/Field";
import Button from "../../components/ui/Button";
import Alert from "../../components/ui/Alert";
import { useAuth } from "../../context/useAuth";
import { ApiError } from "../../api/client";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate(location.state?.from || "/app", { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Não foi possível conectar ao servidor. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Acesso ao sistema"
      title="Entrar na sua conta"
      subtitle="Use o e-mail e a senha do seu cadastro."
      footer={
        <>
          Ainda não tem conta? <Link to="/registro">Criar cadastro</Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        <Alert tone="error">{error}</Alert>

        <Field label="E-mail" required>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="voce@exemplo.com"
          />
        </Field>

        <Field label="Senha" required>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
          />
        </Field>

        <Button type="submit" variant="primary" block loading={loading}>
          Entrar
        </Button>
      </form>
    </AuthLayout>
  );
}
