import crypto from 'node:crypto';
import { envConfig } from '../config/EnvironmentConfig.js';
import { dbManager, DatabaseManager } from '../database/DatabaseManager.js';

/**
 * Servicio Orientado a Objetos de Autenticación y Seguridad (RF-07, RNF-03 y RNF-04 del ERS)
 *  - RF-07: Autenticación mediante JWT firmado con JWT_SECRET y verificación de Rol (Admin / SuperAdmin).
 *  - RNF-03: Bloqueo temporal por 15 minutos tras detectar 5 intentos de inicio de sesión fallidos consecutivos.
 *  - RNF-04: Cierre automático de sesión e invalidación del token tras 15 minutos continuos de inactividad.
 */
export class AuthService {
  static MAX_FAILED_ATTEMPTS = 5;                  // RNF-03: 5 intentos fallidos consecutivos
  static LOCKOUT_DURATION_MS = 15 * 60 * 1000;     // RNF-03: 15 minutos de bloqueo
  static INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000;   // RNF-04: 15 minutos continuos de inactividad

  static #base64UrlEncode(objOrBuf) {
    const buf = Buffer.isBuffer(objOrBuf)
      ? objOrBuf
      : Buffer.from(typeof objOrBuf === 'string' ? objOrBuf : JSON.stringify(objOrBuf), 'utf8');
    return buf.toString('base64url');
  }

  static #signJwt(payload) {
    const header = { alg: 'HS256', typ: 'JWT' };
    const encodedHeader = this.#base64UrlEncode(header);
    const encodedPayload = this.#base64UrlEncode(payload);
    const data = `${encodedHeader}.${encodedPayload}`;
    const signature = crypto
      .createHmac('sha256', envConfig.jwtSecret)
      .update(data)
      .digest('base64url');
    return `${data}.${signature}`;
  }

  static #verifyJwtSignature(token) {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [encodedHeader, encodedPayload, sig] = parts;
    const data = `${encodedHeader}.${encodedPayload}`;
    const expectedSig = crypto
      .createHmac('sha256', envConfig.jwtSecret)
      .update(data)
      .digest('base64url');

    const sigBuf = Buffer.from(sig);
    const expBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }

    try {
      return JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
    } catch {
      return null;
    }
  }

  /**
   * Verifica si la IP o cuenta se encuentra bloqueada por fuerza bruta (RNF-03)
   */
  static async checkLockout(ipKey) {
    const rows = await dbManager.query(
      'SELECT failed_count, locked_until FROM login_attempts WHERE ip_or_user = $1',
      [ipKey]
    );
    if (rows.length === 0) return { locked: false, remainingMs: 0 };

    const { locked_until } = rows[0];
    const lockedUntilNum = Number(locked_until);
    const now = Date.now();

    if (lockedUntilNum > now) {
      return { locked: true, remainingMs: lockedUntilNum - now };
    }
    return { locked: false, remainingMs: 0 };
  }

  /**
   * Registra un intento fallido de login y bloquea por 15 min al llegar a 5 consecutivos (RNF-03)
   */
  static async recordFailedAttempt(ipKey) {
    const now = Date.now();
    const rows = await dbManager.query(
      'SELECT failed_count, locked_until FROM login_attempts WHERE ip_or_user = $1',
      [ipKey]
    );

    if (rows.length === 0) {
      await dbManager.query(
        'INSERT INTO login_attempts (ip_or_user, failed_count, locked_until, last_attempt_at) VALUES ($1, $2, $3, $4)',
        [ipKey, 1, 0, now]
      );
      return { failedCount: 1, locked: false };
    }

    const prevLockedUntil = Number(rows[0].locked_until);
    const prevCount = prevLockedUntil > 0 && prevLockedUntil <= now ? 0 : Number(rows[0].failed_count);
    const nextCount = prevCount + 1;
    const lockedUntil = nextCount >= this.MAX_FAILED_ATTEMPTS ? now + this.LOCKOUT_DURATION_MS : 0;

    await dbManager.query(
      'UPDATE login_attempts SET failed_count = $1, locked_until = $2, last_attempt_at = $3 WHERE ip_or_user = $4',
      [nextCount, lockedUntil, now, ipKey]
    );

    return { failedCount: nextCount, locked: lockedUntil > now, lockedUntil };
  }

  static async clearFailedAttempts(ipKey) {
    await dbManager.query('DELETE FROM login_attempts WHERE ip_or_user = $1', [ipKey]);
  }

  /**
   * Autentica al administrador (RNF-03, RNF-05) y crea una sesión con seguimiento de inactividad (RNF-04)
   */
  static async login({ username, password, ip = 'local' }) {
    const ipKey = `ip:${ip}`;
    const lockout = await this.checkLockout(ipKey);
    if (lockout.locked) {
      return {
        ok: false,
        status: 429,
        error: 'ACCOUNT_LOCKED_BRUTE_FORCE',
        remainingSeconds: Math.ceil(lockout.remainingMs / 1000),
      };
    }

    const targetUsername = username ? String(username).trim() : envConfig.adminUsername;
    const rows = await dbManager.query(
      'SELECT id, username, password_hash, role FROM admins WHERE username = $1',
      [targetUsername]
    );

    const inputHash = DatabaseManager.hashPassword(String(password ?? ''));
    const admin = rows[0];

    const valid = admin && crypto.timingSafeEqual(
      Buffer.from(admin.password_hash, 'hex'),
      Buffer.from(inputHash, 'hex')
    );

    if (!valid) {
      const attempt = await this.recordFailedAttempt(ipKey);
      return {
        ok: false,
        status: attempt.locked ? 429 : 401,
        error: attempt.locked ? 'ACCOUNT_LOCKED_BRUTE_FORCE' : 'INVALID_CREDENTIALS',
        failedCount: attempt.failedCount,
      };
    }

    await this.clearFailedAttempts(ipKey);

    const now = Date.now();
    const tokenId = crypto.randomUUID();
    await dbManager.query(
      'INSERT INTO sessions (token_id, username, role, created_at, last_activity_at) VALUES ($1, $2, $3, $4, $5)',
      [tokenId, admin.username, admin.role, now, now]
    );

    const jwt = this.#signJwt({
      jti: tokenId,
      sub: admin.username,
      role: admin.role,
      iat: Math.floor(now / 1000),
    });

    return {
      ok: true,
      token: jwt,
      user: { username: admin.username, role: admin.role },
      inactivityTimeoutSeconds: this.INACTIVITY_TIMEOUT_MS / 1000,
    };
  }

  /**
   * RF-07 Precondición 1 y RNF-04:
   * Verifica la validez del JWT, confirma que Rol pertenezca a {Admin, SuperAdmin},
   * e invalida automáticamente la sesión si han transcurrido > 15 minutos de inactividad.
   */
  static async verifySession(token) {
    const payload = this.#verifyJwtSignature(token);
    if (!payload || !payload.jti) return { valid: false, reason: 'INVALID_TOKEN' };

    if (!['Admin', 'SuperAdmin'].includes(payload.role)) {
      return { valid: false, reason: 'INSUFFICIENT_ROLE' };
    }

    const rows = await dbManager.query(
      'SELECT token_id, username, role, last_activity_at FROM sessions WHERE token_id = $1',
      [payload.jti]
    );

    if (rows.length === 0) {
      return { valid: false, reason: 'SESSION_NOT_FOUND' };
    }

    const session = rows[0];
    const now = Date.now();
    const inactiveMs = now - Number(session.last_activity_at);

    // RNF-04: Cierre automático de sesión tras 15 minutos continuos de inactividad
    if (inactiveMs > this.INACTIVITY_TIMEOUT_MS) {
      await dbManager.query('DELETE FROM sessions WHERE token_id = $1', [payload.jti]);
      return { valid: false, reason: 'SESSION_EXPIRED_INACTIVITY' };
    }

    // Renovar timestamp de actividad
    await dbManager.query(
      'UPDATE sessions SET last_activity_at = $1 WHERE token_id = $2',
      [now, payload.jti]
    );

    return {
      valid: true,
      user: {
        username: session.username,
        role: session.role,
        tokenId: session.token_id,
      },
    };
  }

  static async logout(token) {
    const payload = this.#verifyJwtSignature(token);
    if (payload?.jti) {
      await dbManager.query('DELETE FROM sessions WHERE token_id = $1', [payload.jti]);
    }
  }
}
