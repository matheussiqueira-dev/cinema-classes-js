const { SessaoCinema } = require('../sessoes');

describe('SessaoCinema', () => {
  test('registra venda e atualiza ocupação', () => {
    const sessao = new SessaoCinema({
      id: 'SESSAO-1',
      filme: 'Filme Teste',
      capacidade: 10,
      precoBase: 20,
    });

    const venda = sessao.venderIngressos({ tipo: 'inteira', quantidade: 2 });
    expect(venda.total).toBe(40);
    expect(sessao.ingressosVendidos).toBe(2);
    expect(sessao.lugaresDisponiveis).toBe(8);
  });

  test('ingresso família consome múltiplos assentos', () => {
    const sessao = new SessaoCinema({
      id: 'SESSAO-2',
      filme: 'Filme Família',
      capacidade: 20,
      precoBase: 10,
    });

    const venda = sessao.venderIngressos({ tipo: 'familia', quantidade: 1, numeroPessoas: 4 });
    expect(venda.assentosConsumidos).toBe(4);
    expect(venda.total).toBe(38);
  });

  test('impede venda acima da capacidade', () => {
    const sessao = new SessaoCinema({
      id: 'SESSAO-3',
      filme: 'Lotado',
      capacidade: 3,
      precoBase: 10,
    });

    expect(() => sessao.venderIngressos({ tipo: 'inteira', quantidade: 4 })).toThrow(
      'Nao ha lugares suficientes'
    );
  });
});
