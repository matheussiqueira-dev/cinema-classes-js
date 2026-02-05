# Cinema Ops Backend

Backend modular para operação de cinema, com API REST versionada, autenticação JWT, autorização por papéis/permissões, proteção CSRF para operações mutáveis, validação de dados, logging estruturado e testes automatizados.

## Visão Geral do Backend

O projeto implementa regras de negócio para:
- venda de ingressos e gestão de sessões;
- controle de estoque da bomboniere;
- precificação dinâmica e simulações;
- cálculo de folha salarial;
- indicadores operacionais e métricas de sistema.

A solução foi evoluída para um **modular monolith** com separação de camadas e responsabilidades, mantendo o domínio independente e reutilizável.

## Arquitetura Adotada

### Estilo

- **Monólito modular** com camadas de domínio, serviços, middlewares e rotas.

### Camadas

- `src/domain`: regras de negócio puras (entidades e lógica central)
- `src/backend/services`: orquestração de casos de uso
- `src/backend/repositories`: persistência in-memory e bootstrap de dados
- `src/backend/routes`: contratos HTTP versionados (`/api/v1`)
- `src/backend/middlewares`: segurança, autenticação, autorização, observabilidade e erro
- `src/backend/core`: erros padronizados, logger e helpers HTTP

### Princípios aplicados

- SOLID (responsabilidade única e separação por casos de uso)
- DRY (reuso de validações e serviços)
- Clean Architecture (domínio isolado de transporte HTTP)
- Fail fast + tratamento de exceções orientado a contrato

## Tecnologias Utilizadas

- Node.js
- Express 5
- JWT (`jsonwebtoken`)
- `helmet`, `cors`, `compression`, `express-rate-limit`
- Jest + Supertest (testes de unidade e integração)

## Segurança e Confiabilidade

Implementado no backend:

- **Autenticação**: login com JWT (`Bearer`)
- **Autorização**: RBAC + permissões por cargo
- **CSRF**: token CSRF obrigatório para `POST/PUT/PATCH/DELETE` autenticados
- **Validação de entrada**: validações numéricas, texto, e-mail e limites
- **Sanitização anti-XSS**: sanitização de payload textual antes de processamento
- **Rate limiting**: proteção contra abuso de requisições
- **Hardening HTTP**: headers de segurança via `helmet`
- **Error handling padronizado**: respostas de erro consistentes com `code`, `message`, `requestId`
- **Observabilidade**: logging estruturado por request (`requestId`, status, latência, usuário)

Observação: como a persistência atual é in-memory, risco de SQL Injection é mitigado por ausência de queries SQL. Em evolução para banco, o padrão recomendado é prepared statements/query builders.

## API REST e Contratos

Prefixo versionado:

- `/api/v1`

### Públicos

- `GET /api/v1/health/live`
- `GET /api/v1/health/ready`
- `GET /api/v1/docs`
- `GET /api/v1/docs/openapi`
- `POST /api/v1/auth/login`
- `POST /api/v1/pricing/calculate`
- `POST /api/v1/pricing/suggest`
- `POST /api/v1/pricing/grid`

### Autenticados

- `GET /api/v1/users/me`
- `GET /api/v1/users` (gerente)
- `GET /api/v1/sessions`
- `POST /api/v1/sessions` (gerente)
- `GET /api/v1/sessions/:sessionId`
- `POST /api/v1/sessions/:sessionId/sales` (permissão `vendas:realizar`)
- `DELETE /api/v1/sessions/:sessionId/sales/:saleId` (gerente)
- `GET /api/v1/inventory/items`
- `GET /api/v1/inventory/items/critical`
- `POST /api/v1/inventory/items` (gerente/atendente)
- `PATCH /api/v1/inventory/items/:sku/movement` (gerente/atendente)
- `POST /api/v1/payroll/employee` (gerente)
- `POST /api/v1/payroll/team` (gerente)
- `GET /api/v1/analytics/dashboard` (gerente)
- `GET /api/v1/analytics/system` (gerente)

## Setup e Execução

### Pré-requisitos

- Node.js LTS
- npm

### Instalação

```bash
npm install
```

### Executar API

```bash
npm run api
```

API disponível em:

- `http://localhost:3333/api/v1`

### Executar testes

```bash
npm test
```

### Demo de domínio (opcional)

```bash
npm run demo
```

### UI estática (opcional)

```bash
npm run ui
```

## Estrutura do Projeto

```text
.
├── src/
│   ├── core/
│   │   └── validators.js
│   ├── domain/
│   │   ├── ingressos.js
│   │   ├── usuarios.js
│   │   ├── relogios.js
│   │   ├── sessoes.js
│   │   ├── estoque.js
│   │   ├── precificacao.js
│   │   ├── salarios.js
│   │   └── desempenho.js
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
│       │   ├── requestContext.js
│       │   └── security.js
│       ├── repositories/
│       │   └── inMemoryDatabase.js
│       ├── routes/
│       │   └── v1/
│       │       ├── index.js
│       │       ├── authRoutes.js
│       │       ├── healthRoutes.js
│       │       ├── usersRoutes.js
│       │       ├── sessionsRoutes.js
│       │       ├── inventoryRoutes.js
│       │       ├── pricingRoutes.js
│       │       ├── payrollRoutes.js
│       │       ├── analyticsRoutes.js
│       │       └── docsRoutes.js
│       ├── services/
│       │   ├── authService.js
│       │   ├── sessionService.js
│       │   ├── inventoryService.js
│       │   ├── pricingService.js
│       │   ├── payrollService.js
│       │   └── analyticsService.js
│       └── utils/
│           └── sanitize.js
├── docs/
│   └── openapi.v1.json
├── __tests__/
│   ├── api.test.js
│   └── ...
└── package.json
```

## Boas Práticas e Padrões

- Contratos HTTP estáveis com versionamento (`v1`)
- Erros de domínio mapeados para HTTP de forma consistente
- Segurança por camadas (auth, autorização, CSRF, limites, sanitização)
- Estado de aplicação centralizado no container (injeção explícita de dependências)
- Serviços focados por contexto de negócio
- Cobertura de integração da API via Supertest

## Melhorias Futuras

- Persistência real (PostgreSQL/MongoDB) com migrations
- Refresh token + rotação e revogação de sessões
- Observabilidade avançada (OpenTelemetry, métricas Prometheus, tracing)
- Versionamento semântico de contrato OpenAPI com validação automática
- Filas assíncronas para eventos operacionais (vendas, auditoria, estoque)
- Cache distribuído (Redis) para leitura de dashboards

## Licença

MIT.

Autoria: Matheus Siqueira  
Website: https://www.matheussiqueira.dev/
