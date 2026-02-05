const { AppError } = require('../core/errors');
const logger = require('../core/logger');

function notFoundHandler(req, res, next) {
  const error = new AppError('Rota nao encontrada', {
    statusCode: 404,
    code: 'ROUTE_NOT_FOUND',
  });
  next(error);
}

function errorHandler(error, req, res, next) {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    const badRequest = new AppError('JSON invalido no corpo da requisicao', {
      statusCode: 400,
      code: 'INVALID_JSON',
    });
    return res.status(badRequest.statusCode).json({
      success: false,
      error: {
        code: badRequest.code,
        message: badRequest.message,
        details: null,
      },
      requestId: req.requestId || null,
      timestamp: new Date().toISOString(),
    });
  }

  const normalized = error instanceof AppError
    ? error
    : new AppError(error.message || 'Erro interno do servidor', {
        statusCode: 500,
        code: 'INTERNAL_ERROR',
      });

  logger.error('request.failed', {
    requestId: req.requestId || null,
    message: normalized.message,
    code: normalized.code,
    statusCode: normalized.statusCode,
    stack: process.env.NODE_ENV === 'production' ? undefined : normalized.stack,
  });

  res.status(normalized.statusCode).json({
    success: false,
    error: {
      code: normalized.code,
      message: normalized.message,
      details: normalized.details || null,
    },
    requestId: req.requestId || null,
    timestamp: new Date().toISOString(),
  });
  return undefined;
}

module.exports = {
  errorHandler,
  notFoundHandler,
};
