const { ensureBoolean, ensureNumber, ensureString } = require('../../core/validators');
const { SessaoCinema } = require('../../domain/sessoes');
const { NotFoundError, ValidationError } = require('../core/errors');
const { sanitizeValue } = require('../utils/sanitize');

class SessionService {
  constructor({ db }) {
    this.db = db;
  }

  listSessions() {
    return Array.from(this.db.sessions.values()).map((session) => ({
      ...session.resumoFinanceiro(),
      sala: session.sala,
      horario: session.horario,
      precoBase: session.precoBase,
      dublado: session.dublado,
      vendas: session.listarVendas(),
    }));
  }

  createSession(payload) {
    const input = sanitizeValue(payload || {});
    const id = ensureString(input.id || `SESS-${Date.now()}`, {
      label: 'ID da sessao',
      maxLength: 60,
    });

    if (this.db.sessions.has(id)) {
      throw new ValidationError('Ja existe uma sessao com este ID');
    }

    const session = new SessaoCinema({
      id,
      filme: ensureString(input.filme, { label: 'Filme', maxLength: 120 }),
      sala: ensureString(input.sala || 'Sala 1', { label: 'Sala', maxLength: 80 }),
      horario: ensureString(input.horario || '19:00', { label: 'Horario', maxLength: 5 }),
      capacidade: ensureNumber(input.capacidade, { label: 'Capacidade', min: 1, integer: true }),
      precoBase: ensureNumber(input.precoBase, { label: 'Preco base', min: 0 }),
      dublado: ensureBoolean(input.dublado),
    });

    this.db.sessions.set(session.id, session);
    return this.getSessionById(session.id);
  }

  getSessionById(sessionId) {
    const session = this.#findSessionOrThrow(sessionId);
    return {
      ...session.resumoFinanceiro(),
      sala: session.sala,
      horario: session.horario,
      precoBase: session.precoBase,
      dublado: session.dublado,
      vendas: session.listarVendas(),
    };
  }

  sellTickets(sessionId, payload, soldByEmail = null) {
    const session = this.#findSessionOrThrow(sessionId);
    const input = sanitizeValue(payload || {});

    const sale = session.venderIngressos({
      tipo: ensureString(input.tipo || 'inteira', { label: 'Tipo', maxLength: 20 }).toLowerCase(),
      quantidade: ensureNumber(input.quantidade || 1, { label: 'Quantidade', min: 1, integer: true }),
      numeroPessoas: ensureNumber(input.numeroPessoas || 1, {
        label: 'Numero de pessoas',
        min: 1,
        integer: true,
      }),
      opcoesPreco: input.opcoesPreco && typeof input.opcoesPreco === 'object' ? input.opcoesPreco : {},
    });

    if (soldByEmail) {
      const seller = this.db.users.get(String(soldByEmail).toLowerCase());
      if (seller && typeof seller.realizarVenda === 'function') {
        seller.realizarVenda(sale.total);
      }
    }

    this.db.addAuditEvent({
      type: 'SESSION_SALE_CREATED',
      sessionId: session.id,
      saleId: sale.id,
      soldByEmail,
      total: sale.total,
    });

    return {
      venda: sale,
      resumoSessao: session.resumoFinanceiro(),
    };
  }

  cancelSale(sessionId, saleId) {
    const session = this.#findSessionOrThrow(sessionId);
    const removed = session.cancelarVenda(ensureString(saleId, { label: 'ID da venda', maxLength: 40 }));

    if (!removed) {
      throw new NotFoundError('Venda nao encontrada para esta sessao');
    }

    this.db.addAuditEvent({
      type: 'SESSION_SALE_CANCELLED',
      sessionId: session.id,
      saleId,
    });

    return {
      success: true,
      resumoSessao: session.resumoFinanceiro(),
    };
  }

  #findSessionOrThrow(sessionId) {
    const id = ensureString(sessionId, { label: 'ID da sessao', maxLength: 60 });
    const session = this.db.sessions.get(id);
    if (!session) {
      throw new NotFoundError('Sessao nao encontrada');
    }
    return session;
  }
}

module.exports = { SessionService };
