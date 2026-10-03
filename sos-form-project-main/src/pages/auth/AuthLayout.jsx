import { Link, useLocation } from "react-router-dom";
import logo from "../../assets/sos-logo.png";
import "./AuthLayout.css";

// brand=true mostra o logo (usado em "aguardando aprovação"); nas telas de
// login e registro usamos só um link discreto de volta, sem o logo.
export default function AuthLayout({ eyebrow, title, subtitle, children, footer, brand = true }) {
  const location = useLocation();

  function handleBackClick(e) {
    if (location.pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  return (
    <div className="auth-layout">
      <div className="auth-layout__panel">
        {brand ? (
          <Link to="/" className="auth-layout__brand">
            <img src={logo} alt="SOS Transpaletes" />
            <span>SOS Transpaletes</span>
          </Link>
        ) : (
          <Link to="/" className="auth-layout__back" onClick={handleBackClick}>
            <span className="material-symbols-outlined" aria-hidden="true">
              arrow_back
            </span>
            Voltar ao início
          </Link>
        )}

        <div className="auth-layout__card">
          <div className="auth-layout__card-accent" aria-hidden="true" />
          {eyebrow && <span className="auth-layout__eyebrow">{eyebrow}</span>}
          <h1>{title}</h1>
          {subtitle && <p className="auth-layout__subtitle">{subtitle}</p>}

          <div className="auth-layout__content">{children}</div>

          {footer && <div className="auth-layout__footer">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
