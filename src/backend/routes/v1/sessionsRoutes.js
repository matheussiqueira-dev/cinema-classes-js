const express = require('express');
const { created, ok } = require('../../core/http');
const { requirePermission, requireRoles } = require('../../middlewares/auth');

const sessionsRoutes = express.Router();

sessionsRoutes.get('/', (req, res) => {
  const container = req.app.locals.container;
  ok(res, {
    message: 'Sessoes cadastradas',
    data: container.sessionService.listSessions(),
  });
});

sessionsRoutes.post(
  '/',
  requireRoles(['gerente']),
  (req, res, next) => {
    try {
      const container = req.app.locals.container;
      const session = container.sessionService.createSession(req.body || {});
      return created(res, {
        message: 'Sessao criada com sucesso',
        data: session,
      });
    } catch (error) {
      return next(error);
    }
  }
);

sessionsRoutes.get('/:sessionId', (req, res, next) => {
  try {
    const container = req.app.locals.container;
    const session = container.sessionService.getSessionById(req.params.sessionId);
    return ok(res, {
      message: 'Detalhes da sessao',
      data: session,
    });
  } catch (error) {
    return next(error);
  }
});

sessionsRoutes.post(
  '/:sessionId/sales',
  requirePermission('vendas:realizar'),
  (req, res, next) => {
    try {
      const container = req.app.locals.container;
      const result = container.sessionService.sellTickets(
        req.params.sessionId,
        req.body || {},
        req.auth.user.email
      );
      return created(res, {
        message: 'Venda registrada com sucesso',
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }
);

sessionsRoutes.delete(
  '/:sessionId/sales/:saleId',
  requireRoles(['gerente']),
  (req, res, next) => {
    try {
      const container = req.app.locals.container;
      const result = container.sessionService.cancelSale(req.params.sessionId, req.params.saleId);
      return ok(res, {
        message: 'Venda cancelada com sucesso',
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }
);

module.exports = { sessionsRoutes };
