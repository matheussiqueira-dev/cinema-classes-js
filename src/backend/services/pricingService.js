const { ensureNumber, ensureString } = require('../../core/validators');
const { CalculadoraPrecoIngresso } = require('../../domain/ingressos');
const { GeradorPrecoIngresso } = require('../../domain/precificacao');
const { ValidationError } = require('../core/errors');
const { sanitizeValue } = require('../utils/sanitize');

class PricingService {
  calculate(payload) {
    const input = sanitizeValue(payload || {});

    try {
      const valorBase = ensureNumber(input.valorBase, { label: 'Valor base', min: 0 });
      const opcoes = {
        tipoSala: ensureString(input.tipoSala || 'padrao', { label: 'Tipo de sala', maxLength: 20 }).toLowerCase(),
        assentoPremium: Boolean(input.assentoPremium),
        diaDaSemana: ensureString(input.diaDaSemana || 'segunda', { label: 'Dia da semana', maxLength: 20 }).toLowerCase(),
        ocupacaoPercentual: ensureNumber(input.ocupacaoPercentual || 0, {
          label: 'Ocupacao',
          min: 0,
          max: 100,
        }),
        fidelidade: ensureString(input.fidelidade || 'nenhum', { label: 'Fidelidade', maxLength: 20 }).toLowerCase(),
        cupomPercentual: ensureNumber(input.cupomPercentual || 0, {
          label: 'Cupom',
          min: 0,
          max: 80,
        }),
        dublado: Boolean(input.dublado),
        ajusteDublagemPercentual: ensureNumber(input.ajusteDublagemPercentual || 0, {
          label: 'Ajuste de dublagem',
          min: 0,
          max: 30,
        }),
      };

      return CalculadoraPrecoIngresso.calcularDetalhado(valorBase, opcoes);
    } catch (error) {
      throw new ValidationError(error.message);
    }
  }

  suggest(payload) {
    const input = sanitizeValue(payload || {});

    try {
      return GeradorPrecoIngresso.sugerirPreco({
        precoBase: ensureNumber(input.precoBase, { label: 'Preco base', min: 0.01 }),
        ocupacaoPercentual: ensureNumber(input.ocupacaoPercentual || 50, {
          label: 'Ocupacao',
          min: 0,
          max: 100,
        }),
        antecedenciaDias: ensureNumber(input.antecedenciaDias || 7, {
          label: 'Antecedencia',
          min: 0,
          max: 365,
          integer: true,
        }),
        diaDaSemana: ensureString(input.diaDaSemana || 'segunda', { label: 'Dia da semana', maxLength: 20 }).toLowerCase(),
        tipoSala: ensureString(input.tipoSala || 'padrao', { label: 'Tipo de sala', maxLength: 20 }).toLowerCase(),
      });
    } catch (error) {
      throw new ValidationError(error.message);
    }
  }

  buildGrid(payload) {
    const input = sanitizeValue(payload || {});
    try {
      return GeradorPrecoIngresso.montarGradePrecos({
        precoBase: ensureNumber(input.precoBase, { label: 'Preco base', min: 0.01 }),
        tipoSala: ensureString(input.tipoSala || 'padrao', { label: 'Tipo de sala', maxLength: 20 }).toLowerCase(),
      });
    } catch (error) {
      throw new ValidationError(error.message);
    }
  }
}

module.exports = { PricingService };
