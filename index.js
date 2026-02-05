const { Ingresso, MeiaEntrada, IngressoFamilia, CalculadoraPrecoIngresso } = require('./ingressos');
const { Atendente, Gerente, Vendedor } = require('./usuarios');
const { RelogioAmericano, RelogioBrasileiro } = require('./relogios');
const { SessaoCinema } = require('./sessoes');
const { ControleDeEstoque } = require('./controledeestoque');
const { GeradorPrecoIngresso } = require('./precodoingreco');
const { BaseSalarialCinema } = require('./basesalarial');
const { PainelDesempenho } = require('./desempenhodaturma');

console.log('=== DEMO INGRESSOS ===');
const ingressoNormal = new Ingresso(20, 'Matrix', false);
const meia = new MeiaEntrada(20, 'Toy Story', true);
const familia = new IngressoFamilia(15, 'Sessao Familia', false, 4);

console.log('Ingresso normal:', ingressoNormal.nomeFilme, ingressoNormal.valorReal());
console.log('Meia entrada:', meia.nomeFilme, meia.valorReal());
console.log('Ingresso familia (4 pessoas, 5% desconto):', familia.valorReal());

const detalhamento = CalculadoraPrecoIngresso.calcularDetalhado(30, {
  tipoSala: 'imax',
  assentoPremium: true,
  diaDaSemana: 'domingo',
  cupomPercentual: 10,
  fidelidade: 'silver',
});
console.log('Preco detalhado IMAX:', detalhamento);

console.log('\n=== DEMO USUARIOS ===');
const gerente = new Gerente('Alice', 'alice@cinema.com', 'senha123');
const vendedor = new Vendedor('Bruno', 'bruno@cinema.com', 'vpass');
const atendente = new Atendente('Carla', 'carla@cinema.com', 'apass', 100);

console.log('Gerente e admin?', gerente.isAdmin());
console.log('Vendedor e admin?', vendedor.isAdmin());
console.log('Atendente e admin?', atendente.isAdmin());

vendedor.realizarVenda(90);
vendedor.realizarVenda(60);
console.log('Vendas do vendedor (detalhado):', vendedor.consultarVendas(true));

atendente.receberPagamentos(50);
console.log('Atendente caixa apos pagamento:', atendente.valorEmCaixa);
console.log('Fechar caixa retorna:', atendente.fecharCaixa());
console.log('Caixa depois de fechado:', atendente.valorEmCaixa);

console.log('\n=== DEMO RELOGIOS ===');
const relogioBr = new RelogioBrasileiro(21, 30, 15);
const relogioUs = new RelogioAmericano(9, 0, 0);

console.log('Brasileiro:', relogioBr.horaFormatada());
console.log('Americano:', relogioUs.horaFormatadaCompleta());
relogioUs.sincronizarCom(relogioBr);
console.log('Americano apos sincronizar com BR:', relogioUs.horaFormatadaCompleta());
relogioBr.sincronizarCom(relogioUs);
console.log('Brasileiro apos sincronizar com AM:', relogioBr.horaFormatada());

console.log('\n=== NOVA FEATURE: SESSAO ===');
const sessao = new SessaoCinema({
  id: 'SESSAO-N1',
  filme: 'Interestelar',
  sala: 'Sala Prime',
  horario: '20:30',
  capacidade: 80,
  precoBase: 28,
  dublado: false,
});

const venda1 = sessao.venderIngressos({ tipo: 'inteira', quantidade: 2, opcoesPreco: { tipoSala: 'vip' } });
const venda2 = sessao.venderIngressos({ tipo: 'familia', quantidade: 1, numeroPessoas: 4 });
console.log('Venda 1:', venda1);
console.log('Venda 2:', venda2);
console.log('Resumo da sessao:', sessao.resumoFinanceiro());

console.log('\n=== NOVA FEATURE: ESTOQUE ===');
const estoque = new ControleDeEstoque();
estoque.cadastrarItem({
  sku: 'PIP-G',
  nome: 'Pipoca Grande',
  quantidadeAtual: 40,
  estoqueMinimo: 10,
  custoUnitario: 6,
  precoVenda: 18,
});
estoque.registrarSaida('PIP-G', 8);
console.log('Itens cadastrados:', estoque.listarItens());
console.log('Itens criticos:', estoque.listarItensAbaixoDoMinimo());

console.log('\n=== NOVA FEATURE: PRECIFICACAO DINAMICA ===');
const precoSugerido = GeradorPrecoIngresso.sugerirPreco({
  precoBase: 24,
  ocupacaoPercentual: 88,
  antecedenciaDias: 1,
  diaDaSemana: 'sabado',
  tipoSala: 'imax',
});
console.log('Sugestao de preco:', precoSugerido);

console.log('\n=== NOVA FEATURE: FOLHA SALARIAL ===');
const folha = new BaseSalarialCinema().calcularFolhaEquipe([
  { cargo: 'gerente', bonus: 700 },
  { cargo: 'vendedor', vendas: 12000, taxaComissao: 0.03, horasExtras: 5, valorHoraExtra: 50 },
  { cargo: 'atendente', horasExtras: 8, valorHoraExtra: 35 },
]);
console.log('Resumo folha:', folha);

console.log('\n=== PAINEL DE DESEMPENHO ===');
const indicadores = PainelDesempenho.gerarIndicadores({
  sessoes: [sessao],
  vendedores: [vendedor],
  itensEstoqueCriticos: estoque.listarItensAbaixoDoMinimo().length,
});
console.log('Indicadores:', indicadores);

console.log('\nDemo finalizada.');
