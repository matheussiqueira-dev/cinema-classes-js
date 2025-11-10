// Hierarquia de ingressos para cinema

class Ingresso {
  constructor(valor = 0, nomeFilme = '', dublado = false) {
    this._valor = Number(valor);
    this._nomeFilme = nomeFilme;
    this._dublado = Boolean(dublado);
  }

  // getters / setters
  get valor() {
    return this._valor;
  }
  set valor(v) {
    const n = Number(v);
    if (Number.isNaN(n) || n < 0) throw new Error('Valor inválido');
    this._valor = n;
  }

  get nomeFilme() {
    return this._nomeFilme;
  }
  set nomeFilme(n) {
    this._nomeFilme = String(n);
  }

  get dublado() {
    return this._dublado;
  }
  set dublado(b) {
    this._dublado = Boolean(b);
  }

  // retorna o valor real do ingresso (para classes filhas sobrescreverem)
  valorReal() {
    return this._valor;
  }
}

class MeiaEntrada extends Ingresso {
  constructor(valor, nomeFilme, dublado) {
    super(valor, nomeFilme, dublado);
  }

  valorReal() {
    return this._valor / 2;
  }
}

class IngressoFamilia extends Ingresso {
  constructor(valor, nomeFilme, dublado, numeroPessoas = 1) {
    super(valor, nomeFilme, dublado);
    this._numeroPessoas = Number(numeroPessoas) || 1;
    if (this._numeroPessoas < 1) this._numeroPessoas = 1;
  }

  get numeroPessoas() {
    return this._numeroPessoas;
  }
  set numeroPessoas(n) {
    const num = Number(n);
    if (!Number.isFinite(num) || num < 1) throw new Error('Número de pessoas inválido');
    this._numeroPessoas = Math.floor(num);
  }

  valorReal() {
    let total = this._valor * this._numeroPessoas;
    if (this._numeroPessoas > 3) {
      total = total * 0.95; // desconto de 5%
    }
    return total;
  }
}

module.exports = { Ingresso, MeiaEntrada, IngressoFamilia };
