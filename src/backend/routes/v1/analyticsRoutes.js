const express = require('express');
const { ok } = require('../../core/http');
const { requireRoles } = require('../../middlewares/auth');

const analyticsRoutes = express.Router();

analyticsRoutes.get('/dashboard', requireRoles(['gerente']), (req, res) => {
  const container = req.app.locals.container;
  ok(res, {
    message: 'Indicadores operacionais',
    data: container.analyticsService.getDashboard(),
  });
});

analyticsRoutes.get('/system', requireRoles(['gerente']), (req, res) => {
  const container = req.app.locals.container;
  ok(res, {
    message: 'Metricas do sistema',
    data: container.analyticsService.getSystemMetrics(),
  });
});

module.exports = { analyticsRoutes };
