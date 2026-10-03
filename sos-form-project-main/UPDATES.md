# Updates: ajustes visuais pós-Etapa 4

Data: 2026-10-03
Status: concluído

## Login e Registro

- [x] Refatoração estética completa das telas de login e registro,
      seguindo o padrão premium e a identidade visual do CLAUDE.md
      (card com faixa de acento no topo, link "Voltar ao início" no
      lugar do logo, espaçamento revisado)
- [x] Remover o logo das telas de login e registro (mantido em
      "aguardando aprovação", que não foi citada na lista)

## Landing page

- [x] Ocupar 100% da largura da tela, sem sobras ou margens indesejadas
      nas laterais (removido o `max-width` centralizado do header,
      footer e das seções de conteúdo; mantido só no card da chamada
      final, que é um elemento flutuante por design)
- [x] Rolagem suave (smooth scroll) e fluida, sem travamentos
      (`scroll-behavior: smooth` global, respeitando
      `prefers-reduced-motion`)
- [x] Texto dos botões em branco (botões "accent" da landing)
- [x] Manter o efeito de glow suave no hover dos botões (box-shadow
      intocado)
- [x] Clicar no logo do header (`.public-header__brand`) rola a página
      suavemente de volta ao topo

## Critério de conclusão

Todos os itens testados no desktop (1440px) e no modo celular (390px)
com Playwright headless: sem overflow horizontal (`scrollWidth` igual
à viewport nas duas resoluções), sem erros de console, scroll-to-topo
confirmado (de 2000px para 0), cor e glow do botão confirmados via
estilo computado.
