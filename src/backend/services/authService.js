const { randomBytes, randomUUID } = require('node:crypto');
const jwt = require('jsonwebtoken');
const { UnauthorizedError, ValidationError } = require('../core/errors');
const { ensureEmail, ensureString } = require('../../core/validators');

class AuthService {
  constructor({ db, env }) {
    this.db = db;
    this.env = env;
    this.csrfTokensByJti = new Map();
  }

  login({ email, password, ip, userAgent }) {
    const normalizedEmail = ensureEmail(email, { label: 'Email' });
    const normalizedPassword = ensureString(password, { label: 'Senha', maxLength: 200 });
    const user = this.db.users.get(normalizedEmail);

    if (!user) {
      throw new UnauthorizedError('Credenciais invalidas');
    }

    const allowed = user.realizarLogin(normalizedEmail, normalizedPassword);
    if (!allowed) {
      throw new UnauthorizedError('Credenciais invalidas ou usuario bloqueado');
    }

    const jti = randomUUID();
    const csrfToken = randomBytes(24).toString('hex');

    const tokenPayload = {
      sub: user.email,
      role: user.cargo,
      permissions: user.listarPermissoes(),
      jti,
      ip: String(ip || ''),
      userAgent: String(userAgent || ''),
    };

    const accessToken = jwt.sign(tokenPayload, this.env.jwtSecret, {
      issuer: this.env.jwtIssuer,
      audience: this.env.jwtAudience,
      expiresIn: this.env.jwtTtl,
    });

    this.csrfTokensByJti.set(jti, {
      token: csrfToken,
      issuedAt: Date.now(),
    });

    this.db.addAuditEvent({
      type: 'AUTH_LOGIN_SUCCESS',
      email: user.email,
      role: user.cargo,
      ip: String(ip || ''),
      userAgent: String(userAgent || ''),
    });

    return {
      accessToken,
      csrfToken,
      tokenType: 'Bearer',
      expiresIn: this.env.jwtTtl,
      user: this.toPublicUser(user),
    };
  }

  verifyAccessToken(accessToken) {
    try {
      const tokenPayload = jwt.verify(accessToken, this.env.jwtSecret, {
        issuer: this.env.jwtIssuer,
        audience: this.env.jwtAudience,
      });

      const user = this.db.users.get(tokenPayload.sub);
      if (!user) {
        throw new UnauthorizedError('Usuario nao encontrado para este token');
      }

      return {
        tokenPayload,
        user,
      };
    } catch (error) {
      if (error instanceof UnauthorizedError) throw error;
      throw new UnauthorizedError('Token invalido ou expirado');
    }
  }

  validateCsrfToken(jti, csrfToken) {
    const stored = this.csrfTokensByJti.get(jti);
    if (!stored) return false;
    return stored.token === csrfToken;
  }

  getUserByEmail(email) {
    return this.db.users.get(email) || null;
  }

  listUsers() {
    return Array.from(this.db.users.values()).map((user) => this.toPublicUser(user));
  }

  toPublicUser(user) {
    if (!user) {
      throw new ValidationError('Usuario invalido');
    }

    return {
      nome: user.nome,
      email: user.email,
      cargo: user.cargo,
      isAdmin: user.isAdmin(),
      permissoes: user.listarPermissoes(),
      seguranca: user.consultarSeguranca(),
    };
  }
}

module.exports = { AuthService };
