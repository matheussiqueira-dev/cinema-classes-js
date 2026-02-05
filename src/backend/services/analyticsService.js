const { PainelDesempenho } = require('../../domain/desempenho');

class AnalyticsService {
  constructor({ db }) {
    this.db = db;
  }

  #toSessionDTO(session) {
    return {
      sessaoId: session.id,
      filme: session.filme,
      sala: session.sala,
      horario: session.horario,
      capacidade: session.capacidade,
      precoBase: session.precoBase,
      dublado: session.dublado,
      ...session.resumoFinanceiro(),
      vendas: session.listarVendas().map((sale) => ({
        ...sale,
        criadoEm:
          sale.criadoEm instanceof Date ? sale.criadoEm.toISOString() : String(sale.criadoEm || ''),
      })),
    };
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

  getAuditEvents({ type = '', limit = 50, page = 1 } = {}) {
    const normalizedType = String(type || '').trim().toUpperCase();
    const normalizedLimit = Math.min(Math.max(Number(limit) || 50, 1), 200);
    const normalizedPage = Math.max(Number(page) || 1, 1);

    const filtered = this.db.auditEvents
      .filter((event) => (normalizedType ? event.type === normalizedType : true))
      .slice()
      .reverse();

    const offset = (normalizedPage - 1) * normalizedLimit;
    const items = filtered.slice(offset, offset + normalizedLimit);

    return {
      items,
      pagination: {
        page: normalizedPage,
        limit: normalizedLimit,
        total: filtered.length,
        hasNext: offset + normalizedLimit < filtered.length,
      },
    };
  }

  getOperationalReport() {
    const sessions = Array.from(this.db.sessions.values()).map((session) => this.#toSessionDTO(session));
    const inventoryItems = this.db.inventory.listarItens();
    const inventorySummary = {
      totalItens: inventoryItems.length,
      itensCriticos: this.db.inventory.listarItensAbaixoDoMinimo().length,
      valorTotalEstoque: this.db.inventory.valorTotalEstoque(),
    };

    const totals = sessions.reduce(
      (acc, session) => {
        acc.receita += Number(session.receita || 0);
        acc.ingressos += Number(session.ingressosVendidos || 0);
        acc.capacidade += Number(session.capacidade || 0);
        return acc;
      },
      { receita: 0, ingressos: 0, capacidade: 0 }
    );

    const ocupacaoMedia = totals.capacidade === 0 ? 0 : (totals.ingressos / totals.capacidade) * 100;
    const auditSummary = this.db.auditEvents.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {});

    return {
      generatedAt: new Date().toISOString(),
      sessions,
      inventory: {
        items: inventoryItems,
        summary: inventorySummary,
      },
      totals: {
        receitaTotal: Number(totals.receita.toFixed(2)),
        ingressosVendidos: totals.ingressos,
        ocupacaoMedia: Number(ocupacaoMedia.toFixed(2)),
      },
      audit: {
        totalEventos: this.db.auditEvents.length,
        porTipo: auditSummary,
      },
    };
  }

  toOperationalReportCsv(report) {
    const header = ['sessionId', 'filme', 'sala', 'capacidade', 'ingressosVendidos', 'ocupacaoPercentual', 'receita'];
    const rows = report.sessions.map((session) => [
      session.sessaoId,
      session.filme,
      session.sala,
      session.capacidade,
      session.ingressosVendidos,
      session.ocupacaoPercentual,
      session.receita,
    ]);

    const csvLines = [header, ...rows].map((line) =>
      line.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')
    );

    return csvLines.join('\n');
  }

  getWorkspaceSnapshot() {
    const sessions = Array.from(this.db.sessions.values()).map((session) => this.#toSessionDTO(session));
    return {
      generatedAt: new Date().toISOString(),
      sessions,
      inventory: {
        items: this.db.inventory.listarItens(),
        summary: {
          totalItens: this.db.inventory.listarItens().length,
          itensCriticos: this.db.inventory.listarItensAbaixoDoMinimo().length,
          valorTotalEstoque: this.db.inventory.valorTotalEstoque(),
        },
      },
      dashboard: this.getDashboard(),
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
