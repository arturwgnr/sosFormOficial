import { Link } from "react-router-dom";
import logo from "../../assets/sos-logo.png";
import "./AuthLayout.css";

export default function AuthLayout({ eyebrow, title, subtitle, children, footer }) {
  return (
    <div className="auth-layout">
      <div className="auth-layout__panel">
        <Link to="/" className="auth-layout__brand">
          <img src={logo} alt="SOS Transpaletes" />
          <span>SOS Transpaletes</span>
        </Link>

        <div className="auth-layout__card">
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
