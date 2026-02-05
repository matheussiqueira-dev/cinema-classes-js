# Cinema Classes JS

Plataforma JavaScript orientada a objetos para gestão de operações de cinema, com foco em:
- modelagem de domínio (ingressos, usuários, relógios, sessões, estoque, precificação e folha salarial);
- qualidade de código e escalabilidade;
- experiência de uso moderna com interface web funcional.

## Visão Geral do Projeto

Este projeto evoluiu de uma base educacional de classes isoladas para uma estrutura de domínio mais profissional, capaz de suportar cenários reais de operação:
- venda de ingressos com regras de negócio;
- gestão de sessão com controle de capacidade;
- controle de estoque da bomboniere;
- segurança básica de autenticação de usuários;
- apoio a decisão comercial via precificação dinâmica.

## Tecnologias Utilizadas

- Node.js (CommonJS)
- JavaScript ES2020+
- Jest (testes automatizados)
- HTML5, CSS3 e JavaScript (UI web)

## Funcionalidades Principais

- Hierarquia de ingressos:
  - `Ingresso`
  - `MeiaEntrada`
  - `IngressoFamilia`
  - `CalculadoraPrecoIngresso` com detalhamento de ajustes
- Hierarquia de usuários:
  - `Usuario`
  - `Gerente`
  - `Vendedor`
  - `Atendente`
  - autenticação com hash de senha e bloqueio por tentativas inválidas
- Relógios:
  - `RelogioBrasileiro` (24h)
  - `RelogioAmericano` (12h com AM/PM)
  - sincronização entre formatos
- Sessões:
  - `SessaoCinema` com venda, ocupação e receita
- Estoque:
  - `ControleDeEstoque` e `ItemEstoque`
  - entradas, saídas e itens críticos
- Precificação dinâmica:
  - `GeradorPrecoIngresso` com fatores de demanda, antecedência, dia e tipo de sala
- Folha salarial:
  - `BaseSalarialCinema`
- Indicadores operacionais:
  - `PainelDesempenho`
- UI/UX moderna:
  - dashboard responsivo em `ui/` com simulador de preço, sessão, estoque e relógios

## Instalação e Uso

### Pré-requisitos

- Node.js LTS
- npm

### Instalação

```bash
npm install
```

### Executar testes

```bash
npm test
```

### Executar demonstração em terminal

```bash
npm run demo
```

### Executar interface web

```bash
npm run ui
```

Depois, acesse a URL informada no terminal (por padrão, porta `4173`).

## Estrutura do Projeto

```text
.
├── __tests__/
│   ├── ingressos.test.js
│   ├── usuarios.test.js
│   ├── usuarios.seguranca.test.js
│   ├── relogios.test.js
│   ├── sessoes.test.js
│   ├── estoque.test.js
│   └── precificacao.test.js
├── src/
│   ├── core/
│   │   └── validators.js
│   └── domain/
│       ├── ingressos.js
│       ├── usuarios.js
│       ├── relogios.js
│       ├── sessoes.js
│       ├── estoque.js
│       ├── precificacao.js
│       ├── salarios.js
│       └── desempenho.js
├── ui/
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── ingressos.js
├── usuarios.js
├── relogios.js
├── sessoes.js
├── controledeestoque.js
├── precodoingreco.js
├── basesalarial.js
├── desempenhodaturma.js
├── index.js
├── package.json
└── README.md
```

## Boas Práticas Aplicadas

- Separação por camadas (`core` e `domain`)
- Compatibilidade retroativa com os arquivos legados (reexports)
- Validação centralizada e padronizada de entrada
- Encapsulamento de regras de negócio por classe
- Tratamento explícito de erros em fluxos críticos
- Testes unitários cobrindo regras antigas e novas funcionalidades
- UI responsiva, acessível e com feedback em tempo real

## Melhorias de Arquitetura e Qualidade Implementadas

- Refactor para domínio coeso e extensível
- Redução de lógica duplicada com utilitários compartilhados
- Melhoria de segurança de autenticação (hash e bloqueio por tentativas)
- Evolução do projeto para suportar cenários operacionais reais
- Inclusão de métricas de operação e performance comercial

## Possíveis Melhorias Futuras

- Persistência em banco de dados (PostgreSQL/MongoDB)
- API REST/GraphQL para integrar front-end e serviços externos
- Autenticação JWT + controle de sessão distribuída
- Observabilidade (logs estruturados, métricas e tracing)
- Estratégias avançadas de precificação com machine learning
- CI/CD com validação de qualidade, cobertura e deploy automatizado

## Licença

MIT.

Autoria: Matheus Siqueira  
Website: https://www.matheussiqueira.dev/
