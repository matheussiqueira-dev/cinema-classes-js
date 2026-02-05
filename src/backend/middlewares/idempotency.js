const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function idempotencyMiddleware(req, res, next) {
  if (!MUTATING_METHODS.has(req.method)) {
    return next();
  }

  const idempotencyKey = String(req.headers['idempotency-key'] || '').trim();
  if (!idempotencyKey) {
    return next();
  }

  const container = req.app.locals.container;
  const ttlMs = container.env.idempotencyTtlMs;
  const now = Date.now();
  const records = container.db.idempotencyRecords;

  for (const [key, entry] of records.entries()) {
    if (entry.expiresAt <= now) {
      records.delete(key);
    }
  }

  const identity = req.auth?.user?.email || 'anonymous';
  const normalizedKey = `${identity}:${req.method}:${req.originalUrl}:${idempotencyKey}`;
  const existing = records.get(normalizedKey);

  if (existing) {
    res.setHeader('X-Idempotent-Replay', 'true');
    return res.status(existing.statusCode).json(existing.responseBody);
  }

  const originalJson = res.json.bind(res);
  res.json = (body) => {
    if (res.statusCode < 500) {
      records.set(normalizedKey, {
        statusCode: res.statusCode,
        responseBody: body,
        expiresAt: now + ttlMs,
      });
    }
    return originalJson(body);
  };

  return next();
}

module.exports = { idempotencyMiddleware };
