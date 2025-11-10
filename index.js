// Demo de uso das classes criadas

const { Ingresso, MeiaEntrada, IngressoFamilia } = require('./ingressos');
const { Gerente, Vendedor, Atendente } = require('./usuarios');
const { Relogio, RelogioAmericano, RelogioBrasileiro } = require('./relogios');

console.log('=== DEMO INGRESSOS ===');
const ingressoNormal = new Ingresso(20, 'Matrix', false);
const meia = new MeiaEntrada(20, 'Toy Story', true);
const familia = new IngressoFamilia(15, 'Sessão Família', false, 4);

console.log('Ingresso normal:', ingressoNormal.nomeFilme, ingressoNormal.valorReal());
console.log('Meia entrada:', meia.nomeFilme, meia.valorReal());
console.log('Ingresso família (4 pessoas, 5% desconto):', familia.valorReal());

console.log('\n=== DEMO USUÁRIOS ===');
const g = new Gerente('Alice', 'alice@cinema.com', 'senha123');
const v = new Vendedor('Bruno', 'bruno@cinema.com', 'vpass');
const a = new Atendente('Carla', 'carla@cinema.com', 'apass', 100);

console.log('Gerente é admin?', g.isAdmin());
console.log('Vendedor é admin?', v.isAdmin());
console.log('Atendente é admin?', a.isAdmin());

v.realizarVenda();
v.realizarVenda();
console.log('Vendas do vendedor:', v.consultarVendas());

a.receberPagamentos(50);
console.log('Atendente caixa após pagamento:', a.valorEmCaixa);
console.log('Fechar caixa retorna:', a.fecharCaixa());
console.log('Caixa depois de fechado:', a.valorEmCaixa);

console.log('\n=== DEMO RELÓGIOS ===');
const rb = new RelogioBrasileiro(21, 30, 15); // 21:30:15
const ra = new RelogioAmericano(9, 0, 0); // 9:00:00

console.log('Brasileiro:', rb.horaFormatada());
console.log('Americano:', ra.horaFormatada());

// sincronizar americano com brasileiro (21 -> 9pm convertido para 9)
ra.sincronizarCom(rb);
console.log('Americano após sincronizar com BR (deve mostrar 09:mm:ss):', ra.horaFormatada());

// sincronizar brasileiro com americano (usa hora 1-12 do americano)
rb.sincronizarCom(ra); // rb receberá hora 9, mantendo formato 0-23 (9)
console.log('Brasileiro após sincronizar com AM:', rb.horaFormatada());

console.log('\nDemo finalizado.');
