import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import logo from "../assets/sos-logo.png"; // importa logo
import "../css/Topbar.css";

export default function TopBar() {
  const nav = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="topbar">
      <div className="topbar-container">
        {/* Logo + texto */}
        <div className="logo-container" onClick={() => nav("/")}>
          <img src={logo} alt="SOS Transpaletes Logo" className="logo-img" />
          <h2 className="logo-text">SOS Transpaletes</h2>
        </div>

        {/* Botão hamburguer */}
        <div
          className={`burger ${menuOpen ? "open" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>

        {/* Nav links */}
        <nav className={`topbar-nav ${menuOpen ? "show" : ""}`}>
          <Link to="/" onClick={() => setMenuOpen(false)}>
            Inicio
          </Link>
          <Link to="/pallet" onClick={() => setMenuOpen(false)}>
            Paleteira
          </Link>
          <Link to="/forklift" onClick={() => setMenuOpen(false)}>
            Empilhadeira
          </Link>
          <Link to="/history" onClick={() => setMenuOpen(false)}>
            Histórico
          </Link>
        </nav>
      </div>
    </header>
  );
}
