import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..', '..');

/**
 * Clase EnvironmentConfig (Sección 2.1.9.2 del ERS)
 * Carga variables de entorno desde .env sin exponer credenciales en el código fuente.
 */
export class EnvironmentConfig {
  constructor() {
    this.#loadDotEnv();
  }

  #loadDotEnv() {
    const envPath = path.join(ROOT_DIR, '.env');
    if (!fs.existsSync(envPath)) return;

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

  get rootDir() {
    return ROOT_DIR;
  }

  get port() {
    return Number(process.env.PORT || 1337);
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

  get recaptchaSecretKey() {
    return (process.env.RECAPTCHA_SECRET_KEY || '').trim();
  }

  get smtp() {
    return {
      host: (process.env.SMTP_HOST || '').trim(),
      port: Number(process.env.SMTP_PORT || 587),
      user: (process.env.SMTP_USER || '').trim(),
      pass: (process.env.SMTP_PASS || '').trim(),
      from: process.env.SMTP_FROM || 'Sitio Web Servi Proce <noreply@serviproce.com.mx>',
      salesEmail: process.env.SALES_EMAIL || 'customerservice@serviproce.com.mx,jorgebarrios@serviproce.com.mx',
    };
  }
}

export const envConfig = new EnvironmentConfig();
