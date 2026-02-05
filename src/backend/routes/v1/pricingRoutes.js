const express = require('express');
const { ok } = require('../../core/http');

const pricingRoutes = express.Router();

pricingRoutes.post('/calculate', (req, res, next) => {
  try {
    const container = req.app.locals.container;
    const result = container.pricingService.calculate(req.body || {});
    return ok(res, {
      message: 'Calculo de preco realizado',
      data: result,
    });
  } catch (error) {
    return next(error);
  }
});

pricingRoutes.post('/suggest', (req, res, next) => {
  try {
    const container = req.app.locals.container;
    const result = container.pricingService.suggest(req.body || {});
    return ok(res, {
      message: 'Preco sugerido calculado',
      data: result,
    });
  } catch (error) {
    return next(error);
  }
});

pricingRoutes.post('/grid', (req, res, next) => {
  try {
    const container = req.app.locals.container;
    const result = container.pricingService.buildGrid(req.body || {});
    return ok(res, {
      message: 'Grade de precos gerada',
      data: result,
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = { pricingRoutes };
