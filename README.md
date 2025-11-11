# cinema-classes-js

Implementações em JavaScript (CommonJS) que modelam conceitos de um cinema: ingressos, usuários e relógios. Projetado para aprendizagem, prototipagem e integração em aplicações de front/back-end.

Principais arquivos
- ingressos.js — Ingresso, MeiaEntrada, IngressoFamilia
- usuarios.js — Usuario, Gerente, Vendedor, Atendente
- relogios.js — Relogio, RelogioAmericano, RelogioBrasileiro
- index.js — demonstração simples de uso
- jest.config.cjs — configuração de testes com Jest

Resumo das regras implementadas
- Meia-entrada: paga metade do valor.
- Ingresso família: valor por pessoa * número de pessoas, com desconto de 5% se pessoas > 3.
- RelogioAmericano#sincronizarCom converte horas 0–23 para 1–12.

Como rodar localmente
Requisitos
- Node.js (versão LTS recomendada)

Comandos
- Instalar dependências:
  npm install
- Executar testes:
  npm test
- Executar demo:
  node index.js

Observações de segurança e privacidade
- Não inclua dados pessoais reais nos exemplos ou nos testes. Use dados fictícios ou mocks.
- Não armazene segredos (chaves, tokens) no repositório — use variáveis de ambiente ou ferramentas de segredos.
- Consulte SECURITY.md e PRIVACY.md neste repositório para procedimentos de reporte e diretrizes.

Contribuição
- Abra issues para bugs ou sugestões e envie PRs com descrições claras e testes quando aplicável.
- Siga o padrão de revisão por pull request; mantenedores farão a triagem e revisão de código.
- Veja GOVERNANCE.md para papéis, processo de decisão e políticas de manutenção.

Licença
- Consulte o arquivo LICENSE (se presente) para termos de uso.

Revisão recente
- Revisão focada nas classes de Ingressos, Usuários e Relógios; testes cobrem comportamento básico descrito acima.
