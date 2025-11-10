const { Gerente, Vendedor, Atendente } = require('../usuarios');

test('Gerente deve ser admin', () => {
  const g = new Gerente('A', 'a@x', 's');
  expect(g.isAdmin()).toBe(true);
});

test('Vendedor realizarVenda incrementa quantidade', () => {
  const v = new Vendedor('V', 'v@x', 's');
  expect(v.quantidadeVendas).toBe(0);
  v.realizarVenda();
  expect(v.quantidadeVendas).toBe(1);
});

test('Atendente receberPagamentos e fecharCaixa', () => {
  const a = new Atendente('At', 'at@x', 's', 100);
  a.receberPagamentos(50);
  expect(a.valorEmCaixa).toBe(150);
  const fechado = a.fecharCaixa();
  expect(fechado).toBe(150);
  expect(a.valorEmCaixa).toBe(0);
});
