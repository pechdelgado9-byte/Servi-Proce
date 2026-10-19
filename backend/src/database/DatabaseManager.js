import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { envConfig } from '../config/EnvironmentConfig.js';
import { INITIAL_PROMOTIONS, INITIAL_BLOG_POSTS, INITIAL_AVISOS } from './SeedData.js';

/**
 * Clase DatabaseManager (Sección 2.1.9.1, 3.1.3 y RNF-05 del ERS)
 * Implementa el patrón Adapter/Repository Orientado a Objetos:
 *  - Modo 1 (Producción / Laptop con Docker): PostgreSQL mediante consultas parametrizadas ($1, $2...)
 *  - Modo 2 (Desarrollo local sin virtualización): Motor SQLite embebido (node:sqlite) con Prepared Statements (?)
 * Todas las consultas aíslan los parámetros de la sentencia SQL para prevenir Inyección SQL (RNF-05).
 */
export class DatabaseManager {
  #mode = 'uninitialized'; // 'postgres' | 'sqlite' | 'json_sql'
  #pgPool = null;
  #sqliteDb = null;
  #jsonTables = null;
  #jsonFile = null;
  #dbDir;

  constructor() {
    this.#dbDir = path.join(envConfig.rootDir, 'database');
  }

  get mode() {
    return this.#mode;
  }

