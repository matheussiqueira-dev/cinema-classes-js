const { BaseSalarialCinema } = require('../../domain/salarios');
const { ValidationError } = require('../core/errors');
const { sanitizeValue } = require('../utils/sanitize');

class PayrollService {
  constructor() {
    this.payrollDomain = new BaseSalarialCinema();
  }

  calculateEmployee(payload) {
    const input = sanitizeValue(payload || {});
    try {
      return this.payrollDomain.calcularPagamento(input);
    } catch (error) {
      throw new ValidationError(error.message);
    }
  }

  calculateTeam(payload) {
    const input = sanitizeValue(payload || {});
    try {
      return this.payrollDomain.calcularFolhaEquipe(input.equipe || []);
    } catch (error) {
      throw new ValidationError(error.message);
    }
  }
}

module.exports = { PayrollService };
