import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..', '..');
const PROJECT_ROOT_DIR = path.resolve(ROOT_DIR, '..');

/**
 * Clase EnvironmentConfig (Sección 2.1.9.2 del ERS)
 * Carga variables de entorno desde .env (tanto en /backend/.env como en /.env raíz para cPanel)
 * sin exponer credenciales en el código fuente.
 */
export class EnvironmentConfig {
  #writableBaseDir = null;

  constructor() {
    this.#loadDotEnv();
  }

  #loadDotEnv() {
    const candidateFiles = [
      path.join(ROOT_DIR, '.env'),
      path.join(PROJECT_ROOT_DIR, '.env'),
    ];

    for (const envPath of candidateFiles) {
      if (!fs.existsSync(envPath)) continue;

      const content = fs.readFileSync(envPath, 'utf8');
      for (const rawLine of content.split(/\r?\n/)) {
        const line = rawLine.trim();
        if (!line || line.startsWith('#')) continue;
        const eqIndex = line.indexOf('=');
        if (eqIndex === -1) continue;
        const key = line.slice(0, eqIndex).trim();
        let val = line.slice(eqIndex + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (process.env[key] === undefined) {
          process.env[key] = val;
        }
      }
    }
  }

  get rootDir() {
    return ROOT_DIR;
  }

  /**
   * Devuelve el directorio base escribible para datos y subidas (usa ROOT_DIR o fallback temporal si corre en sandbox restringido)
   */
  get storageRootDir() {
    if (this.#writableBaseDir) return this.#writableBaseDir;
    try {
      const testDir = path.join(ROOT_DIR, 'database');
      fs.mkdirSync(testDir, { recursive: true });
      this.#writableBaseDir = ROOT_DIR;
    } catch {
      const fallback = path.join(os.tmpdir(), 'serviproce-backend-runtime');
      fs.mkdirSync(fallback, { recursive: true });
      this.#writableBaseDir = fallback;
    }
    return this.#writableBaseDir;
  }

  get port() {
    return Number(process.env.BACKEND_PORT || process.env.PORT || 1337);
  }

  get nodeEnv() {
    return process.env.NODE_ENV || 'development';
  }

  get databaseUrl() {
    return (process.env.DATABASE_URL || '').trim();
  }

  get jwtSecret() {
    return process.env.JWT_SECRET || 'sp_default_dev_jwt_secret_change_in_prod';
  }

  get appKeys() {
    return (process.env.APP_KEYS || 'default_key').split(',').map((k) => k.trim());
  }

  get adminUsername() {
    return process.env.ADMIN_USERNAME || 'admin@serviproce.com.mx';
  }

  get adminPassword() {
    return process.env.ADMIN_PASSWORD || 'ServiProce2026!';
  }

  get frontendUrl() {
    return process.env.FRONTEND_URL || 'http://localhost:3000';
  }

  get frontendWebhookUrl() {
    return process.env.FRONTEND_WEBHOOK_URL || `${this.frontendUrl}/api/revalidate`;
  }

  get webhookSecret() {
    return process.env.WEBHOOK_SECRET || 'sp_webhook_ssg_secret_2026';
  }

  get trustProxy() {
    return process.env.TRUST_PROXY === 'true' || process.env.TRUST_PROXY === '1';
  }

  get recaptchaSecretKey() {
    return (process.env.RECAPTCHA_SECRET_KEY || '').trim();
  }

  get smtp() {
    const rawSales = (
      process.env.SALES_EMAIL ||
      process.env.OPERATIVE_EMAIL ||
      process.env.DIRECTORS_EMAIL ||
      'customerservice@serviproce.com.mx, jorgebarrios@serviproce.com.mx'
    ).trim();

    const directorsEmails = rawSales
      .split(',')
      .map((e) => e.trim())
      .filter((e) => e.length > 0 && e.includes('@'));

    const user = (process.env.SMTP_USER || '').trim();
    const configuredFrom = (process.env.SMTP_FROM || '').trim();
    const from = configuredFrom || (user ? `Servi Proce <${user}>` : 'Sitio Web Servi Proce <customerservice@serviproce.com.mx>');

    return {
      host: (process.env.SMTP_HOST || '').trim(),
      port: Number(process.env.SMTP_PORT || 587),
      user,
      pass: (process.env.SMTP_PASS || '').trim(),
      from,
      salesEmail: directorsEmails.join(', '),
      directorsEmails: directorsEmails.length > 0 ? directorsEmails : ['customerservice@serviproce.com.mx', 'jorgebarrios@serviproce.com.mx'],
      secure: Number(process.env.SMTP_PORT || 587) === 465,
    };
  }
}

export const envConfig = new EnvironmentConfig();
