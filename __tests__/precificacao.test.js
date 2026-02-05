const { GeradorPrecoIngresso } = require('../precodoingreco');

describe('GeradorPrecoIngresso', () => {
  test('aumenta preço em cenário de alta demanda', () => {
    const resultado = GeradorPrecoIngresso.sugerirPreco({
      precoBase: 30,
      ocupacaoPercentual: 92,
      antecedenciaDias: 1,
      diaDaSemana: 'sabado',
      tipoSala: 'imax',
    });

    expect(resultado.precoSugerido).toBeGreaterThan(30);
    expect(resultado.ajusteTotalPercentual).toBeGreaterThan(0);
  });

  test('reduz preço em cenário de baixa demanda com antecedência', () => {
    const resultado = GeradorPrecoIngresso.sugerirPreco({
      precoBase: 30,
      ocupacaoPercentual: 25,
      antecedenciaDias: 20,
      diaDaSemana: 'terca',
      tipoSala: 'padrao',
    });

    expect(resultado.precoSugerido).toBeLessThan(30);
  });
});
