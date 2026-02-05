const express = require('express');
const { ok } = require('../../core/http');
const { sanitizeValue } = require('../../utils/sanitize');

const authRoutes = express.Router();

authRoutes.post('/login', (req, res, next) => {
  try {
    const input = sanitizeValue(req.body || {});
    const container = req.app.locals.container;

    const result = container.authService.login({
      email: input.email,
      password: input.password,
      ip: req.ip,
      userAgent: req.headers['user-agent'] || '',
    });

    return ok(res, {
      message: 'Login realizado com sucesso',
      data: result,
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = { authRoutes };
