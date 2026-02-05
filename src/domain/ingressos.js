const {
  ensureBoolean,
  ensureNumber,
  ensureObject,
  ensureString,
  roundCurrency,
} = require('../core/validators');

const FIDELIDADE_PERCENTUAL = {
  nenhum: 0,
  silver: 5,
  gold: 10,
};

function normalizarDiaSemana(diaDaSemana) {
  if (!diaDaSemana) return '';
  return String(diaDaSemana).trim().toLowerCase();
}

function isFimDeSemana(diaDaSemana) {
  const diaNormalizado = normalizarDiaSemana(diaDaSemana);
  return diaNormalizado === 'sabado' || diaNormalizado === 'domingo';
}

function calcularPercentual(valorBase, percentual) {
  return roundCurrency(valorBase * (percentual / 100));
}

class CalculadoraPrecoIngresso {
  static calcularDetalhado(valorBase, opcoes = {}) {
    const base = ensureNumber(valorBase, { label: 'Valor base', min: 0 });
    const configuracao = { ...opcoes };

    let total = base;
    const modificadores = [];

    const aplicarAjuste = (label, percentual) => {
      if (!percentual) return;
      const valor = calcularPercentual(total, percentual);
      total = roundCurrency(total + valor);
      modificadores.push({
        label,
        percentual,
        valor,
      });
    };

    const tipoSala = String(configuracao.tipoSala || 'padrao').toLowerCase();
    if (tipoSala === 'vip') aplicarAjuste('Sala VIP', 20);
    if (tipoSala === 'imax') aplicarAjuste('Sala IMAX', 30);

    if (ensureBoolean(configuracao.assentoPremium)) {
      aplicarAjuste('Assento premium', 15);
    }

    const ajusteDublagem = ensureNumber(configuracao.ajusteDublagemPercentual ?? 0, {
      label: 'Ajuste de dublagem',
      min: 0,
      max: 30,
    });
    if (ensureBoolean(configuracao.dublado) && ajusteDublagem > 0) {
      aplicarAjuste('Sessao dublada', ajusteDublagem);
    }

    if (isFimDeSemana(configuracao.diaDaSemana)) {
      aplicarAjuste('Alta demanda de fim de semana', 10);
    }

    if (typeof configuracao.ocupacaoPercentual !== 'undefined') {
      const ocupacao = ensureNumber(configuracao.ocupacaoPercentual, {
        label: 'Ocupacao',
        min: 0,
        max: 100,
      });
      if (ocupacao >= 80) {
        aplicarAjuste('Demanda alta da sessao', 12);
      }
    }

    const fidelidade = String(configuracao.fidelidade || 'nenhum').toLowerCase();
    const descontoFidelidade = FIDELIDADE_PERCENTUAL[fidelidade] || 0;
    if (descontoFidelidade > 0) {
      aplicarAjuste(`Programa fidelidade ${fidelidade}`, -descontoFidelidade);
    }

    if (typeof configuracao.cupomPercentual !== 'undefined') {
      const descontoCupom = ensureNumber(configuracao.cupomPercentual, {
        label: 'Cupom',
        min: 0,
        max: 80,
      });
      if (descontoCupom > 0) {
        aplicarAjuste('Cupom promocional', -descontoCupom);
      }
    }

    return {
      base: roundCurrency(base),
      total: roundCurrency(total),
      modificadores,
    };
  }

  static aplicarAjustes(valorBase, opcoes = {}) {
    return this.calcularDetalhado(valorBase, opcoes).total;
  }
}

class Ingresso {
  constructor(valor = 0, nomeFilme = '', dublado = false, opcoesPreco = {}) {
    this.valor = valor;
    this.nomeFilme = nomeFilme;
    this.dublado = dublado;
    this._opcoesPreco = { ...opcoesPreco };
  }

  get valor() {
    return this._valor;
  }

  set valor(v) {
    this._valor = ensureNumber(v, { label: 'Valor do ingresso', min: 0 });
  }

  get nomeFilme() {
    return this._nomeFilme;
  }

  set nomeFilme(nome) {
    this._nomeFilme = ensureString(nome, {
      label: 'Nome do filme',
      allowEmpty: true,
      maxLength: 120,
    });
  }

  get dublado() {
    return this._dublado;
  }

  set dublado(dublado) {
    this._dublado = ensureBoolean(dublado);
  }

  atualizarOpcoesPreco(opcoes = {}) {
    ensureObject(opcoes, { label: 'Opcoes de preco' });
    this._opcoesPreco = { ...this._opcoesPreco, ...opcoes };
    return this;
  }

  valorReal(opcoes = {}) {
    return CalculadoraPrecoIngresso.aplicarAjustes(this._valor, {
      ...this._opcoesPreco,
      ...opcoes,
      dublado: this._dublado,
    });
  }

  detalharValor(opcoes = {}) {
    return CalculadoraPrecoIngresso.calcularDetalhado(this._valor, {
      ...this._opcoesPreco,
      ...opcoes,
      dublado: this._dublado,
    });
  }
}

class MeiaEntrada extends Ingresso {
  valorReal(opcoes = {}) {
    return roundCurrency(super.valorReal(opcoes) * 0.5);
  }

  detalharValor(opcoes = {}) {
    const detalhamentoBase = super.detalharValor(opcoes);
    const desconto = roundCurrency(detalhamentoBase.total * -0.5);
    return {
      ...detalhamentoBase,
      modificadores: [
        ...detalhamentoBase.modificadores,
        { label: 'Meia-entrada legal', percentual: -50, valor: desconto },
      ],
      total: roundCurrency(detalhamentoBase.total + desconto),
    };
  }
}

class IngressoFamilia extends Ingresso {
  constructor(valor, nomeFilme, dublado, numeroPessoas = 1, opcoesPreco = {}) {
    super(valor, nomeFilme, dublado, opcoesPreco);
    this.numeroPessoas = numeroPessoas;
  }

  get numeroPessoas() {
    return this._numeroPessoas;
  }

  set numeroPessoas(valor) {
    this._numeroPessoas = ensureNumber(valor, {
      label: 'Numero de pessoas',
      integer: true,
      min: 1,
    });
  }

  valorReal(opcoes = {}) {
    const valorUnitario = super.valorReal(opcoes);
    let total = valorUnitario * this._numeroPessoas;
    if (this._numeroPessoas > 3) {
      total *= 0.95;
    }
    return roundCurrency(total);
  }

  detalharValor(opcoes = {}) {
    const valorUnitario = super.detalharValor(opcoes);
    const subtotal = roundCurrency(valorUnitario.total * this._numeroPessoas);
    const temDescontoFamilia = this._numeroPessoas > 3;
    const descontoFamilia = temDescontoFamilia ? roundCurrency(subtotal * -0.05) : 0;

    return {
      ...valorUnitario,
      modificadores: [
        ...valorUnitario.modificadores,
        {
          label: `Quantidade familia (${this._numeroPessoas} pessoas)`,
          percentual: 0,
          valor: roundCurrency(subtotal - valorUnitario.total),
        },
        ...(temDescontoFamilia
          ? [{ label: 'Desconto familia', percentual: -5, valor: descontoFamilia }]
          : []),
      ],
      total: roundCurrency(subtotal + descontoFamilia),
    };
  }
}

module.exports = {
  CalculadoraPrecoIngresso,
  Ingresso,
  IngressoFamilia,
  MeiaEntrada,
};
