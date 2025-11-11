# Revisão: Classes de Ingressos, Usuários e Relógios

Este projeto contém implementações em JavaScript (CommonJS) para:

- `ingressos.js` — classes `Ingresso`, `MeiaEntrada`, `IngressoFamilia`.
- `usuarios.js` — classes `Usuario`, `Gerente`, `Vendedor`, `Atendente`.
- `relogios.js` — classes `Relogio`, `RelogioAmericano`, `RelogioBrasileiro`.
- `index.js` — demo com exemplos de uso.

Como rodar localmente (macOS, zsh):

1. Instale Node.js (recomendado via Homebrew):

```bash
brew install node
```

2. No diretório do projeto, instale dependências e rode testes:

```bash
npm install
npm test
```

Os testes usam Jest (configurado em `jest.config.cjs`). Se preferir não instalar as dependências, você pode executar `node index.js` para ver o demo.

Observações:
- Os métodos que retornam valores reais de ingressos seguem as regras solicitadas (meia = metade, família = valor * número de pessoas com 5% de desconto para >3).
- `RelogioAmericano#sincronizarCom` converte horas 0-23 para 1-12.
