const { ForbiddenError, UnauthorizedError } = require('../core/errors');

function extractBearerToken(authHeader) {
  const rawHeader = String(authHeader || '');
  if (!rawHeader.startsWith('Bearer ')) {
    return null;
  }
  return rawHeader.slice(7).trim();
}

function authenticate(req, res, next) {
  const token = extractBearerToken(req.headers.authorization);
  if (!token) {
    return next(new UnauthorizedError('Token de acesso nao informado'));
  }

  const container = req.app.locals.container;
  try {
    const session = container.authService.verifyAccessToken(token);
    req.auth = {
      token,
      session,
      user: session.user,
    };
    return next();
  } catch (error) {
    return next(new UnauthorizedError(error.message || 'Token invalido'));
  }
}

function requireRoles(roles = []) {
  const accepted = Array.isArray(roles) ? roles : [roles];
  return (req, res, next) => {
    const cargo = req.auth?.user?.cargo;
    if (!accepted.includes(cargo)) {
      return next(new ForbiddenError('Perfil sem permissao para esta operacao'));
    }
    return next();
  };
}

function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.auth?.user?.temPermissao(permission)) {
      return next(new ForbiddenError(`Permissao requerida: ${permission}`));
    }
    return next();
  };
}

function requireCsrf(req, res, next) {
  const mutatingMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
  if (!mutatingMethods.has(req.method)) return next();

  const csrfHeader = String(req.headers['x-csrf-token'] || '').trim();
  const jti = req.auth?.session?.tokenPayload?.jti;
  if (!csrfHeader || !jti) {
    return next(new ForbiddenError('CSRF token ausente'));
  }

  const container = req.app.locals.container;
  const valid = container.authService.validateCsrfToken(jti, csrfHeader);
  if (!valid) {
    return next(new ForbiddenError('CSRF token invalido'));
  }

  return next();
}

module.exports = {
  authenticate,
  requireCsrf,
  requirePermission,
  requireRoles,
};
