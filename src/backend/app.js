const express = require('express');
const { createContainer } = require('./createContainer');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');
const { requestContext } = require('./middlewares/requestContext');
const { createSecurityMiddleware } = require('./middlewares/security');
const { v1Routes } = require('./routes/v1');

function createApp() {
  const app = express();
  const container = createContainer();
  const security = createSecurityMiddleware(container.env);

  app.locals.container = container;
  app.disable('x-powered-by');

  security.forEach((middleware) => app.use(middleware));
  app.use(requestContext);
  app.use(container.env.apiPrefix, v1Routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
