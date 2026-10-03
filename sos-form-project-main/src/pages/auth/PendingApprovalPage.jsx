import { Link } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import Button from "../../components/ui/Button";

export default function PendingApprovalPage() {
  return (
    <AuthLayout eyebrow="Quase lá" title="Cadastro enviado">
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            width: 64,
            height: 64,
            margin: "0 auto var(--space-5)",
            borderRadius: "var(--radius-full)",
            background: "var(--color-warning-bg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "2rem", color: "var(--color-warning)" }}
            aria-hidden="true"
          >
            hourglass_top
          </span>
        </div>
        <p style={{ color: "var(--color-text-muted)", lineHeight: "var(--leading-relaxed)" }}>
          Sua conta está aguardando aprovação de um administrador. Assim que for aprovada, você
          já consegue entrar normalmente com seu e-mail e senha.
        </p>

        <Link to="/login" style={{ display: "block", marginTop: "var(--space-6)" }}>
          <Button variant="ghost" block>
            Voltar para o login
          </Button>
        </Link>
      </div>
    </AuthLayout>
  );
}
