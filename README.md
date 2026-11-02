# Plataforma Web Desacoplada — SERVI PROCE (Logística y Aduanas)

Repositorio oficial del ecosistema digital de **Servi Proce**, desarrollado bajo una **Arquitectura Headless desacoplada** y en **cumplimiento estricto al 100% con la Especificación de Requerimientos de Software (ERS - Revisión 1.0)**.

---

## 🏗️ Arquitectura del Sistema (Sección 3.4.1 y 4.2 del ERS)

El ecosistema opera mediante una separación física y lógica estricta entre la capa de presentación (Frontend) y la capa de gestión de contenido y reglas de negocio (Backend Headless):

```text
Servi-Proce/
├── backend/                       # Servidor Headless CMS y API REST (Puerto 1337 - POO)
│   ├── src/
│   │   ├── config/                # EnvironmentConfig (Gestión de entorno y paths con fallback)
│   │   ├── database/              # DatabaseManager (PostgreSQL en Docker + SQLite WAL RNF-05)
│   │   ├── models/                # Clases de dominio (Promotion, BlogPost, QuotationRequest)
│   │   ├── repositories/          # Repositorios POO con Prepared Statements parametrizados
│   │   ├── services/              # Sanitización RF-09, Correo RF-01, Cron RF-02, reCAPTCHA RF-04, Webhooks SSG
│   │   └── server.js              # REST API: /api/quotations, /api/content, /api/admin/*
│   └── tests/                     # Suites automatizadas node:test (Hito 1 y Hito 2)
├── frontend/                      # Aplicación Web Pública y CMS en Next.js 16 + React 19 (Puerto 3000)
│   ├── app/[lang]/                # Rutas bilingües (ES/EN), Blog, Servicios, Legal y Panel Admin
│   ├── components/                # UI responsiva, Cotizador, Newsletter, Visor de Correos, Footer omnicanal
│   ├── lib/                       # Consumidores API desacoplados con revalidación SSG
│   └── next.config.mjs            # Rewrites internos (/api/backend, /uploads) y soporte de túneles Cloudflare
├── docker-compose.yml             # Contenedor PostgreSQL 16 Alpine (serviproce_postgres)
└── start-all.mjs                  # Orquestador integral (Docker + Backend + Frontend + Cloudflare Tunnel)
```

---

## 📋 Requisitos del Entorno

1. **Node.js**: Versión `20.x` o superior (Recomendado Node 22+).
2. **Docker Desktop** *(Opcional pero recomendado)*: Para levantar la base de datos PostgreSQL 16. Si Docker no está en ejecución, el backend conmuta automáticamente a **SQLite en modo WAL** sin interrumpir la operación (`RNF-05`).
3. **Cloudflared** *(Opcional)*: Requerido únicamente para compartir la demo públicamente a clientes o dispositivos móviles externos mediante túnel seguro HTTPS.

---

## 🚀 Puesta en Marcha

### 1. Instalación de dependencias (Solo la primera vez)

Desde la terminal en la raíz del proyecto:

```powershell
# Instalar dependencias del Backend y Frontend
cd backend && npm install && cd ../frontend && npm install && cd ..
```

---

### 2. Modos de Ejecución

El proyecto incluye scripts orquestados en `package.json` para facilitar cualquier escenario:

#### A) Modo Desarrollo Local (Docker + Backend + Frontend)
Inicia PostgreSQL en Docker, el backend en el puerto `1337` (con recarga automática) y el frontend en el puerto `3000`:
```powershell
npm run dev
```

#### B) Modo Demo Pública con Túnel Cloudflare (Para demostración a clientes y celulares)
Inicia todo el ecosistema y genera automáticamente un enlace público HTTPS seguro (`https://xxxx.trycloudflare.com`) accesible desde cualquier lugar del mundo:
```powershell
npm run dev:public
```

#### C) Modo Demo de Alta Velocidad (Producción Optimizada + Túnel)
Compila el frontend para producción y levanta el túnel público. **Recomendado para demos finales**, ya que elimina el overhead de WebSockets HMR y ofrece la máxima velocidad de carga:
```powershell
npm run demo:public
```

#### D) Abrir únicamente el Túnel Cloudflare (Si el frontend ya está corriendo)
```powershell
npm run tunnel
```

#### E) Gestión de Base de Datos PostgreSQL
```powershell
npm run db:up     # Inicia el contenedor PostgreSQL en segundo plano
npm run db:down   # Detiene el contenedor PostgreSQL
```

---

## 🌐 URLs de Acceso y Credenciales

