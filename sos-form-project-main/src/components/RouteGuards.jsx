import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import Spinner from "./ui/Spinner";

// Nota: isto é só UX (evita piscar tela errada). A permissão de verdade é
// sempre verificada no backend — nenhuma rota aqui "protege" nada sozinha.

export function FullScreenLoading() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "var(--color-bg)",
      }}
    >
      <Spinner size={32} />
    </div>
  );
}

export function RequireAuth() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullScreenLoading />;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;

  return <Outlet />;
}

export function RequireRole({ role }) {
  const { user, loading } = useAuth();

  if (loading) return <FullScreenLoading />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to="/app" replace />;

  return <Outlet />;
}

// Usado em /login e /registro: quem já está logado não precisa ver essas telas.
export function RedirectIfAuthed({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <FullScreenLoading />;
  if (user) return <Navigate to="/app" replace />;

  return children;
}
