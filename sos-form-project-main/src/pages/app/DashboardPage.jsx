import { useAuth } from "../../context/useAuth";
import PageHeader from "../../components/ui/PageHeader";
import EmployeeDashboard from "./EmployeeDashboard";
import AdminDashboard from "./AdminDashboard";
import "./DashboardPage.css";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      <PageHeader title="Painel" subtitle={user?.role === "ADMIN" ? "Visão geral da operação" : "Seu resumo"} />
      {user?.role === "ADMIN" ? <AdminDashboard /> : <EmployeeDashboard />}
    </div>
  );
}
