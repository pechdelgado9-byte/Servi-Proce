/**
 * ============================================================================
 * ARCHIVO DE INICIALIZACIÓN UNIFICADO PARA CPANEL ("Setup Node.js App")
 * Proyecto: Servi Proce — Ecosistema Web Logístico y Aduanal
 * ============================================================================
 * En cPanel -> Setup Node.js App:
 *   - Application root:         (carpeta raíz del repositorio)
 *   - Application startup file: server.js   (o app.js)
 *   - Node.js version:          20.x o 22.x
 *
 * Este archivo levanta automáticamente en un solo proceso:
 *   1. El Backend Headless REST + Motor SQLite embebido (backend/database/serviproce.sqlite)
 *   2. El servidor de producción de Next.js (/frontend) en el puerto o socket asignado por cPanel (process.env.PORT)
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'node:url';
import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendDir = path.join(__dirname, 'frontend');
const backendDir = path.join(__dirname, 'backend');

// 1. Cargar variables de entorno desde /.env y /backend/.env si existen
function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eqIdx = line.indexOf('=');
    if (eqIdx === -1) continue;
    const key = line.slice(0, eqIdx).trim();
    let val = line.slice(eqIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = val;
    }
  }
}

loadEnvFile(path.join(__dirname, '.env'));
loadEnvFile(path.join(backendDir, '.env'));

// 2. Configurar variables por defecto para entorno cPanel / Phusion Passenger
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
const cpanelPortOrSocket = process.env.PORT || 3000;
const internalBackendPort = Number(process.env.BACKEND_PORT || 1337);

process.env.BACKEND_PORT = String(internalBackendPort);
process.env.BACKEND_INTERNAL_URL = process.env.BACKEND_INTERNAL_URL || `http://127.0.0.1:${internalBackendPort}`;
process.env.NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || `http://127.0.0.1:${internalBackendPort}/api`;
process.env.TRUST_PROXY = process.env.TRUST_PROXY || 'true';

let isReady = false;
let startupError = null;
let nextRequestHandler = null;
let backendInstance = null;

// 3. Crear y enlazar inmediatamente el servidor HTTP principal al puerto/socket de cPanel
//    (Evita timeouts de Phusion Passenger mientras compila o inicializa en el primer arranque)
const mainServer = http.createServer(async (req, res) => {
  try {
    if (startupError) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(`Error al inicializar la aplicación en cPanel:\n${startupError.stack || startupError.message}`);
      return;
    }

    const reqUrl = req.url || '/';

    // Enrutar llamadas a /api/backend/* y /uploads/* directamente al Backend Headless en memoria
    if (backendInstance) {
      if (reqUrl.startsWith('/api/backend/')) {
        req.url = '/api/' + reqUrl.slice('/api/backend/'.length);
        return await backendInstance.handleRequest(req, res);
      }
      if (reqUrl.startsWith('/uploads/')) {
        return await backendInstance.handleRequest(req, res);
      }
    }

    if (!isReady || !nextRequestHandler) {
      res.writeHead(503, {
        'Content-Type': 'text/html; charset=utf-8',
        'Retry-After': '3',
      });
      res.end(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta http-equiv="refresh" content="3" />
  <title>Iniciando Servi Proce...</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #0b1120; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
    .box { max-width: 460px; padding: 2rem; border-radius: 12px; background: rgba(30,41,59,0.8); border: 1px solid rgba(255,255,255,0.12); }
  </style>
</head>
<body>
  <div class="box">
    <h2>Iniciando plataforma Servi Proce...</h2>
    <p>El servidor está terminando de preparar los módulos. Esta página se recargará automáticamente en unos segundos.</p>
  </div>
</body>
</html>`);
      return;
    }

    const parsedUrl = parse(reqUrl, true);
    await nextRequestHandler(req, res, parsedUrl);
  } catch (err) {
    console.error('[cPanel Server] Error procesando petición:', err);
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Internal Server Error');
    }
  }
});

mainServer.listen(cpanelPortOrSocket, () => {
  console.log('===================================================================');
  console.log(`[cPanel Server] Escuchando peticiones públicas en: ${cpanelPortOrSocket}`);
  console.log('===================================================================');
});

// 4. Inicialización asíncrona del Backend Headless (SQLite) + Frontend Next.js
async function bootstrapEcosystem() {
  try {
    const isWin = process.platform === 'win32';
    const npmCmd = isWin ? 'npm.cmd' : 'npm';

    // Verificar dependencias en /backend y /frontend
    if (!fs.existsSync(path.join(backendDir, 'node_modules'))) {
      console.log('[cPanel Setup] Instalando dependencias de /backend...');
      execSync(`${npmCmd} install --omit=dev`, { cwd: backendDir, stdio: 'inherit' });
    }

    if (!fs.existsSync(path.join(frontendDir, 'node_modules'))) {
      console.log('[cPanel Setup] Instalando dependencias de /frontend...');
      execSync(`${npmCmd} install`, { cwd: frontendDir, stdio: 'inherit' });
    }

    // 4.1 Iniciar el Backend Headless + Base de datos SQLite local
    const { BackendServer } = await import('./backend/src/server.js');
    backendInstance = new BackendServer();

    try {
      await backendInstance.listen(internalBackendPort);
    } catch (listenErr) {
      if (listenErr && listenErr.code === 'EADDRINUSE') {
        console.log(`[cPanel Setup] El puerto interno ${internalBackendPort} ya está activo o en uso; inicializando instancia en memoria.`);
        await backendInstance.initialize();
      } else {
        throw listenErr;
      }
    }

    // 4.2 Verificar si existe el build de producción de Next.js (.next/BUILD_ID)
    const buildIdPath = path.join(frontendDir, '.next', 'BUILD_ID');
    if (!fs.existsSync(buildIdPath)) {
      console.log('[cPanel Setup] No se encontró compilación previa (.next/BUILD_ID). Ejecutando "npm run build" en /frontend...');
      execSync(`${npmCmd} run build`, {
        cwd: frontendDir,
        stdio: 'inherit',
        env: { ...process.env },
      });
    }

    // 4.3 Cargar e inicializar Next.js desde /frontend
    const requireFromFrontend = createRequire(path.join(frontendDir, 'package.json'));
    const next = requireFromFrontend('next');
    const nextApp = next({
      dev: false,
      dir: frontendDir,
    });

    await nextApp.prepare();
    nextRequestHandler = nextApp.getRequestHandler();
    isReady = true;

    console.log('===================================================================');
    console.log('[cPanel Server] Ecosistema Servi Proce (Frontend + Backend SQLite) 100% LISTO');
    console.log('===================================================================');
  } catch (err) {
    console.error('[cPanel Server] Error crítico durante la inicialización:', err);
    startupError = err;
  }
}

bootstrapEcosystem();
