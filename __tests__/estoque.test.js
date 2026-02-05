const { ControleDeEstoque } = require('../controledeestoque');

describe('ControleDeEstoque', () => {
  test('cadastra item e registra entrada', () => {
    const estoque = new ControleDeEstoque();
    estoque.cadastrarItem({
      sku: 'PIP',
      nome: 'Pipoca',
      quantidadeAtual: 10,
      estoqueMinimo: 4,
      custoUnitario: 4,
      precoVenda: 14,
    });

    const atualizado = estoque.registrarEntrada('PIP', 5);
    expect(atualizado.quantidadeAtual).toBe(15);
    expect(estoque.valorTotalEstoque()).toBe(60);
  });

  test('marca item como crítico ao ficar abaixo do mínimo', () => {
    const estoque = new ControleDeEstoque();
    estoque.cadastrarItem({
      sku: 'REF',
      nome: 'Refrigerante',
      quantidadeAtual: 5,
      estoqueMinimo: 5,
      custoUnitario: 3,
      precoVenda: 10,
    });

    const criticos = estoque.listarItensAbaixoDoMinimo();
    expect(criticos).toHaveLength(1);
    expect(criticos[0].sku).toBe('REF');
  });
});
