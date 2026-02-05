const { getEnv } = require('./config/env');
const { InMemoryDatabase } = require('./repositories/inMemoryDatabase');
const { AnalyticsService } = require('./services/analyticsService');
const { AuthService } = require('./services/authService');
const { InventoryService } = require('./services/inventoryService');
const { PayrollService } = require('./services/payrollService');
const { PricingService } = require('./services/pricingService');
const { SessionService } = require('./services/sessionService');

function createContainer() {
  const env = getEnv();
  const db = new InMemoryDatabase();
  db.bootstrap();

  const authService = new AuthService({ db, env });
  const sessionService = new SessionService({ db });
  const inventoryService = new InventoryService({ db });
  const pricingService = new PricingService();
  const payrollService = new PayrollService();
  const analyticsService = new AnalyticsService({ db });

  return {
    env,
    db,
    authService,
    sessionService,
    inventoryService,
    pricingService,
    payrollService,
    analyticsService,
    startedAt: new Date().toISOString(),
  };
}

module.exports = { createContainer };
