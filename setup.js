import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('====================================================');
console.log('SERVI PROCE — INSTALADOR Y VERIFICADOR PARA CPANEL');
console.log('Directorio:', __dirname);
console.log('====================================================');

// 1. Limpiar archivo corrupto node_modules si no es un directorio
const nmPath = path.join(__dirname, 'node_modules');
if (fs.existsSync(nmPath)) {
  const stat = fs.statSync(nmPath);
  if (!stat.isDirectory()) {
    console.log('[Setup] Eliminando archivo plano corrupto node_modules...');
    fs.unlinkSync(nmPath);
  }
}

// 2. Ejecutar npm install con límites CloudLinux LVE
console.log('[Setup] Instalando paquetes de producción...');
try {
  execSync('npm install --omit=dev --no-audit --no-fund', {
    cwd: __dirname,
    stdio: 'inherit',
    env: {
      ...process.env,
      UV_THREADPOOL_SIZE: '2',
      RAYON_NUM_THREADS: '1',
      NODE_OPTIONS: '--max-old-space-size=768',
    },
  });
  console.log('====================================================');
  console.log('¡TODAS LAS DEPENDENCIAS SE INSTALARON CON ÉXITO!');
  console.log('Ya puedes reiniciar la aplicación en cPanel.');
  console.log('====================================================');
} catch (err) {
  console.error('[Setup] Error durante npm install:', err.message);
  process.exit(1);
}

