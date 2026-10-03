import { Link, useLocation } from "react-router-dom";
import logo from "../../assets/sos-logo.png";
import Button from "../ui/Button";
import "./PublicHeader.css";

const NAV_LINKS = [
  { href: "#funcionalidades", label: "Funcionalidades" },
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#seguranca", label: "Segurança" },
  { href: "#sobre", label: "Sobre" },
];

export default function PublicHeader({ minimal = false }) {
  const location = useLocation();

  // Se já está na landing, não navega (ficaria sem efeito): só rola
  // suavemente de volta ao topo. Em outra página, o Link navega normal.
  function handleBrandClick(e) {
    if (location.pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  return (
    <header className="public-header">
      <div className="public-header__inner">
        <Link to="/" className="public-header__brand" onClick={handleBrandClick}>
          <img src={logo} alt="SOS Transpaletes" />
          <span>SOS Transpaletes</span>
        </Link>

        {!minimal && (
          <nav className="public-header__nav">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </nav>
        )}

        <Link to="/login">
          <Button variant="accent" size="sm">
            Entrar
          </Button>
        </Link>
      </div>
    </header>
  );
}
