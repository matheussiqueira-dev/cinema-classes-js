const DEFAULTS = {
  NODE_ENV: 'development',
  PORT: 3333,
  API_PREFIX: '/api/v1',
  JWT_SECRET: 'dev-change-this-secret',
  JWT_TTL: '2h',
  JWT_ISSUER: 'cinema-ops-backend',
  JWT_AUDIENCE: 'cinema-ops-clients',
  CORS_ORIGIN: '*',
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000,
  RATE_LIMIT_MAX: 200,
  JSON_LIMIT: '120kb',
};

function readNumber(name, fallback) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) ? value : fallback;
}

function readString(name, fallback) {
  const value = String(process.env[name] || '').trim();
  return value.length > 0 ? value : fallback;
}

function getEnv() {
  return {
    nodeEnv: readString('NODE_ENV', DEFAULTS.NODE_ENV),
    port: readNumber('PORT', DEFAULTS.PORT),
    apiPrefix: readString('API_PREFIX', DEFAULTS.API_PREFIX),
    jwtSecret: readString('JWT_SECRET', DEFAULTS.JWT_SECRET),
    jwtTtl: readString('JWT_TTL', DEFAULTS.JWT_TTL),
    jwtIssuer: readString('JWT_ISSUER', DEFAULTS.JWT_ISSUER),
    jwtAudience: readString('JWT_AUDIENCE', DEFAULTS.JWT_AUDIENCE),
    corsOrigin: readString('CORS_ORIGIN', DEFAULTS.CORS_ORIGIN),
    rateLimitWindowMs: readNumber('RATE_LIMIT_WINDOW_MS', DEFAULTS.RATE_LIMIT_WINDOW_MS),
    rateLimitMax: readNumber('RATE_LIMIT_MAX', DEFAULTS.RATE_LIMIT_MAX),
    jsonLimit: readString('JSON_LIMIT', DEFAULTS.JSON_LIMIT),
  };
}

module.exports = { getEnv };
