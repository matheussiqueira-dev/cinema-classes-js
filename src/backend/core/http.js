function ok(res, { data = null, message = 'OK', meta = null, statusCode = 200 } = {}) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    meta,
    requestId: res.getHeader('X-Request-Id') || null,
    timestamp: new Date().toISOString(),
  });
}

function created(res, { data = null, message = 'Criado', meta = null } = {}) {
  return ok(res, { data, message, meta, statusCode: 201 });
}

module.exports = {
  created,
  ok,
};
