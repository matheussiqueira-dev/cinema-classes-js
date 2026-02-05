const { createApp } = require('./app');
const logger = require('./core/logger');

const app = createApp();
const { env } = app.locals.container;

app.listen(env.port, () => {
  logger.info('server.started', {
    port: env.port,
    apiPrefix: env.apiPrefix,
    nodeEnv: env.nodeEnv,
  });
});
