# Cinema Ops Platform

Plataforma fullstack para operacao de cinema com foco em **precificacao**, **gestao de sessoes**, **controle de estoque** e **analiticos operacionais**.

O projeto combina:
- **Frontend modular** (SPA estatica) para operacao diaria com UX moderna.
- **Backend REST v1** com seguranca por camadas (JWT, RBAC, CSRF, rate limit, idempotencia).
- **Dominio reutilizavel** em JavaScript orientado a objetos.

## Visao Geral

### Objetivo de negocio
Acelerar a operacao do cinema com previsibilidade comercial e controle operacional centralizado.

### Publico-alvo
- Gerentes de unidade
- Equipe de vendas e atendimento
- Times tecnicos responsaveis por evolucao da plataforma

### Fluxo principal
1. Usuario autentica no backend.
2. Frontend conecta via **Backend Gateway**.
3. Operacao executa precificacao, vendas e movimentos de estoque.
4. Dashboard acompanha ocupacao, receita, itens criticos e meta.
5. Snapshot e relatorios apoiam tomada de decisao.

## Principais Funcionalidades

### Frontend
- Dashboard operacional com KPIs em tempo real.
- Modulos de navegação:
  - `Pricing Lab`
  - `Session Command`
  - `Stock Board`
  - `Time Sync`
- Importacao/exportacao de workspace em JSON.
- Integracao com backend (login, sync de snapshot, metricas de sistema).
- Tokens visuais e design system leve (tipografia, cores, espacos, estados).
- Responsividade mobile/desktop e foco em acessibilidade (skip link, foco visivel, `aria-*`).

### Backend
- API REST versionada em `/api/v1`.
- Login com JWT e autorizacao por papeis/permissoes.
- CSRF para operacoes mutaveis autenticadas.
- Idempotencia para evitar duplicidade em `POST/PUT/PATCH/DELETE` com `Idempotency-Key`.
- Auditoria operacional com eventos paginados.
- Relatorio operacional em JSON ou CSV.
- Snapshot operacional para sincronizacao frontend-backend.

## Arquitetura e Decisoes Tecnicas

### Estilo
- **Monolito modular** no backend.
- **Frontend modular por features**.
- Separacao clara entre dominio, servicos, transporte HTTP e estado de interface.

### Principios aplicados
- SOLID
- DRY
- Clean Architecture (dominio desacoplado de framework HTTP)
- Fail-fast e tratamento consistente de erros

### Estrategias de escalabilidade
- Contrato versionado de API (`v1`).
- Camadas desacopladas para evolucao incremental.
- Persistencia in-memory encapsulada para migracao futura para banco relacional/NoSQL.

## Stack e Tecnologias

### Core
- Node.js
- JavaScript (CommonJS no backend, ESM no frontend)

### Backend
- Express 5
- `helmet`, `cors`, `compression`, `express-rate-limit`
- `jsonwebtoken`

### Frontend
- HTML5 + CSS3 + JavaScript modular
- `serve` para host local da UI

### Qualidade
- Jest
- Supertest
- GitHub Actions (CI)

## Seguranca

Implementacoes principais:
- Autenticacao por JWT (`Authorization: Bearer <token>`)
- RBAC com permissoes por cargo
- CSRF (`X-CSRF-Token`) para operacoes mutaveis
- Rate limiting global
- Sanitizacao de payload textual
- Idempotencia para requests mutaveis
- Headers de seguranca via `helmet`
- Logging estruturado e padronizacao de erros com `requestId`

## Novas Features Implementadas

1. **Backend Gateway no frontend**
- Login direto da UI para API.
- Sincronizacao de snapshot operacional e metricas do backend.
- Sessao backend em runtime (tokens nao persistidos em `localStorage`).

2. **Idempotencia de requests mutaveis**
- Middleware dedicado com TTL configuravel (`IDEMPOTENCY_TTL_MS`).
- Reaproveitamento de resposta para chamadas duplicadas.

3. **Auditoria operacional avancada**
- Endpoint paginado e filtravel por tipo: `/analytics/audit-events`.
- Registro enriquecido de eventos (ex.: login, venda, estoque).

4. **Relatorio operacional exportavel**
- Endpoint `/analytics/report` com `format=json|csv`.
- CSV pronto para consumo externo.

5. **Snapshot para sincronizacao fullstack**
- Endpoint `/analytics/workspace-snapshot`.
- Hidrata estado de sessao/estoque na UI.

## API e Documentacao

- Prefixo: `http://localhost:3333/api/v1`
- OpenAPI: `docs/openapi.v1.json`
- Endpoint de docs:
  - `GET /api/v1/docs`
  - `GET /api/v1/docs/openapi`

## Setup e Execucao

### Pre-requisitos
- Node.js LTS
- npm

### Instalacao
```bash
npm install
```

### Rodar backend
```bash
npm run api
```
Backend disponivel em `http://localhost:3333/api/v1`.

