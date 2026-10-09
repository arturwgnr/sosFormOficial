import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastProvider";
import { RequireAuth, RequireRole, RedirectIfAuthed } from "./components/RouteGuards";
import AppShell from "./components/layout/AppShell";

import LandingPage from "./pages/landing/LandingPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import PendingApprovalPage from "./pages/auth/PendingApprovalPage";

import DashboardPage from "./pages/app/DashboardPage";
import PalletReportPage from "./pages/app/PalletReportPage";
import ForkliftReportPage from "./pages/app/ForkliftReportPage";
import HistoryPage from "./pages/app/HistoryPage";
import AccessRequestsPage from "./pages/app/admin/AccessRequestsPage";
import UsersPage from "./pages/app/admin/UsersPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Públicas */}
            <Route path="/" element={<LandingPage />} />
            <Route
              path="/login"
              element={
                <RedirectIfAuthed>
                  <LoginPage />
                </RedirectIfAuthed>
              }
            />
            <Route
              path="/registro"
              element={
                <RedirectIfAuthed>
                  <RegisterPage />
                </RedirectIfAuthed>
              }
            />
            <Route path="/aguardando-aprovacao" element={<PendingApprovalPage />} />

            {/* Autenticadas */}
            <Route element={<RequireAuth />}>
              <Route element={<AppShell />}>
                <Route path="/app" element={<DashboardPage />} />
                <Route path="/app/paleteira" element={<PalletReportPage />} />
                <Route path="/app/empilhadeira" element={<ForkliftReportPage />} />
                <Route path="/app/historico" element={<HistoryPage />} />

                <Route element={<RequireRole role="ADMIN" />}>
                  <Route path="/app/admin/solicitacoes" element={<AccessRequestsPage />} />
                  <Route path="/app/admin/usuarios" element={<UsersPage />} />
                </Route>
              </Route>
            </Route>
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
