import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import logo from "../../assets/sos-logo.png";
import "./AppShell.css";

const MAIN_NAV = [
  { to: "/app", label: "Painel", icon: "dashboard", end: true },
  { to: "/app/paleteira", label: "Paleteira", icon: "inventory_2" },
  { to: "/app/empilhadeira", label: "Empilhadeira", icon: "precision_manufacturing" },
  { to: "/app/historico", label: "Histórico", icon: "history" },
];

const ADMIN_NAV = [
  { to: "/app/admin/solicitacoes", label: "Solicitações", icon: "person_add" },
  { to: "/app/admin/usuarios", label: "Usuários", icon: "group" },
];

export default function AppShell() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // O painel usa a largura da tela no desktop; formulários e listas
  // mantêm a largura de leitura padrão.
  const isWide = useLocation().pathname === "/app";
  const navItems = user?.role === "ADMIN" ? [...MAIN_NAV, ...ADMIN_NAV] : MAIN_NAV;
  // Bottom nav do celular só cabe ~5 ícones: prioriza os mais usados em campo.
  const bottomNavItems = MAIN_NAV;

  return (
    <div className="app-shell">
      <aside className="app-shell__sidebar">
        <div className="app-shell__brand">
          <img src={logo} alt="SOS Transpaletes" className="app-shell__logo" />
          <span>SOS Transpaletes</span>
        </div>

        <nav className="app-shell__nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `app-shell__nav-link${isActive ? " is-active" : ""}`}
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                {item.icon}
              </span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="app-shell__user">
          <div className="app-shell__avatar">{user?.name?.[0]?.toUpperCase() || "?"}</div>
          <div className="app-shell__user-info">
            <strong>{user?.name}</strong>
            <span>{user?.role === "ADMIN" ? "Administrador" : "Funcionário"}</span>
          </div>
          <button className="app-shell__logout" onClick={logout} title="Sair" aria-label="Sair">
            <span className="material-symbols-outlined" aria-hidden="true">
              logout
            </span>
          </button>
        </div>
      </aside>

      <header className="app-shell__topbar">
        <button
          className="app-shell__menu-btn"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Abrir menu"
        >
          <span className="material-symbols-outlined" aria-hidden="true">
            menu
          </span>
        </button>
        <img src={logo} alt="SOS Transpaletes" className="app-shell__topbar-logo" />
        <div className="app-shell__topbar-avatar">{user?.name?.[0]?.toUpperCase() || "?"}</div>
      </header>

      {mobileMenuOpen && (
        <div className="app-shell__mobile-menu" role="dialog" aria-modal="true">
          <div className="app-shell__mobile-menu-backdrop" onClick={() => setMobileMenuOpen(false)} />
          <div className="app-shell__mobile-menu-panel">
            <div className="app-shell__mobile-menu-header">
              <div className="app-shell__brand">
                <img src={logo} alt="SOS Transpaletes" className="app-shell__logo" />
                <span>SOS Transpaletes</span>
              </div>
              <button
                className="app-shell__menu-btn"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Fechar menu"
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  close
                </span>
              </button>
            </div>

            <nav className="app-shell__nav">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) => `app-shell__nav-link${isActive ? " is-active" : ""}`}
                >
                  <span className="material-symbols-outlined" aria-hidden="true">
                    {item.icon}
                  </span>
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <button className="app-shell__mobile-logout" onClick={logout}>
              <span className="material-symbols-outlined" aria-hidden="true">
                logout
              </span>
              Sair
            </button>
          </div>
        </div>
      )}

      <main className={`app-shell__content ${isWide ? "app-shell__content--wide" : ""}`}>
        <Outlet />
      </main>

      <nav className="app-shell__bottomnav">
        {bottomNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `app-shell__bottomnav-link${isActive ? " is-active" : ""}`}
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              {item.icon}
            </span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