  async initialize() {
    await fs.mkdir(this.#dbDir, { recursive: true });

    // 1. Intentar conexión a PostgreSQL si DATABASE_URL está configurado
    if (envConfig.databaseUrl) {
      try {
        const pgModule = await import('pg');
        const Pool = pgModule.default?.Pool || pgModule.Pool;
        this.#pgPool = new Pool({ connectionString: envConfig.databaseUrl });
        await this.#pgPool.query('SELECT 1');
        this.#mode = 'postgres';
        console.log('[DatabaseManager] Conectado a PostgreSQL (Consultas Parametrizadas RNF-05 activas).');
        await this.#createPostgresSchema();
        await this.#seedIfEmpty();
        return;
      } catch (err) {
        console.warn('[DatabaseManager] PostgreSQL no disponible, cambiando a motor SQL embebido local:', err.message);
      }
    }

    // 2. Motor SQLite embebido nativo de Node.js (Prepared Statements RNF-05)
    try {
      const { DatabaseSync } = await import('node:sqlite');
      const sqliteFile = path.join(this.#dbDir, 'serviproce.sqlite');
      this.#sqliteDb = new DatabaseSync(sqliteFile);
      this.#mode = 'sqlite';
      console.log(`[DatabaseManager] Motor SQL embebido activo en ${sqliteFile} (Prepared Statements RNF-05 activos).`);
      this.#createSqliteSchema();
      await this.#seedIfEmpty();
      return;
    } catch {
      // 3. Respaldo compatible con Node 18/20 si node:sqlite no está habilitado y Docker está apagado
      this.#jsonFile = path.join(this.#dbDir, 'serviproce_store.json');
      this.#mode = 'json_sql';
      await this.#initJsonStore();
      console.log(`[DatabaseManager] Motor parametrizado local activo en ${this.#jsonFile} (RNF-05 activo).`);
      await this.#seedIfEmpty();
    }
  }

  async #initJsonStore() {
    try {
      const raw = await fs.readFile(this.#jsonFile, 'utf8');
      this.#jsonTables = JSON.parse(raw);
    } catch {
      this.#jsonTables = {
        admins: [],
        login_attempts: [],
        sessions: [],
        promotions: [],
        blog_posts: [],
        avisos: [],
        quotation_logs: [],
        newsletter_subscribers: [],
      };
      await this.#saveJsonStore();
    }
  }

  async #saveJsonStore() {
    const tmp = `${this.#jsonFile}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(this.#jsonTables, null, 2), 'utf8');
    await fs.rename(tmp, this.#jsonFile);
  }

  /**
   * RNF-05: Ejecución exclusiva mediante Sentencias Preparadas (Prepared Statements)
   * Convierte placeholders $1, $2... a ? cuando corre sobre SQLite embebido.
   */
  async query(sql, params = []) {
    // Verificación defensiva de tipos de parámetros (RNF-05)
    const safeParams = params.map((p) => {
      if (p === undefined) return null;
      if (typeof p === 'boolean') return this.#mode === 'postgres' ? p : (p ? 1 : 0);
      return p;
    });

    if (this.#mode === 'postgres') {
      const result = await this.#pgPool.query(sql, safeParams);
      return result.rows;
    }

    if (this.#mode === 'sqlite') {
      const sqliteSql = sql.replace(/\$\d+/g, '?');
      const stmt = this.#sqliteDb.prepare(sqliteSql);
      const trimmed = sqliteSql.trim().toUpperCase();
      if (trimmed.startsWith('SELECT') || trimmed.includes('RETURNING')) {
        return stmt.all(...safeParams);
      }
      stmt.run(...safeParams);
      return [];
    }

    return this.#executeJsonParameterizedQuery(sql, safeParams);
  }

  async #executeJsonParameterizedQuery(sql, params) {
    const norm = sql.replace(/\s+/g, ' ').trim();
    const upper = norm.toUpperCase();

    if (upper.startsWith('SELECT')) {
      const tableMatch = norm.match(/FROM\s+([a-z_]+)/i);
      const table = tableMatch ? tableMatch[1] : '';
      let rows = [...(this.#jsonTables[table] || [])];

      const whereMatch = norm.match(/WHERE\s+([a-z_]+)\s*=\s*\$1/i);
      if (whereMatch) {
        const col = whereMatch[1];
        rows = rows.filter((r) => String(r[col]) === String(params[0]));
      }
      if (upper.includes('LIMIT 1')) {
        rows = rows.slice(0, 1);
      }
      return rows;
    }

    if (upper.startsWith('INSERT INTO')) {
      const match = norm.match(/INSERT INTO\s+([a-z_]+)\s*\(([^)]+)\)/i);
      if (match) {
        const table = match[1];
        const cols = match[2].split(',').map((c) => c.trim());
        const row = {};
        cols.forEach((c, idx) => {
          row[c] = params[idx] ?? null;
        });
        this.#jsonTables[table] = this.#jsonTables[table] || [];
        this.#jsonTables[table].push(row);
        await this.#saveJsonStore();
      }
      return [];
    }

    if (upper.startsWith('UPDATE')) {
      const tableMatch = norm.match(/UPDATE\s+([a-z_]+)\s+SET\s+(.+)\s+WHERE\s+([a-z_]+)\s*=\s*\$(\d+)/i);
      if (tableMatch) {
        const table = tableMatch[1];
        const setPart = tableMatch[2];
        const whereCol = tableMatch[3];
        const whereIdx = Number(tableMatch[4]) - 1;
        const assignments = setPart.split(',').map((s) => s.trim());

        for (const r of this.#jsonTables[table] || []) {
          if (String(r[whereCol]) === String(params[whereIdx])) {
            for (const assign of assignments) {
              const [col, paramRef] = assign.split('=').map((x) => x.trim());
              const pIdx = Number(paramRef.replace('$', '')) - 1;
              r[col] = params[pIdx];
            }
          }
        }
        await this.#saveJsonStore();
      }
      return [];
    }

    if (upper.startsWith('DELETE FROM')) {
      const tableMatch = norm.match(/DELETE FROM\s+([a-z_]+)/i);
      const table = tableMatch ? tableMatch[1] : '';
      const whereEq = norm.match(/WHERE\s+([a-z_]+)\s*=\s*\$1$/i);
      if (whereEq) {
        const col = whereEq[1];
        this.#jsonTables[table] = (this.#jsonTables[table] || []).filter(
          (r) => String(r[col]) !== String(params[0])
        );
      } else if (table === 'avisos' && params.length === 3) {
        const [, todayIso, oneYearAgoIso] = params;
        this.#jsonTables.avisos = (this.#jsonTables.avisos || []).filter(
          (a) => !((a.expires_at !== '' && a.expires_at < todayIso) || a.published_at <= oneYearAgoIso)
        );
      }
      await this.#saveJsonStore();
      return [];
    }

    return [];
  }

  async #createPostgresSchema() {
    await this.#pgPool.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'SuperAdmin',
        created_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS login_attempts (
        ip_or_user TEXT PRIMARY KEY,
        failed_count INTEGER NOT NULL DEFAULT 0,
        locked_until BIGINT NOT NULL DEFAULT 0,
        last_attempt_at BIGINT NOT NULL DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS sessions (
        token_id TEXT PRIMARY KEY,
        username TEXT NOT NULL,
        role TEXT NOT NULL,
        created_at BIGINT NOT NULL,
        last_activity_at BIGINT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS promotions (
        id TEXT PRIMARY KEY,
        title_es TEXT NOT NULL,
        title_en TEXT NOT NULL,
        description_es TEXT NOT NULL,
        description_en TEXT NOT NULL,
        image_url TEXT NOT NULL,
        published_at TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Publicado'
      );
      CREATE TABLE IF NOT EXISTS blog_posts (
        id TEXT PRIMARY KEY,
        slug TEXT UNIQUE NOT NULL,
        title_es TEXT NOT NULL,
        title_en TEXT NOT NULL,
        excerpt_es TEXT NOT NULL,
        excerpt_en TEXT NOT NULL,
        content_es_json TEXT NOT NULL,
        content_en_json TEXT NOT NULL,
        category_es TEXT NOT NULL,
        category_en TEXT NOT NULL,
        read_time_es TEXT NOT NULL,
        read_time_en TEXT NOT NULL,
        author TEXT NOT NULL,
        image_url TEXT NOT NULL,
        seo_title_es TEXT NOT NULL,
        seo_title_en TEXT NOT NULL,
        seo_desc_es TEXT NOT NULL,
        seo_desc_en TEXT NOT NULL,
        og_image_url TEXT NOT NULL,
        published_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS avisos (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        title_es TEXT NOT NULL,
        title_en TEXT NOT NULL,
        body_es TEXT NOT NULL,
        body_en TEXT NOT NULL,
        source_url TEXT NOT NULL,
        published_at TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        pinned INTEGER NOT NULL DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS quotation_logs (
        id TEXT PRIMARY KEY,
        reference TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        company TEXT NOT NULL,
        service TEXT NOT NULL,
        operation TEXT NOT NULL,
        mode TEXT NOT NULL,
        country TEXT NOT NULL,
        industry TEXT NOT NULL,
        description TEXT NOT NULL,
        hazmat INTEGER NOT NULL DEFAULT 0,
        files_json TEXT NOT NULL,
        recaptcha_score REAL NOT NULL DEFAULT 1.0,
        smtp_status TEXT NOT NULL DEFAULT 'pending',
        created_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        locale TEXT NOT NULL DEFAULT 'es',
        subscribed_at TEXT NOT NULL
      );
    `);
  }

  #createSqliteSchema() {
    this.#sqliteDb.exec(`
      CREATE TABLE IF NOT EXISTS admins (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'SuperAdmin',
        created_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS login_attempts (
        ip_or_user TEXT PRIMARY KEY,
        failed_count INTEGER NOT NULL DEFAULT 0,
        locked_until INTEGER NOT NULL DEFAULT 0,
        last_attempt_at INTEGER NOT NULL DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS sessions (
        token_id TEXT PRIMARY KEY,
        username TEXT NOT NULL,
        role TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        last_activity_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS promotions (
        id TEXT PRIMARY KEY,
        title_es TEXT NOT NULL,
        title_en TEXT NOT NULL,
        description_es TEXT NOT NULL,
        description_en TEXT NOT NULL,
        image_url TEXT NOT NULL,
        published_at TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Publicado'
      );
      CREATE TABLE IF NOT EXISTS blog_posts (
        id TEXT PRIMARY KEY,
        slug TEXT UNIQUE NOT NULL,
        title_es TEXT NOT NULL,
        title_en TEXT NOT NULL,
        excerpt_es TEXT NOT NULL,
        excerpt_en TEXT NOT NULL,
        content_es_json TEXT NOT NULL,
        content_en_json TEXT NOT NULL,
        category_es TEXT NOT NULL,
        category_en TEXT NOT NULL,
        read_time_es TEXT NOT NULL,
        read_time_en TEXT NOT NULL,
        author TEXT NOT NULL,
        image_url TEXT NOT NULL,
        seo_title_es TEXT NOT NULL,
        seo_title_en TEXT NOT NULL,
        seo_desc_es TEXT NOT NULL,
        seo_desc_en TEXT NOT NULL,
        og_image_url TEXT NOT NULL,
        published_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS avisos (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        title_es TEXT NOT NULL,
        title_en TEXT NOT NULL,
        body_es TEXT NOT NULL,
        body_en TEXT NOT NULL,
        source_url TEXT NOT NULL,
        published_at TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        pinned INTEGER NOT NULL DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS quotation_logs (
        id TEXT PRIMARY KEY,
        reference TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        company TEXT NOT NULL,
        service TEXT NOT NULL,
        operation TEXT NOT NULL,
        mode TEXT NOT NULL,
        country TEXT NOT NULL,
        industry TEXT NOT NULL,
        description TEXT NOT NULL,
        hazmat INTEGER NOT NULL DEFAULT 0,
        files_json TEXT NOT NULL,
        recaptcha_score REAL NOT NULL DEFAULT 1.0,
        smtp_status TEXT NOT NULL DEFAULT 'pending',
        created_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        locale TEXT NOT NULL DEFAULT 'es',
        subscribed_at TEXT NOT NULL
      );
    `);
  }

  static hashPassword(password) {
    return crypto.createHash('sha256').update(`serviproce_salt_2026:${password}`).digest('hex');
  }

  async #seedIfEmpty() {
    // 1. Crear SuperAdmin obligatorio (Sección 2.1.9.1)
    const admins = await this.query('SELECT id FROM admins WHERE username = $1', [envConfig.adminUsername]);
    const passwordHash = DatabaseManager.hashPassword(envConfig.adminPassword);
    if (admins.length === 0) {
      await this.query(
        'INSERT INTO admins (id, username, password_hash, role, created_at) VALUES ($1, $2, $3, $4, $5)',
        ['admin-root', envConfig.adminUsername, passwordHash, 'SuperAdmin', new Date().toISOString()]
      );
    } else {
      await this.query(
        'UPDATE admins SET password_hash = $1 WHERE username = $2',
        [passwordHash, envConfig.adminUsername]
      );
    }

    // 2. Sembrar Promociones iniciales (RF-02)
    const promos = await this.query('SELECT id FROM promotions LIMIT 1');
    if (promos.length === 0) {
      for (const p of INITIAL_PROMOTIONS) {
        await this.query(
          `INSERT INTO promotions (id, title_es, title_en, description_es, description_en, image_url, published_at, expires_at, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [p.id, p.title_es, p.title_en, p.description_es, p.description_en, p.image_url, p.published_at, p.expires_at, p.status]
        );
      }
    }

    // 3. Sembrar Artículos del Blog iniciales (RF-07, RF-10)
    const posts = await this.query('SELECT id FROM blog_posts LIMIT 1');
    if (posts.length === 0) {
      for (const b of INITIAL_BLOG_POSTS) {
        await this.query(
          `INSERT INTO blog_posts (
            id, slug, title_es, title_en, excerpt_es, excerpt_en,
            content_es_json, content_en_json, category_es, category_en,
            read_time_es, read_time_en, author, image_url,
            seo_title_es, seo_title_en, seo_desc_es, seo_desc_en, og_image_url, published_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)`,
          [
            b.id, b.slug, b.title_es, b.title_en, b.excerpt_es, b.excerpt_en,
            JSON.stringify(b.content_es), JSON.stringify(b.content_en),
            b.category_es, b.category_en, b.read_time_es, b.read_time_en,
            b.author, b.image_url, b.seo_title_es, b.seo_title_en,
            b.seo_desc_es, b.seo_desc_en, b.og_image_url, b.published_at,
          ]
        );
      }
    }

    // 4. Sembrar Avisos iniciales
    const avisos = await this.query('SELECT id FROM avisos LIMIT 1');
    if (avisos.length === 0) {
      for (const a of INITIAL_AVISOS) {
        await this.query(
          `INSERT INTO avisos (id, type, title_es, title_en, body_es, body_en, source_url, published_at, expires_at, pinned)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [a.id, a.type, a.title_es, a.title_en, a.body_es, a.body_en, a.sourceUrl, a.publishedAt, a.expiresAt, a.pinned ? 1 : 0]
        );
      }
    }
  }
}

export const dbManager = new DatabaseManager();
