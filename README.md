# Cinema Ops Studio Frontend

Interface frontend moderna para operação de cinema, com foco em:
- precificação inteligente de ingressos;
- gestão de sessão com meta de receita e previsibilidade de lotação;
- controle de estoque com monitoramento de risco;
- sincronização de horários BR/US e relógios globais.

## Visão Geral do Frontend

O frontend foi refatorado para um modelo modular e escalável, com design system orientado por tokens visuais e componentes reutilizáveis.  
O objetivo principal é oferecer uma experiência de uso clara, rápida e confiável para operação diária.

### Público-alvo

- Times de operação e atendimento de cinema
- Gestão comercial e financeira
- Equipes de produto que precisam simular cenários rapidamente

### Fluxos principais

1. Simular preço e salvar cenários de comparação em `Pricing Lab`
2. Criar sessão, registrar vendas e acompanhar meta em `Session Command`
3. Cadastrar itens, aplicar movimentos e monitorar críticos em `Stock Board`
4. Sincronizar relógios e validar horários globais em `Time Sync`

## Stack e Tecnologias Utilizadas

- HTML5 semântico
- CSS3 com Design Tokens (Custom Properties)
- JavaScript ES Modules (arquitetura modular em `ui/js`)
- Persistência local com `localStorage`
- Testes de domínio com Jest (Node.js)
- Servidor estático para UI via `serve`

## Análise e Melhorias Frontend Implementadas

### Arquitetura

- Quebra do frontend monolítico em módulos:
  - `core`: utilitários, formatação, storage, toast, file transfer
  - `state`: store central da aplicação
  - `domain`: motor de precificação frontend
  - `features`: módulos por contexto de tela
- Redução de acoplamento entre lógica de negócio e manipulação de DOM.
- Organização preparada para crescimento de features sem degradar manutenção.

### Performance e Renderização

- Renderização incremental com `DocumentFragment` em listas/tabelas.
- Persistência com debounce para reduzir escrita excessiva em `localStorage`.
- Atualizações centralizadas por `store.subscribe`, evitando recomputações dispersas.
- Separação por views (tabs), reduzindo complexidade perceptiva por contexto.

### Acessibilidade (WCAG-oriented)

- `skip-link` para navegação por teclado.
- Navegação por tabs com `role="tablist"`, `role="tab"` e setas `←/→`.
- Landmarks semânticos (`main`, `aside`, `nav`, `header`, `section`).
- Estados live (`aria-live`) para feedback de atualização.
- Focus visible consistente em controles interativos.
- Respeito a `prefers-reduced-motion`.

### SEO e Metadados

- `meta description`
- Open Graph básico (`og:title`, `og:description`, `og:type`)
- Hierarquia semântica de títulos e conteúdo principal

### UI/UX (Refactor completo)

- Novo layout em formato “control center” com side rail + workspace.
- Hierarquia visual reforçada por:
  - tokens de tipografia
  - cartões de informação (KPIs, resultados, timelines)
  - separação clara entre ações e leitura de status
- Design system aplicado:
  - tokens de cor, tipografia, espaçamento, raio e sombra
  - botões (`btn-primary`, `btn-ghost`, `btn-danger`)
  - componentes reutilizáveis (`panel`, `result-card`, `kpi-card`, `tag`, `timeline`)

## Novas Features Implementadas

1. Persistência automática de estado
- Salva automaticamente cenário da operação no navegador.
- Benefício: continuidade entre sessões sem perda de contexto.

2. Snapshot JSON (export/import)
- Exporta estado completo da operação em arquivo JSON.
- Importa snapshot para restaurar ambiente.
- Benefício: backup, migração de ambiente e recuperação rápida.

3. Gestão de meta de receita
- Meta configurável com barra de progresso e indicador percentual.
- Benefício: acompanhamento visual de performance em tempo real.

4. Histórico de cenários de precificação
- Salva até 8 cenários com reaplicação e remoção individual.
- Benefício: comparação rápida para decisão comercial.

5. Undo de operação crítica
- Desfazer última venda de sessão.
- Desfazer último movimento de estoque.
- Benefício: redução de erro operacional sem retrabalho manual.

6. Relógios globais em tempo real
- Exibição simultânea de horários em cidades estratégicas.
- Benefício: apoio a times distribuídos e coordenação operacional.

## Estrutura do Projeto

```text
.
├── ui/
│   ├── index.html
│   ├── styles.css
│   ├── app.js
│   └── js/
│       ├── core/
│       │   ├── fileTransfer.js
│       │   ├── format.js
│       │   ├── helpers.js
│       │   ├── storage.js
│       │   └── toast.js
│       ├── domain/
│       │   └── pricingEngine.js
│       ├── features/
│       │   ├── clockView.js
│       │   ├── dashboard.js
│       │   ├── navigation.js
│       │   ├── pricingView.js
│       │   ├── sessionView.js
│       │   ├── stockView.js
│       │   └── workspaceActions.js
│       └── state/
│           └── store.js
├── src/
│   └── domain/...
├── __tests__/
└── package.json
```

## Setup e Execução

### Pré-requisitos

- Node.js LTS
- npm

### Instalação

```bash
npm install
```

### Rodar testes

```bash
npm test
```

### Rodar frontend (servidor estático)

```bash
npm run ui
```

Depois acesse `http://localhost:4173`.

### Rodar demonstração Node (domínio)

```bash
npm run demo
```

## Boas Práticas Adotadas

- Modularização por responsabilidade
- Estado centralizado com operações explícitas
- Persistência resiliente com fallback seguro
- Reutilização de lógica de domínio no frontend
- Feedback contínuo ao usuário (toast + indicadores)
- Responsividade mobile/desktop
- Acessibilidade e navegação por teclado como padrão

## Melhorias Futuras

- Migrar para TypeScript no frontend
- Testes automatizados de UI (Playwright/Cypress)
- Internacionalização (i18n) para múltiplos idiomas
- Tema de alto contraste configurável pelo usuário
- Integração com backend real (API REST/GraphQL)
- Observabilidade de UX (métricas de interação e funil)

## Licença

MIT.

Autoria: Matheus Siqueira  
Website: https://www.matheussiqueira.dev/
