const express = require('express');
const { authenticate, requireCsrf } = require('../../middlewares/auth');
const { analyticsRoutes } = require('./analyticsRoutes');
const { authRoutes } = require('./authRoutes');
const { docsRoutes } = require('./docsRoutes');
const { healthRoutes } = require('./healthRoutes');
const { inventoryRoutes } = require('./inventoryRoutes');
const { payrollRoutes } = require('./payrollRoutes');
const { pricingRoutes } = require('./pricingRoutes');
const { sessionsRoutes } = require('./sessionsRoutes');
const { usersRoutes } = require('./usersRoutes');

const v1Routes = express.Router();

v1Routes.use('/health', healthRoutes);
v1Routes.use('/docs', docsRoutes);
v1Routes.use('/auth', authRoutes);
v1Routes.use('/pricing', pricingRoutes);

v1Routes.use(authenticate);
v1Routes.use(requireCsrf);

v1Routes.use('/users', usersRoutes);
v1Routes.use('/sessions', sessionsRoutes);
v1Routes.use('/inventory', inventoryRoutes);
v1Routes.use('/payroll', payrollRoutes);
v1Routes.use('/analytics', analyticsRoutes);

module.exports = { v1Routes };
