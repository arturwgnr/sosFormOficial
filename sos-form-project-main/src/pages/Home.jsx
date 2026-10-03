import { Link } from "react-router-dom";
import "../css/Home.css";

export default function Home() {
  return (
    <div className="home">
      <div className="home-container">
        <h1>SOS Transpaletes</h1>
        <p>Selecione o tipo de relatório:</p>

        <div className="home-buttons">
          <Link to="/pallet">
            <button>Relatório Paleteira</button>
          </Link>
          <Link to="/forklift">
            <button>Relatório Empilhadeira</button>
          </Link>
          <Link to="/history">
            <button>Histórico</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
