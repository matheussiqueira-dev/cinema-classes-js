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

analyticsRoutes.get('/audit-events', requireRoles(['gerente']), (req, res) => {
  const container = req.app.locals.container;
  const data = container.analyticsService.getAuditEvents({
    type: req.query.type,
    limit: req.query.limit,
    page: req.query.page,
  });

  ok(res, {
    message: 'Eventos de auditoria',
    data,
  });
});

analyticsRoutes.get('/report', requireRoles(['gerente']), (req, res) => {
  const container = req.app.locals.container;
  const report = container.analyticsService.getOperationalReport();
  const format = String(req.query.format || 'json').toLowerCase();

  if (format === 'csv') {
    const csv = container.analyticsService.toOperationalReportCsv(report);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="operational-report.csv"');
    return res.status(200).send(csv);
  }

  return ok(res, {
    message: 'Relatorio operacional',
    data: report,
  });
});

analyticsRoutes.get('/workspace-snapshot', requireRoles(['gerente', 'vendedor', 'atendente']), (req, res) => {
  const container = req.app.locals.container;
  ok(res, {
    message: 'Snapshot operacional para sincronizacao',
    data: container.analyticsService.getWorkspaceSnapshot(),
  });
});

module.exports = { analyticsRoutes };
