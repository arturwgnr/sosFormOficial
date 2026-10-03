import logo from "../../assets/sos-logo.png";
import "./PublicFooter.css";

export default function PublicFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="public-footer" id="sobre-footer">
      <div className="public-footer__inner">
        <div className="public-footer__brand">
          <img src={logo} alt="SOS Transpaletes" />
          <div>
            <strong>SOS Transpaletes</strong>
            <p>Manutenção, venda e locação de paleteiras e empilhadeiras.</p>
          </div>
        </div>

        <div className="public-footer__col">
          <h4>Contato</h4>
          <a href="tel:+553193400419">(31) 9340-0419</a>
          <a href="tel:+553125593533">(31) 2559-3533</a>
          <a
            href="https://wa.me/5531934004190"
            target="_blank"
            rel="noreferrer"
            className="public-footer__whatsapp"
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              chat
            </span>
            WhatsApp
          </a>
        </div>

        <div className="public-footer__col">
          <h4>Endereço</h4>
          <p>
            Rua Sinval Alves da Cunha, 126
            <br />
            Jardim Bandeirantes, Contagem/MG
            <br />
            CEP 32371-330
          </p>
        </div>
      </div>

      <div className="public-footer__bottom">
        <span>© {year} SOS Transpaletes. Todos os direitos reservados.</span>
      </div>
    </footer>
  );
}
