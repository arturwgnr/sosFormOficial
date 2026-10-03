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

const STEPS = [
  {
    title: "Preencha no local",
    description: "Técnico abre o formulário certo (paleteira ou empilhadeira) e registra o atendimento na hora.",
  },
  {
    title: "Colete as assinaturas",
    description: "Cliente e responsável assinam na tela. Sem impresso, sem perder papel no caminho.",
  },
  {
    title: "Pronto: PDF e histórico",
    description: "O relatório fica salvo e disponível pra qualquer um com permissão, com o PDF pronto pra baixar.",
  },
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
              <Button variant="ghost" size="lg" style={{ color: "#fff", borderColor: "rgba(255,255,255,0.3)" }}>
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

      <section className="landing__section" id="como-funciona">
        <div className="landing__section-inner">
          <span className="landing__eyebrow">
            <span className="material-symbols-outlined" aria-hidden="true">
              route
            </span>
            Como funciona
          </span>
          <h2 className="landing__section-title">Do atendimento ao relatório pronto, em 3 passos</h2>

          <div className="landing__steps">
            {STEPS.map((s, i) => (
              <div className="landing__step" key={s.title}>
                <div className="landing__step-number">{i + 1}</div>
                <h3>{s.title}</h3>
                <p>{s.description}</p>
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

      <section className="landing__section" id="sobre">
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
              <div className="landing__about-stat">
                <strong>30+</strong>
                <span>anos de mercado</span>
              </div>
              <div className="landing__about-stat">
                <strong>Contagem/MG</strong>
                <span>atendimento local</span>
              </div>
              <div className="landing__about-stat">
                <strong>Paleteiras</strong>
                <span>manutenção e locação</span>
              </div>
              <div className="landing__about-stat">
                <strong>Empilhadeiras</strong>
                <span>manutenção e locação</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="landing__section">
        <div className="landing__cta">
          <h2>Pronto para tirar o relatório do papel?</h2>
          <p>Acesse com sua conta ou peça cadastro: a aprovação é rápida.</p>
          <div className="landing__cta-actions">
            <Link to="/login">
              <Button variant="accent" size="lg" icon="login">
                Acessar o sistema
              </Button>
            </Link>
            <Link to="/registro">
              <Button variant="ghost" size="lg" style={{ color: "#fff", borderColor: "rgba(255,255,255,0.3)" }}>
                Criar conta
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
