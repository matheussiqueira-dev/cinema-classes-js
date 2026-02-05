const { Ingresso, IngressoFamilia, MeiaEntrada } = require('./ingressos');
const { ensureNumber, ensureObject, ensureString, roundCurrency } = require('../core/validators');

let sequenciaVenda = 0;

function gerarIdVenda() {
  sequenciaVenda += 1;
  return `VEN-${String(sequenciaVenda).padStart(5, '0')}`;
}

class SessaoCinema {
  constructor({
    id,
    filme,
    sala = 'Sala 1',
    horario = '19:00',
    capacidade = 100,
    precoBase = 20,
    dublado = false,
  }) {
    this._id = ensureString(id || `SESSAO-${Date.now()}`, {
      label: 'Id da sessao',
      allowEmpty: false,
      maxLength: 80,
    });
    this._filme = ensureString(filme, { label: 'Filme', allowEmpty: false, maxLength: 120 });
    this._sala = ensureString(sala, { label: 'Sala', allowEmpty: false, maxLength: 80 });
    this._horario = ensureString(horario, { label: 'Horario', allowEmpty: false, maxLength: 5 });
    this._capacidade = ensureNumber(capacidade, { label: 'Capacidade', integer: true, min: 1 });
    this._precoBase = ensureNumber(precoBase, { label: 'Preco base', min: 0 });
    this._dublado = Boolean(dublado);
    this._ingressosVendidos = 0;
    this._receita = 0;
    this._historicoVendas = [];
  }

  get id() {
    return this._id;
  }

  get filme() {
    return this._filme;
  }

  get sala() {
    return this._sala;
  }

  get horario() {
    return this._horario;
  }

  get capacidade() {
    return this._capacidade;
  }

  get precoBase() {
    return this._precoBase;
  }

  get dublado() {
    return this._dublado;
  }

  get ingressosVendidos() {
    return this._ingressosVendidos;
  }

  get receita() {
    return roundCurrency(this._receita);
  }

  get lugaresDisponiveis() {
    return this._capacidade - this._ingressosVendidos;
  }

  get ocupacaoPercentual() {
    return roundCurrency((this._ingressosVendidos / this._capacidade) * 100);
  }

  venderIngressos({ tipo = 'inteira', quantidade = 1, numeroPessoas = 1, opcoesPreco = {} } = {}) {
    ensureObject(opcoesPreco, { label: 'Opcoes de preco' });
    const tipoNormalizado = String(tipo).trim().toLowerCase();
    const quantidadeNormalizada = ensureNumber(quantidade, {
      label: 'Quantidade de ingressos',
      integer: true,
      min: 1,
    });

    let assentosPorIngresso = 1;
    if (tipoNormalizado === 'familia') {
      assentosPorIngresso = ensureNumber(numeroPessoas, {
        label: 'Numero de pessoas por ingresso familia',
        integer: true,
        min: 1,
      });
    }

    const assentosConsumidos = quantidadeNormalizada * assentosPorIngresso;
    if (assentosConsumidos > this.lugaresDisponiveis) {
      throw new Error('Nao ha lugares suficientes para concluir esta venda');
    }

    let totalVenda = 0;
    for (let i = 0; i < quantidadeNormalizada; i += 1) {
      const ingresso = this._criarIngresso(tipoNormalizado, assentosPorIngresso, opcoesPreco);
      totalVenda += ingresso.valorReal(opcoesPreco);
    }

    const venda = {
      id: gerarIdVenda(),
      tipo: tipoNormalizado,
      quantidade: quantidadeNormalizada,
      assentosConsumidos,
      total: roundCurrency(totalVenda),
      criadoEm: new Date(),
    };

    this._historicoVendas.push(venda);
    this._ingressosVendidos += assentosConsumidos;
    this._receita += venda.total;

    return {
      ...venda,
      ocupacaoPercentual: this.ocupacaoPercentual,
      lugaresDisponiveis: this.lugaresDisponiveis,
    };
  }

  cancelarVenda(idVenda) {
    const indiceVenda = this._historicoVendas.findIndex((item) => item.id === idVenda);
    if (indiceVenda === -1) return false;

    const [venda] = this._historicoVendas.splice(indiceVenda, 1);
    this._ingressosVendidos -= venda.assentosConsumidos;
    this._receita -= venda.total;
    return true;
  }

  listarVendas() {
    return this._historicoVendas.map((venda) => ({ ...venda }));
  }

  resumoFinanceiro() {
    return {
      sessaoId: this._id,
      filme: this._filme,
      capacidade: this._capacidade,
      ingressosVendidos: this._ingressosVendidos,
      lugaresDisponiveis: this.lugaresDisponiveis,
      ocupacaoPercentual: this.ocupacaoPercentual,
      receita: this.receita,
      totalVendas: this._historicoVendas.length,
    };
  }

  _criarIngresso(tipo, numeroPessoas, opcoesPreco) {
    if (tipo === 'meia') {
      return new MeiaEntrada(this._precoBase, this._filme, this._dublado, opcoesPreco);
    }

    if (tipo === 'familia') {
      return new IngressoFamilia(
        this._precoBase,
        this._filme,
        this._dublado,
        numeroPessoas,
        opcoesPreco
      );
    }

    return new Ingresso(this._precoBase, this._filme, this._dublado, opcoesPreco);
  }
}

module.exports = { SessaoCinema };
