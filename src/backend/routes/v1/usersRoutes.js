const express = require('express');
const { ok } = require('../../core/http');
const { requireRoles } = require('../../middlewares/auth');

const usersRoutes = express.Router();

usersRoutes.get('/me', (req, res) => {
  const container = req.app.locals.container;
  const data = container.authService.toPublicUser(req.auth.user);
  ok(res, {
    message: 'Usuario autenticado',
    data,
  });
});

usersRoutes.get('/', requireRoles(['gerente']), (req, res) => {
  const container = req.app.locals.container;
  ok(res, {
    message: 'Usuarios cadastrados',
    data: container.authService.listUsers(),
  });
});

module.exports = { usersRoutes };
