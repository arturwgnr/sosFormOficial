import { Link } from "react-router-dom";
import PublicHeader from "../../components/layout/PublicHeader";
import PublicFooter from "../../components/layout/PublicFooter";
import Button from "../../components/ui/Button";
import "./LandingPage.css";

const FEATURES = [
  {
    icon: "draw",
    title: "Assinatura na tela",
    description: "Cliente e responsável assinam direto no celular ou tablet, sem papel nem caneta.",
  },
  {
    icon: "picture_as_pdf",
    title: "PDF gerado na hora",
    description: "Relatório profissional pronto para baixar e enviar assim que o atendimento termina.",
  },
  {
    icon: "manage_search",
    title: "Histórico centralizado",
    description: "Busque qualquer relatório por cliente, ID ou equipamento em segundos.",
  },
  {
    icon: "admin_panel_settings",
    title: "Papéis e permissões",
    description: "Cada técnico vê o que é dele; administradores controlam quem vê o quê.",
  },
  {
    icon: "verified_user",
    title: "Acesso sob aprovação",
    description: "Conta nova só funciona depois que um administrador aprova. Sem acesso indevido.",
  },
  {
    icon: "devices",
    title: "Funciona em qualquer lugar",
    description: "Pensado primeiro para celular: o técnico usa em campo, sem depender do escritório.",
  },
];

const ABOUT_STATS = [
  { icon: "workspace_premium", value: "30+", label: "anos de mercado" },
  { icon: "location_on", value: "Contagem/MG", label: "atendimento local" },
  { icon: "pallet", value: "Paleteiras", label: "manutenção e locação" },
  { icon: "forklift", value: "Empilhadeiras", label: "manutenção e locação" },
];

const SECURITY_ITEMS = [
  {
    icon: "lock",
    title: "Senhas protegidas",
    description: "Senhas nunca ficam em texto puro: hash forte em todo cadastro.",
  },
  {
    icon: "cookie",
    title: "Sessão segura",
    description: "Login guardado em cookie protegido, invisível para scripts no navegador.",
  },
  {
    icon: "block",
    title: "Bloqueio por tentativas",
    description: "Muitas senhas erradas seguidas travam a conta temporariamente.",
  },
  {
    icon: "fact_check",
    title: "Permissão sempre no servidor",
    description: "Nenhuma regra de acesso depende só da tela: tudo é checado no backend.",
  },
];

