const { ensureArray, ensureNumber, ensureString, roundCurrency } = require('../core/validators');

const BASE_SALARIAL_PADRAO = {
  gerente: 5500,
  vendedor: 2200,
  atendente: 1900,
  usuario: 1600,
};

class BaseSalarialCinema {
  constructor(basePorCargo = {}) {
    this._basePorCargo = { ...BASE_SALARIAL_PADRAO, ...basePorCargo };
  }

  obterBase(cargo = 'usuario') {
    const cargoNormalizado = ensureString(cargo, {
      label: 'Cargo',
      allowEmpty: false,
      maxLength: 40,
    }).toLowerCase();
    return ensureNumber(this._basePorCargo[cargoNormalizado] || BASE_SALARIAL_PADRAO.usuario, {
      label: 'Base salarial',
      min: 0,
    });
  }

  calcularPagamento({
    cargo = 'usuario',
    vendas = 0,
    taxaComissao = 0.02,
    horasExtras = 0,
    valorHoraExtra = 0,
    bonus = 0,
    descontos = 0,
  } = {}) {
    const salarioBase = this.obterBase(cargo);
    const vendasNormalizadas = ensureNumber(vendas, { label: 'Vendas', min: 0 });
    const taxaComissaoNormalizada = ensureNumber(taxaComissao, {
      label: 'Taxa de comissao',
      min: 0,
      max: 1,
    });
    const horasExtrasNormalizadas = ensureNumber(horasExtras, {
      label: 'Horas extras',
      min: 0,
      integer: true,
    });
    const valorHoraExtraNormalizado = ensureNumber(valorHoraExtra, {
      label: 'Valor da hora extra',
      min: 0,
    });
    const bonusNormalizado = ensureNumber(bonus, { label: 'Bonus', min: 0 });
    const descontosNormalizados = ensureNumber(descontos, { label: 'Descontos', min: 0 });

    const comissao = vendasNormalizadas * taxaComissaoNormalizada;
    const extras = horasExtrasNormalizadas * valorHoraExtraNormalizado;
    const totalBruto = salarioBase + comissao + extras + bonusNormalizado;
    const totalLiquido = Math.max(totalBruto - descontosNormalizados, 0);

    return {
      cargo,
      salarioBase: roundCurrency(salarioBase),
      comissao: roundCurrency(comissao),
      extras: roundCurrency(extras),
      bonus: roundCurrency(bonusNormalizado),
      descontos: roundCurrency(descontosNormalizados),
      totalLiquido: roundCurrency(totalLiquido),
    };
  }

  calcularFolhaEquipe(colaboradores = []) {
    const equipe = ensureArray(colaboradores, { label: 'Equipe' });
    const folha = equipe.map((colaborador) => this.calcularPagamento(colaborador));
    const totalFolha = folha.reduce((acc, item) => acc + item.totalLiquido, 0);
    return {
      folha,
      totalFolha: roundCurrency(totalFolha),
    };
  }
}

module.exports = { BaseSalarialCinema };
