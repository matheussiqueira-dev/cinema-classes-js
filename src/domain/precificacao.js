const { ensureNumber, roundCurrency } = require('../core/validators');

function normalizarDiaSemana(diaDaSemana) {
  return String(diaDaSemana || '').trim().toLowerCase();
}

function calcularAjusteDemanda(ocupacaoPercentual) {
  if (ocupacaoPercentual >= 85) return 15;
  if (ocupacaoPercentual >= 70) return 8;
  if (ocupacaoPercentual < 40) return -12;
  return 0;
}

function calcularAjusteAntecedencia(antecedenciaDias) {
  if (antecedenciaDias <= 2) return 7;
  if (antecedenciaDias >= 15) return -10;
  if (antecedenciaDias >= 7) return -5;
  return 0;
}

function calcularAjusteDiaSemana(diaDaSemana) {
  const dia = normalizarDiaSemana(diaDaSemana);
  if (dia === 'sabado' || dia === 'domingo') return 8;
  if (dia === 'terca' || dia === 'quarta') return -5;
  return 0;
}

function calcularAjusteTipoSala(tipoSala) {
  const sala = String(tipoSala || 'padrao').trim().toLowerCase();
  if (sala === 'vip') return 18;
  if (sala === 'imax') return 28;
  return 0;
}

class GeradorPrecoIngresso {
  static sugerirPreco({
    precoBase,
    ocupacaoPercentual = 50,
    antecedenciaDias = 7,
    diaDaSemana = '',
    tipoSala = 'padrao',
  }) {
    const precoBaseNormalizado = ensureNumber(precoBase, { label: 'Preco base', min: 0.01 });
    const ocupacaoNormalizada = ensureNumber(ocupacaoPercentual, {
      label: 'Ocupacao',
      min: 0,
      max: 100,
    });
    const antecedenciaNormalizada = ensureNumber(antecedenciaDias, {
      label: 'Antecedencia',
      integer: true,
      min: 0,
      max: 365,
    });

    const fatores = [
      { label: 'Demanda da sessao', percentual: calcularAjusteDemanda(ocupacaoNormalizada) },
      { label: 'Antecedencia da compra', percentual: calcularAjusteAntecedencia(antecedenciaNormalizada) },
      { label: 'Dia da semana', percentual: calcularAjusteDiaSemana(diaDaSemana) },
      { label: 'Tipo de sala', percentual: calcularAjusteTipoSala(tipoSala) },
    ];

    const ajusteTotalPercentual = fatores.reduce((acc, fator) => acc + fator.percentual, 0);
    const precoSemLimite = precoBaseNormalizado * (1 + ajusteTotalPercentual / 100);
    const precoMinimo = precoBaseNormalizado * 0.6;
    const precoMaximo = precoBaseNormalizado * 1.8;
    const precoSugerido = Math.min(Math.max(precoSemLimite, precoMinimo), precoMaximo);

    return {
      precoBase: roundCurrency(precoBaseNormalizado),
      precoSugerido: roundCurrency(precoSugerido),
      faixaPermitida: {
        minimo: roundCurrency(precoMinimo),
        maximo: roundCurrency(precoMaximo),
      },
      ajusteTotalPercentual: roundCurrency(ajusteTotalPercentual),
      fatores,
    };
  }

  static montarGradePrecos({
    precoBase,
    tipoSala = 'padrao',
    diasDaSemana = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'],
  }) {
    return diasDaSemana.map((diaDaSemana) =>
      this.sugerirPreco({
        precoBase,
        tipoSala,
        diaDaSemana,
      })
    );
  }
}

module.exports = {
  GeradorPrecoIngresso,
};