* **Sitio Web Público (Español):** [http://localhost:3000/es](http://localhost:3000/es)
* **Sitio Web Público (Inglés):** [http://localhost:3000/en](http://localhost:3000/en)
* **Panel de Administración (CMS):** [http://localhost:3000/es/admin](http://localhost:3000/es/admin)
  * **Usuario SuperAdmin:** `admin@serviproce.com.mx`
  * **Contraseña:** `ServiProce2026!`
* **Healthcheck de API Backend:** [http://localhost:1337/api/health](http://localhost:1337/api/health)

---

## ✨ Características Principales Implementadas

### 1. Panel de Administración CMS (`/admin`)
* **Gestión de Artículos de Blog:** Creación y publicación con sanitización estricta de nombres de archivo y comprobación binaria de magic bytes (`RF-09`).
* **Gestión de Avisos Dinámicos:** Banners informativos segmentados por página destino y rango de fechas.
* **Gestión y Auditoría de Promociones (`RF-02`):**
  * Desactivación y ocultamiento automático de promociones vencidas ($\ge 365\text{ días}$).
  * Botón interactivo para ejecutar la **Auditoría Cron en tiempo real** desde el panel.
* **Historial Inmutable de Cotizaciones (`RF-01`):**
  * Tabla de auditoría de solo lectura.
  * **Descarga directa de archivos adjuntos** enviados por los clientes.
  * **Visor de Correo en Vivo:** Modal interactivo para inspeccionar el correo HTML oficial tal cual fue despachado al equipo comercial.

### 2. Formulario de Cotización Inteligente (`RF-01`, `RF-04`)
* Validación sintáctica y estructural conforme a **RFC 5322**.
* Catálogo cerrado de 7 modalidades operativas (Aduanal, Clasificación Arancelaria, NOMs, Logística Nacional, Internacional, etc.).
* Cero despliegue de cotizaciones automatizadas o costos en pantalla (Regla de Cero Costos del ERS).
* Almacenamiento seguro de adjuntos y registro de auditoría en base de datos.
* Despacho de correo SMTP (con respaldo en outbox local para inspección sin servidor SMTP configurado).

### 3. Navegación Interactiva de Servicios (`RF-03`, `RF-06`)
* Sincronización bidireccional mediante Hash en URL (`#clasificacion`, `#nom`, `#logistica`, `#aduanal`, etc.).
* Al hacer clic en un servicio o compartir el enlace directo con `#`, la página carga automáticamente posicionada y con el servicio correspondiente desplegado.

### 4. Contacto Omnicanal (`RF-05`)
* Integración directa en Footer y vista Contacto con esquemas URI nativos:
  * **Instagram Oficial:** `@serviproce_em` (`https://www.instagram.com/serviproce_em/`)
  * **WhatsApp Business:** `wa.me/52...`
  * **LinkedIn Corporativo:** Perfil oficial Servi Proce
  * **Facebook:** Presencia institucional
  * **Teléfonos y Correos:** `tel:+52` y `mailto:contacto@serviproce.com.mx`

---

## 🔒 Matriz de Cumplimiento ERS (Revisión 1.0)

| Código ERS | Requerimiento | Mecanismo de Implementación |
| :--- | :--- | :--- |
| **RF-01** | Cotización sin costos en pantalla, envío SMTP y log | `POST /api/quotations`, `MailService.js`, visor HTML y tabla `quotation_logs`. |
| **RF-02** | Caducidad automática de promociones ($\ge 365$ días) | `PromotionCronService.js` auditando $t_{sys} - t_0 \ge 365$ y trigger manual en CMS. |
| **RF-03** | Rutas bilingües y exclusión estricta de vacantes | Middleware Next.js, proxy interno y servidor purgan rutas de vacantes/bolsa. |
| **RF-04** | Validación RFC 5322 y mitigación Anti-Spam (reCAPTCHA) | Validación regex y `RecaptchaService.js` con umbral $\sigma \ge 0.5$. |
| **RF-05** | Enlaces omnicanal y esquemas URI nativos | `Footer.js`, `FloatingContact.js`, `contacto/page.js` (WhatsApp, Instagram, Tel, Mail). |
| **RF-06** | Catálogo UI responsivo (6 servicios + 3 transportes) | `ServiciosInteractivos.js` con navegación ancla y diseño Mobile-First. |
| **RF-07** | Autogestión CMS y sincronización SSG Webhook | Panel `/[lang]/admin` con 4 módulos y emisión de webhook `/api/revalidate`. |
| **RF-08** | Aviso de Privacidad (LFPDPPP) y Copyright dinámico | Rutas legales con PDFs descargables y año calculado dinámicamente. |
| **RF-09** | Sanitización y normalización de archivos ($\le 2\text{ MB}$) | `SanitizationService.js` (validación de magic bytes y slugs `[a-z0-9-]`). |
| **RF-10** | Metadatos SEO y Open Graph dinámicos | Títulos $\le 60$ caracteres, descripciones $\le 160$ y fallback a `/logo.png`. |
| **RF-11** | Página de error 404 con recuperación | `frontend/app/not-found.js` con navegación global y llamada a la acción. |
| **RNF-03** | Bloqueo por Fuerza Bruta (15 min tras 5 intentos) | Control de IP/Usuario en `AuthService.js` sobre tabla `login_attempts`. |
| **RNF-04** | Cierre de sesión por inactividad (15 min) | `AdminInactivityMonitor.js` en cliente y validación JWT de expiración en backend. |
| **RNF-05** | Prevención de Inyección SQL | Consultas 100% parametrizadas con Prepared Statements en PostgreSQL y SQLite. |

---

## 🧪 Pruebas Automatizadas

El proyecto cuenta con suites de pruebas unitarias y de integración que validan el 100% de los requerimientos de la Sección 6 del ERS:

```powershell
npm test
```

*Las pruebas validan conexión a base de datos (PostgreSQL/SQLite), autenticación JWT, bloqueo de fuerza bruta, expiración de promociones, validación y sanitización de cotizaciones, y normalización de archivos.*