export default function LandingPage() {
  return (
    <div className="landing">
      <PublicHeader />

      <section className="landing__hero">
        <div className="landing__hero-inner">
          <div className="landing__hero-copy">
            <span className="landing__hero-badge">
              <span className="material-symbols-outlined" aria-hidden="true">
                bolt
              </span>
              Chega de relatório de papel
            </span>
            <h1>
              Relatórios de serviço <span>sem papel</span>, do jeito que sua equipe já trabalha
            </h1>
            <p>
              Sistema interno da SOS Transpaletes para registrar atendimentos de paleteiras e
              empilhadeiras: formulário, assinatura e PDF, tudo no celular, com histórico
              centralizado pra empresa inteira.
            </p>
            <div className="landing__hero-actions">
              <Link to="/login">
                <Button variant="accent" size="lg" icon="login">
                  Acessar o sistema
                </Button>
              </Link>
              <Link to="/registro">
                <Button variant="ghost" size="lg" className="btn--on-dark">
                  Criar conta
                </Button>
              </Link>
            </div>
            <div className="landing__hero-stats">
              <div className="landing__hero-stat">
                <strong>30+</strong>
                <span>anos de mercado</span>
              </div>
              <div className="landing__hero-stat">
                <strong>2</strong>
                <span>tipos de relatório</span>
              </div>
              <div className="landing__hero-stat">
                <strong>100%</strong>
                <span>digital</span>
              </div>
            </div>
          </div>

          {/* Prévia ilustrativa de um relatório: equilibra a composição do hero */}
          <div className="landing__hero-visual" aria-hidden="true">
            <div className="hero-report">
              <div className="hero-report__head">
                <div>
                  <span className="hero-report__id">PAL-0042</span>
                  <strong>Relatório de Paleteira</strong>
                </div>
                <span className="hero-report__status">
                  <span className="material-symbols-outlined">check_circle</span>
                  Concluído
                </span>
              </div>

              <dl className="hero-report__meta">
                <div>
                  <dt>Cliente</dt>
                  <dd>Distribuidora Central</dd>
                </div>
                <div>
                  <dt>Equipamento</dt>
                  <dd>Paleteira manual 2,5 t</dd>
                </div>
              </dl>

              <ul className="hero-report__items">
                <li>
                  <span className="material-symbols-outlined">check</span>
                  Troca do kit de vedação
                </li>
                <li>
                  <span className="material-symbols-outlined">check</span>
                  Lubrificação geral
                </li>
                <li>
                  <span className="material-symbols-outlined">check</span>
                  Teste de carga aprovado
                </li>
              </ul>

              <div className="hero-report__sign">
                <svg viewBox="0 0 160 40" fill="none">
                  <path
                    d="M4 30c10-18 18-22 22-12s-4 16 4 8 12-20 18-14-2 18 6 12 10-14 16-10 4 10 12 6 14-12 22-8 10 6 20 2 20-6 30-6"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>Assinatura do cliente</span>
              </div>
            </div>

            <div className="hero-chip hero-chip--pdf">
              <span className="material-symbols-outlined">picture_as_pdf</span>
              PDF pronto
            </div>
            <div className="hero-chip hero-chip--sync">
              <span className="material-symbols-outlined">cloud_done</span>
              Salvo no histórico
            </div>
          </div>
        </div>
      </section>

      <section className="landing__section">
        <div className="landing__section-inner">
          <span className="landing__eyebrow">
            <span className="material-symbols-outlined" aria-hidden="true">
              sync_alt
            </span>
            Do papel para o digital
          </span>
          <h2 className="landing__section-title">O problema de sempre, resolvido</h2>
          <p className="landing__section-lead">
            Relatório de papel se perde, rasga e demora pra chegar no escritório. O sistema
            resolve isso sem complicar a rotina de quem está em campo.
          </p>

          <div className="landing__compare">
            <div className="landing__compare-card landing__compare-card--before">
              <h3>
                <span className="material-symbols-outlined" aria-hidden="true">
                  description
                </span>
                Hoje, no papel
              </h3>
              <ul>
                <li>
                  <span className="material-symbols-outlined" aria-hidden="true">
                    close
                  </span>
                  Relatório pode rasgar, molhar ou se perder antes de chegar no escritório
                </li>
                <li>
                  <span className="material-symbols-outlined" aria-hidden="true">
                    close
                  </span>
                  Buscar um atendimento antigo significa vasculhar pastas
                </li>
                <li>
                  <span className="material-symbols-outlined" aria-hidden="true">
                    close
                  </span>
                  Nenhum controle de quem acessou o quê
                </li>
              </ul>
            </div>
            <div className="landing__compare-card landing__compare-card--after">
              <h3>
                <span className="material-symbols-outlined" aria-hidden="true">
                  check_circle
                </span>
                Com o sistema
              </h3>
              <ul>
                <li>
                  <span className="material-symbols-outlined" aria-hidden="true">
                    check
                  </span>
                  Relatório salvo no servidor assim que é criado, com assinatura digital
                </li>
                <li>
                  <span className="material-symbols-outlined" aria-hidden="true">
                    check
                  </span>
                  Busca por cliente, ID ou equipamento em segundos
                </li>
                <li>
                  <span className="material-symbols-outlined" aria-hidden="true">
                    check
                  </span>
                  Cada conta tem papel e permissão definidos, aprovados por um admin
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="landing__section landing__section--features" id="funcionalidades">
        <div className="landing__section-inner">
          <span className="landing__eyebrow">
            <span className="material-symbols-outlined" aria-hidden="true">
              widgets
            </span>
            Funcionalidades
          </span>
          <h2 className="landing__section-title">Tudo que o dia a dia da equipe precisa</h2>

          <div className="landing__features-grid">
            {FEATURES.map((f) => (
              <div className="landing__feature-card" key={f.title}>
                <div className="landing__feature-icon">
                  <span className="material-symbols-outlined" aria-hidden="true">
                    {f.icon}
                  </span>
                </div>
                <h3>{f.title}</h3>
                <p>{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="landing__section landing__section--security" id="seguranca">
        <div className="landing__section-inner">
          <span className="landing__eyebrow" style={{ color: "var(--color-accent)" }}>
            <span className="material-symbols-outlined" aria-hidden="true">
              shield
            </span>
            Segurança e controle de acesso
          </span>
          <h2 className="landing__section-title">Acesso só pra quem a empresa aprovou</h2>
          <p className="landing__section-lead">
            Cadastro novo nasce pendente e não acessa nada até um administrador liberar.
          </p>

          <div className="landing__security-grid">
            {SECURITY_ITEMS.map((item) => (
              <div className="landing__security-item" key={item.title}>
                <span className="material-symbols-outlined" aria-hidden="true">
                  {item.icon}
                </span>
                <div>
                  <h4>{item.title}</h4>
                  <p>{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="landing__section landing__section--closing" id="sobre">
        <div className="landing__section-inner">
          <div className="landing__about">
            <div>
              <span className="landing__eyebrow">
                <span className="material-symbols-outlined" aria-hidden="true">
                  factory
                </span>
                Sobre a SOS Transpaletes
              </span>
              <h2 className="landing__section-title">Mais de 30 anos cuidando da movimentação da sua operação</h2>
              <p className="landing__section-lead">
                A SOS Transpaletes atua em Contagem/MG com manutenção, venda e locação de
                paleteiras e empilhadeiras. Este sistema é a versão digital do relatório de
                serviço que a equipe sempre usou, agora mais rápido e sem papel.
              </p>
            </div>
            <div className="landing__about-stats">
              {ABOUT_STATS.map((s) => (
                <div className="landing__about-stat" key={s.value}>
                  <span className="material-symbols-outlined landing__about-stat-icon" aria-hidden="true">
                    {s.icon}
                  </span>
                  <strong>{s.value}</strong>
                  <span>{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="landing__cta">
            <div className="landing__cta-text">
              <h2>Pronto para tirar o relatório do papel?</h2>
              <p>Acesse com sua conta ou peça cadastro: a aprovação é rápida.</p>
            </div>
            <div className="landing__cta-actions">
              <Link to="/login">
                <Button variant="accent" size="lg" icon="login">
                  Acessar o sistema
                </Button>
              </Link>
              <Link to="/registro">
                <Button variant="ghost" size="lg" className="btn--on-dark">
                  Criar conta
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
