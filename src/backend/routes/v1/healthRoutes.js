const express = require('express');
const { ok } = require('../../core/http');

const healthRoutes = express.Router();

healthRoutes.get('/live', (req, res) => {
  ok(res, {
    message: 'Service is alive',
    data: {
      status: 'up',
      now: new Date().toISOString(),
    },
  });
});

healthRoutes.get('/ready', (req, res) => {
  const container = req.app.locals.container;
  const metrics = container.analyticsService.getSystemMetrics();

  ok(res, {
    message: 'Service is ready',
    data: {
      status: 'ready',
      startedAt: container.startedAt,
      metrics,
    },
  });
});

module.exports = { healthRoutes };
