# Guía de Despliegue en cPanel — Servi Proce (`serviproce.com.mx`)

Esta guía describe el procedimiento paso a paso para desplegar y actualizar la plataforma **Servi Proce** en el entorno de producción de **cPanel** (CloudLinux 8 / Servidor Olimpo / Phusion Passenger).

---

## 1. Parámetros del Entorno cPanel
- **Usuario cPanel:** `ser59proc97`
- **Directorio Principal:** `/home/ser59proc97`
- **Dominio Principal:** `serviproce.com.mx` (con certificado SSL Activo)
- **IP Compartida:** `104.249.62.46`

---

## 2. Configuración en cPanel -> "Setup Node.js App"

1. Inicia sesión en **cPanel** y busca la herramienta **Setup Node.js App** (o *Software -> Configurar aplicación Node.js*).
2. Haz clic en **Create Application** (o edita la aplicación existente) con los siguientes campos:
   - **Node.js version:** Selecciona `20.x` o `22.x` (recomendado `20.18+` o `22.x`).
   - **Application mode:** `Production`.
   - **Application root:** `serviproce` (o el nombre de la carpeta dentro de `/home/ser59proc97/` donde clonaste o subiste el repositorio).
   - **Application URL:** `serviproce.com.mx` (o déjalo en el dominio principal).
   - **Application startup file:** `server.js` (o `app.js`).
3. Haz clic en **Save** o **Create**.

---

## 3. Preparación de Archivos y Dependencias

Puedes subir los archivos mediante **Git Version Control** en cPanel o mediante **Terminal / SSH**:

### Vía Git (Recomendado):
```bash
# Entrar a la carpeta raíz de la aplicación en cPanel:
cd /home/ser59proc97/serviproce

# Si es la primera vez:
git clone -b ServiProce_BETA_2 https://github.com/pechdelgado9-byte/Servi-Proce.git .

# Si ya está clonado, simplemente actualizar:
git fetch origin ServiProce_BETA_2
git checkout ServiProce_BETA_2
git pull origin ServiProce_BETA_2
```

### Copiar Variables de Entorno:
```bash
# Crear el archivo .env a partir del ejemplo proporcionado:
cp .env.example .env
```
Edita `.env` con la contraseña real del correo SMTP `customerservice@serviproce.com.mx` y las claves deseadas.

### Instalación y Compilación:
En la terminal de cPanel (o activando el entorno virtual que muestra la pantalla de Setup Node.js App, ej. `source /home/ser59proc97/nodevenv/serviproce/20/bin/activate`):
```bash
# 1. Instalar dependencias
npm install

# 2. Compilar el Frontend Next.js para producción
npm run build
```

---

## 4. Reinicio de la Aplicación

Para aplicar cambios o reiniciar la aplicación:
- **Desde la interfaz web de cPanel:** Entra a *Setup Node.js App* y haz clic en el botón naranja **Restart** de la aplicación.
- **Desde la Terminal:** Ejecuta:
  ```bash
  mkdir -p tmp
  touch tmp/restart.txt
  ```
  Phusion Passenger detecta automáticamente la modificación de `tmp/restart.txt` y reinicia los procesos en caliente sin caída de servicio.

---

## 5. Arquitectura Interna del Archivo `server.js`
- **Manejador HTTP Unificado:** Escucha inmediatamente en el puerto/socket asignado por Phusion Passenger (`process.env.PORT`), evitando errores de timeout 503 en CloudLinux.
- **Bypass de Monkey-Patch:** Inicializa el Backend Headless en un puerto local interno (`127.0.0.1:1337` o puerto dinámico libre en caso de colisión) eludiendo la intercepción de Passenger.
- **Enrutamiento Transparente:**
  - Todas las peticiones `/api/*` y `/uploads/*` son atendidas directamente en memoria por el Backend Headless.
  - El resto de páginas y rutas son procesadas por Next.js SSR.
- **Seguridad CORS y Server Actions:** Autoriza peticiones de `serviproce.com.mx` y `www.serviproce.com.mx` garantizando el correcto funcionamiento del CMS y cotizador.

