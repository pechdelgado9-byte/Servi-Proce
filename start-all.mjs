import { spawn, execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isWin = process.platform === 'win32';
const withTunnel = process.argv.includes('--tunnel');
const onlyTunnel = process.argv.includes('--only-tunnel');
const prodMode = process.argv.includes('--prod');

function resolveCloudflaredPath() {
  const candidates = [
    'C:\\Program Files (x86)\\cloudflared\\cloudflared.exe',
    'C:\\Program Files\\cloudflared\\cloudflared.exe',
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return `"${c}"`;
  }
  return 'cloudflared';
}

function runProcess(label, colorCode, cwd, command, args, onLine) {
  const proc = spawn(command, args, {
    cwd,
    shell: isWin,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env },
  });

  const prefix = `\x1b[${colorCode}m[${label}]\x1b[0m`;

  const handleOutput = (data, isErr = false) => {
    for (const line of data.toString().split(/\r?\n/)) {
      if (!line.trim()) continue;
      if (onLine) onLine(line);
      if (isErr) {
        console.error(`${prefix} ${line}`);
      } else {
        console.log(`${prefix} ${line}`);
      }
    }
  };

  proc.stdout.on('data', (d) => handleOutput(d, false));
  proc.stderr.on('data', (d) => handleOutput(d, false));

  return proc;
}

const processes = [];

if (!onlyTunnel) {
  console.log('===================================================================');
  console.log('  SERVI PROCE — Orquestador Full-Stack Headless (Frontend + Backend)');
  console.log('===================================================================');

  try {
    execSync('docker compose up -d', { cwd: __dirname, stdio: 'ignore' });
    console.log('[DOCKER] Contenedor PostgreSQL (serviproce_postgres) verificado/iniciado.');
  } catch {
    console.log('[DOCKER] Docker Desktop no activo -> Usando motor SQLite embebido (RNF-05).');
  }

  if (prodMode) {
    console.log('[FRONTEND] Compilando versión optimizada de producción (Sin WebSockets HMR)...');
    execSync(isWin ? 'npm.cmd run build' : 'npm run build', {
      cwd: path.join(__dirname, 'frontend'),
      stdio: 'inherit',
    });
  }

  processes.push(
    runProcess(
      'BACKEND :1337',
      '36',
      path.join(__dirname, 'backend'),
      'node',
      ['--watch', '--watch-path=src', 'src/server.js']
    )
  );

  processes.push(
    runProcess(
      'FRONTEND :3000',
      '32',
      path.join(__dirname, 'frontend'),
      isWin ? 'npm.cmd' : 'npm',
      ['run', prodMode ? 'start' : 'dev']
    )
  );
}

if (withTunnel || onlyTunnel) {
  const cfBin = resolveCloudflaredPath();
  console.log('[TUNNEL] Iniciando túnel HTTPS público con Cloudflare...');
  processes.push(
    runProcess(
      'CLOUDFLARE TUNNEL',
      '35',
      __dirname,
      cfBin,
      ['tunnel', '--url', 'http://localhost:3000'],
      (line) => {
        const match = line.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/i);
        if (match) {
          console.log('\n\x1b[42m\x1b[30m =================================================================== \x1b[0m');
          console.log(`\x1b[1;32m  🌍 ENLACE PÚBLICO HTTPS LISTO PARA COMPARTIR:\x1b[0m`);
          console.log(`\x1b[1;33m     ${match[0]}/es\x1b[0m`);
          console.log(`\x1b[1;36m     Panel Admin: ${match[0]}/es/admin\x1b[0m`);
          console.log('\x1b[42m\x1b[30m =================================================================== \x1b[0m\n');
        }
      }
    )
  );
}

const shutdown = () => {
  for (const p of processes) {
    try {
      p.kill();
    } catch {}
  }
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
