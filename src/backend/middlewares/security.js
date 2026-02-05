const compression = require('compression');
const cors = require('cors');
const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

function parseCorsOrigins(corsOrigin) {
  if (!corsOrigin || corsOrigin === '*') {
    return true;
  }

  const origins = corsOrigin
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  return origins;
}

function createSecurityMiddleware(env) {
  const limiter = rateLimit({
    windowMs: env.rateLimitWindowMs,
    limit: env.rateLimitMax,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: {
        code: 'RATE_LIMIT',
        message: 'Muitas requisicoes. Tente novamente em instantes.',
      },
    },
  });

  const corsOptions = {
    origin: parseCorsOrigins(env.corsOrigin),
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  };

  return [
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
    cors(corsOptions),
    express.json({ limit: env.jsonLimit }),
    compression(),
    limiter,
  ];
}

module.exports = { createSecurityMiddleware };
