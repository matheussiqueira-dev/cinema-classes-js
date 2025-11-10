const { Ingresso, MeiaEntrada, IngressoFamilia } = require('../ingressos');

test('MeiaEntrada retorna metade do valor', () => {
  const meia = new MeiaEntrada(20, 'Filme', true);
  expect(meia.valorReal()).toBe(10);
});

test('IngressoFamilia sem desconto quando <= 3', () => {
  const fam3 = new IngressoFamilia(10, 'F', false, 3);
  expect(fam3.valorReal()).toBe(30);
});

test('IngressoFamilia aplica 5% quando > 3', () => {
  const fam4 = new IngressoFamilia(10, 'F', false, 4);
  // antes: 40, após 5% desconto: 38
  expect(fam4.valorReal()).toBeCloseTo(38);
});
