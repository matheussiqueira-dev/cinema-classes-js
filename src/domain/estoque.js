const { ensureNumber, ensureString, roundCurrency } = require('../core/validators');

class ItemEstoque {
  constructor({
    sku,
    nome,
    quantidadeAtual = 0,
    estoqueMinimo = 0,
    custoUnitario = 0,
    precoVenda = 0,
  }) {
    this._sku = ensureString(sku, { label: 'SKU', allowEmpty: false, maxLength: 40 });
    this._nome = ensureString(nome, { label: 'Nome do item', allowEmpty: false, maxLength: 120 });
    this._estoqueMinimo = ensureNumber(estoqueMinimo, {
      label: 'Estoque minimo',
      integer: true,
      min: 0,
    });
    this._quantidadeAtual = ensureNumber(quantidadeAtual, {
      label: 'Quantidade atual',
      integer: true,
      min: 0,
    });
    this._custoUnitario = ensureNumber(custoUnitario, { label: 'Custo unitario', min: 0 });
    this._precoVenda = ensureNumber(precoVenda, { label: 'Preco de venda', min: 0 });
  }

  get sku() {
    return this._sku;
  }

  get nome() {
    return this._nome;
  }

  get quantidadeAtual() {
    return this._quantidadeAtual;
  }

  get estoqueMinimo() {
    return this._estoqueMinimo;
  }

  repor(quantidade) {
    const quantidadeNormalizada = ensureNumber(quantidade, {
      label: 'Quantidade de reposicao',
      integer: true,
      min: 1,
    });
    this._quantidadeAtual += quantidadeNormalizada;
    return this._quantidadeAtual;
  }

  consumir(quantidade) {
    const quantidadeNormalizada = ensureNumber(quantidade, {
      label: 'Quantidade de saida',
      integer: true,
      min: 1,
    });
    if (quantidadeNormalizada > this._quantidadeAtual) {
      throw new Error('Quantidade de saida maior que o saldo em estoque');
    }
    this._quantidadeAtual -= quantidadeNormalizada;
    return this._quantidadeAtual;
  }

  precisaReposicao() {
    return this._quantidadeAtual <= this._estoqueMinimo;
  }

  valorEmEstoque() {
    return roundCurrency(this._quantidadeAtual * this._custoUnitario);
  }

  margemUnitaria() {
    return roundCurrency(this._precoVenda - this._custoUnitario);
  }

  toJSON() {
    return {
      sku: this._sku,
      nome: this._nome,
      quantidadeAtual: this._quantidadeAtual,
      estoqueMinimo: this._estoqueMinimo,
      custoUnitario: this._custoUnitario,
      precoVenda: this._precoVenda,
      precisaReposicao: this.precisaReposicao(),
      valorEmEstoque: this.valorEmEstoque(),
      margemUnitaria: this.margemUnitaria(),
    };
  }
}

class ControleDeEstoque {
  constructor() {
    this._itens = new Map();
  }

  cadastrarItem(item) {
    const itemNormalizado = item instanceof ItemEstoque ? item : new ItemEstoque(item);
    if (this._itens.has(itemNormalizado.sku)) {
      throw new Error('Ja existe item cadastrado com este SKU');
    }
    this._itens.set(itemNormalizado.sku, itemNormalizado);
    return itemNormalizado.toJSON();
  }

  registrarEntrada(sku, quantidade) {
    const item = this._obterItemOuErro(sku);
    item.repor(quantidade);
    return item.toJSON();
  }

  registrarSaida(sku, quantidade) {
    const item = this._obterItemOuErro(sku);
    item.consumir(quantidade);
    return item.toJSON();
  }

  listarItens() {
    return Array.from(this._itens.values()).map((item) => item.toJSON());
  }

  listarItensAbaixoDoMinimo() {
    return this.listarItens().filter((item) => item.precisaReposicao);
  }

  valorTotalEstoque() {
    return roundCurrency(
      Array.from(this._itens.values()).reduce((total, item) => total + item.valorEmEstoque(), 0)
    );
  }

  _obterItemOuErro(sku) {
    const skuNormalizado = String(sku || '').trim();
    const item = this._itens.get(skuNormalizado);
    if (!item) {
      throw new Error('Item nao encontrado no estoque');
    }
    return item;
  }
}

module.exports = {
  ControleDeEstoque,
  ItemEstoque,
};
