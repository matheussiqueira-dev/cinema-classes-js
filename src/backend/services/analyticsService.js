const { PainelDesempenho } = require('../../domain/desempenho');

class AnalyticsService {
  constructor({ db }) {
    this.db = db;
  }

  getDashboard() {
    const sessions = Array.from(this.db.sessions.values());
    const users = Array.from(this.db.users.values());
    const vendedores = users.filter((user) => user.cargo === 'vendedor');
    const itensCriticos = this.db.inventory.listarItensAbaixoDoMinimo().length;

    const indicadores = PainelDesempenho.gerarIndicadores({
      sessoes: sessions,
      vendedores,
      itensEstoqueCriticos: itensCriticos,
    });

    return {
      ...indicadores,
      auditoria: {
        totalEventos: this.db.auditEvents.length,
        ultimosEventos: this.db.auditEvents.slice(-15).reverse(),
      },
    };
  }

  getSystemMetrics() {
    return {
      uptimeSeconds: process.uptime(),
      memoryUsage: process.memoryUsage(),
      activeSessions: this.db.sessions.size,
      registeredUsers: this.db.users.size,
      inventoryItems: this.db.inventory.listarItens().length,
      criticalInventoryItems: this.db.inventory.listarItensAbaixoDoMinimo().length,
    };
  }
}

module.exports = { AnalyticsService };
