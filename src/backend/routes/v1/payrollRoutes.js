const express = require('express');
const { ok } = require('../../core/http');
const { requireRoles } = require('../../middlewares/auth');

const payrollRoutes = express.Router();

payrollRoutes.post('/employee', requireRoles(['gerente']), (req, res, next) => {
  try {
    const container = req.app.locals.container;
    const result = container.payrollService.calculateEmployee(req.body || {});
    return ok(res, {
      message: 'Folha individual calculada',
      data: result,
    });
  } catch (error) {
    return next(error);
  }
});

payrollRoutes.post('/team', requireRoles(['gerente']), (req, res, next) => {
  try {
    const container = req.app.locals.container;
    const result = container.payrollService.calculateTeam(req.body || {});
    return ok(res, {
      message: 'Folha da equipe calculada',
      data: result,
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = { payrollRoutes };
