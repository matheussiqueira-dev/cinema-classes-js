const { RelogioBrasileiro, RelogioAmericano } = require('../relogios');

test('RelogioBrasileiro formata HH:MM:SS corretamente', () => {
  const rb = new RelogioBrasileiro(21, 5, 9);
  expect(rb.horaFormatada()).toBe('21:05:09');
});

test('RelogioAmericano sincroniza convertendo 24h->12h', () => {
  const rb = new RelogioBrasileiro(21, 30, 15); // 21 -> 9pm
  const ra = new RelogioAmericano(9, 0, 0);
  ra.sincronizarCom(rb);
  // depois da sincronização, hora americana deve ser 9
  expect(ra.getHora()).toBe(9);
  expect(ra.getMinuto()).toBe(30);
  expect(ra.getSegundo()).toBe(15);
});