### Rodar frontend
```bash
npm run ui
```
Frontend disponivel em `http://localhost:4173`.

### Rodar testes
```bash
npm test
```

### Rodar demo de dominio (opcional)
```bash
npm run demo
```

## Credenciais de Desenvolvimento

Usuarios semeados no bootstrap:
- `gerente@cinema.com` / `gerente123`
- `vendedor@cinema.com` / `vendedor123`
- `atendente@cinema.com` / `atendente123`

## Variaveis de Ambiente

| Variavel | Default | Descricao |
| --- | --- | --- |
| `NODE_ENV` | `development` | Ambiente de execucao |
| `PORT` | `3333` | Porta do backend |
| `API_PREFIX` | `/api/v1` | Prefixo da API |
| `JWT_SECRET` | `dev-change-this-secret` | Segredo de assinatura JWT |
| `JWT_TTL` | `2h` | Expiracao do token |
| `JWT_ISSUER` | `cinema-ops-backend` | Emissor JWT |
| `JWT_AUDIENCE` | `cinema-ops-clients` | Audiencia JWT |
| `CORS_ORIGIN` | `*` | Origem CORS permitida |
| `RATE_LIMIT_WINDOW_MS` | `900000` | Janela do rate limit |
| `RATE_LIMIT_MAX` | `200` | Maximo de requests por janela |
| `JSON_LIMIT` | `120kb` | Limite do body JSON |
| `IDEMPOTENCY_TTL_MS` | `600000` | TTL para cache de idempotencia |

## Estrutura do Projeto

```text
.
├── src/
│   ├── core/
│   │   └── validators.js
│   ├── domain/
│   │   ├── ingressos.js
│   │   ├── sessoes.js
│   │   ├── estoque.js
│   │   ├── precificacao.js
│   │   ├── salarios.js
│   │   ├── desempenho.js
│   │   ├── usuarios.js
│   │   └── relogios.js
│   └── backend/
│       ├── app.js
│       ├── server.js
│       ├── createContainer.js
│       ├── config/
│       │   └── env.js
│       ├── core/
│       │   ├── errors.js
│       │   ├── http.js
│       │   └── logger.js
│       ├── middlewares/
│       │   ├── auth.js
│       │   ├── errorHandler.js
│       │   ├── idempotency.js
│       │   ├── requestContext.js
│       │   └── security.js
│       ├── repositories/
│       │   └── inMemoryDatabase.js
│       ├── routes/
│       │   └── v1/
│       │       ├── analyticsRoutes.js
│       │       ├── authRoutes.js
│       │       ├── docsRoutes.js
│       │       ├── healthRoutes.js
│       │       ├── inventoryRoutes.js
│       │       ├── payrollRoutes.js
│       │       ├── pricingRoutes.js
│       │       ├── sessionsRoutes.js
│       │       ├── usersRoutes.js
│       │       └── index.js
│       ├── services/
│       │   ├── analyticsService.js
│       │   ├── authService.js
│       │   ├── inventoryService.js
│       │   ├── payrollService.js
│       │   ├── pricingService.js
│       │   └── sessionService.js
│       └── utils/
│           └── sanitize.js
├── ui/
│   ├── index.html
│   ├── styles.css
│   ├── app.js
│   └── js/
│       ├── core/
│       │   ├── apiClient.js
│       │   ├── fileTransfer.js
│       │   ├── format.js
│       │   ├── helpers.js
│       │   ├── storage.js
│       │   └── toast.js
│       ├── domain/
│       │   └── pricingEngine.js
│       ├── features/
│       │   ├── backendIntegration.js
│       │   ├── clockView.js
│       │   ├── dashboard.js
│       │   ├── navigation.js
│       │   ├── pricingView.js
│       │   ├── sessionView.js
│       │   ├── stockView.js
│       │   └── workspaceActions.js
│       └── state/
│           └── store.js
├── docs/
│   └── openapi.v1.json
├── __tests__/
│   ├── api.test.js
│   └── *.test.js
└── package.json
```

## Boas Praticas Adotadas

- Contratos de API versionados e documentados.
- Middlewares de seguranca e observabilidade como camada transversal.
- Dominio com regras explicitas e validacao defensiva.
- Estado frontend centralizado e previsivel.
- Persistencia de estado com cuidado de seguranca (sem persistir token).
- Testes de integracao cobrindo autenticacao, autorizacao e fluxos criticos.

## Melhorias Futuras

- Persistencia real (PostgreSQL/MongoDB) com migracoes.
- Refresh token com rotacao e revogacao.
- Observabilidade completa com OpenTelemetry + tracing.
- Filas assincronas para eventos de auditoria e integracoes externas.
- Testes E2E browser (Playwright/Cypress).
- Pipeline de deploy containerizado (Docker + IaC).

## Licenca

MIT.

Autoria: Matheus Siqueira  
Website: https://www.matheussiqueira.dev/
