import { Link } from "react-router-dom";
import logo from "../../assets/sos-logo.png";
import "./AuthLayout.css";

const HIGHLIGHTS = [
  { icon: "draw", text: "Assinatura do cliente direto na tela" },
  { icon: "picture_as_pdf", text: "PDF profissional gerado na hora" },
  { icon: "verified_user", text: "Acesso liberado só após aprovação" },
];

// brand=true mostra o logo no card (usado em "aguardando aprovação"); nas
// telas de login e registro usamos só um link discreto de volta, sem o logo.
export default function AuthLayout({ eyebrow, title, subtitle, children, footer, brand = true }) {
  return (
    <div className="auth-layout">
      <aside className="auth-layout__aside">
        <Link to="/" className="auth-layout__back auth-layout__back--dark">
          <span className="material-symbols-outlined" aria-hidden="true">
            arrow_back
          </span>
          Voltar ao início
        </Link>

        <div className="auth-layout__aside-body">
          <span className="auth-layout__aside-eyebrow">SOS Transpaletes</span>
          <h2>
            Relatórios de serviço <span>sem papel</span>
          </h2>
          <p>Registre atendimentos, colete assinaturas e gere o PDF em poucos minutos, de qualquer lugar.</p>

          <ul>
            {HIGHLIGHTS.map((h) => (
              <li key={h.icon}>
                <span className="material-symbols-outlined" aria-hidden="true">
                  {h.icon}
                </span>
                {h.text}
              </li>
            ))}
          </ul>
        </div>

        <span className="auth-layout__aside-foot">Contagem/MG · mais de 30 anos de mercado</span>
      </aside>

      <main className="auth-layout__main">
        <div className="auth-layout__panel">
          {brand ? (
            <Link to="/" className="auth-layout__brand">
              <img src={logo} alt="SOS Transpaletes" />
              <span>SOS Transpaletes</span>
            </Link>
          ) : (
            <Link to="/" className="auth-layout__back auth-layout__back--mobile">
              <span className="material-symbols-outlined" aria-hidden="true">
                arrow_back
              </span>
              Voltar ao início
            </Link>
          )}

          <div className="auth-layout__card">
            {eyebrow && <span className="auth-layout__eyebrow">{eyebrow}</span>}
            <h1>{title}</h1>
            {subtitle && <p className="auth-layout__subtitle">{subtitle}</p>}

            <div className="auth-layout__content">{children}</div>

            {footer && <div className="auth-layout__footer">{footer}</div>}
          </div>
        </div>
      </main>
    </div>
  );
}
