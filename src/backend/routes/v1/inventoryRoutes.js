const express = require('express');
const { created, ok } = require('../../core/http');
const { requireRoles } = require('../../middlewares/auth');

const inventoryRoutes = express.Router();

inventoryRoutes.get('/items', (req, res) => {
  const container = req.app.locals.container;
  ok(res, {
    message: 'Itens do estoque',
    data: {
      itens: container.inventoryService.listItems(),
      resumo: container.inventoryService.getSummary(),
    },
  });
});

inventoryRoutes.get('/items/critical', (req, res) => {
  const container = req.app.locals.container;
  ok(res, {
    message: 'Itens abaixo do minimo',
    data: container.inventoryService.listCriticalItems(),
  });
});

inventoryRoutes.post('/items', requireRoles(['gerente', 'atendente']), (req, res, next) => {
  try {
    const container = req.app.locals.container;
    const item = container.inventoryService.createItem(req.body || {});
    return created(res, {
      message: 'Item de estoque cadastrado',
      data: item,
    });
  } catch (error) {
    return next(error);
  }
});

inventoryRoutes.patch('/items/:sku/movement', requireRoles(['gerente', 'atendente']), (req, res, next) => {
  try {
    const container = req.app.locals.container;
    const movement = container.inventoryService.applyMovement({
      sku: req.params.sku,
      tipo: req.body?.tipo,
      quantidade: req.body?.quantidade,
    });

    return ok(res, {
      message: 'Movimento de estoque aplicado',
      data: movement,
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = { inventoryRoutes };
