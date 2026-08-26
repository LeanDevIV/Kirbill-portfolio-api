# Kirbill Tattoo Studio — Roadmap de Desarrollo v2

Reescritura completa del proyecto. Cada fase produce un checkpoint funcional y
commiteable. Incluye quality gates verificables, testing y security audit.

**Estrategia:** Empezar de cero. El código existente se descarta.

---

## Fase 0 — Scaffolding & Tooling

**Objetivo:** Monorepo funcional con linting, formatting y tooling configurado.

**Duración estimada:** 1-2 días

**Dependencias:** Ninguna

### Tareas

1. Inicializar monorepo con `package.json` root + `turbo.json` + workspaces
2. Crear `apps/api/` con `package.json`, `tsconfig.json`, entry point mínimo ElysiaJS
3. Crear `apps/web/` con Vite + React + TypeScript + Tailwind CSS v4
4. Crear `packages/shared/` con tipos base (`User`, `Appointment`, `Payment`, etc.)
5. Configurar Biome en root con reglas estrictas (no `any`, no `console.log`, naming conventions)
6. Configurar `tsconfig.json` con `strict: true` en todos los paquetes
7. Configurar path aliases `@/` → `src/` en cada app/package
8. Crear `.env.example` con todas las variables documentadas
9. Crear `.gitignore` completo (node_modules, .env, dist, .vercel, etc.)
10. Verificar que `bun run dev` levanta ambos servicios

### Archivos a crear

```
/
├── package.json              # Root workspaces
├── turbo.json                # Turborepo pipeline
├── biome.json                # Linting + formatting
├── tsconfig.json             # Base tsconfig
├── .env.example              # Variables documentadas
├── .gitignore                # Exclusiones
├── apps/
│   ├── api/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/index.ts      # Entry point mínimo
│   └── web/
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts
│       ├── index.html
│       └── src/main.tsx       # Entry point mínimo
└── packages/
    └── shared/
        ├── package.json
        ├── tsconfig.json
        └── src/types.ts       # Tipos base
```

### Quality Gate

- [ ] `bun run lint` pasa sin warnings
- [ ] `bun run build` compila sin errores en todos los paquetes
- [ ] `bun run typecheck` pasa (agregar script si no existe)
- [ ] `.env.example` tiene todas las variables necesarias
- [ ] `bun run dev` levanta api en :3001 y web en :5173
- [ ] No hay `any` en ningún archivo creado
- [ ] Git: `chore: init monorepo` committed

---

## Fase 1 — Backend Foundation

**Objetivo:** API con DB, modelos, auth, middleware de errores, y validación.

**Duración estimada:** 2-3 días

**Dependencias:** Fase 0

### Tareas

1. Configurar conexión a MongoDB con manejo de errores y reconnection (`db.ts`)
2. Crear modelo `User` con validaciones en schema (username unique, passwordHash required)
3. Crear modelo `HeroImage` con validaciones (imageUrl required, order default 0, isActive default true)
4. Crear modelo `GalleryImage` con validaciones (imageUrl required, title, category, order, isActive)
5. Crear modelo `Appointment` con validaciones (clientEmail required, date required, time required, status enum, amount, description, conversationId ref)
6. Crear modelo `Payment` con validaciones (appointmentId ref, clientEmail required, amount required, status enum)
7. Crear modelo `Conversation` con validaciones (clientEmail required + indexed, clientName, status enum, lastMessageAt)
8. Crear modelo `Message` con validaciones (conversationId ref + indexed, sender enum, text, imageUrl, timestamp)
9. Crear script `seed.ts` que crea usuario admin con bcrypt hash
10. Crear middleware `auth.ts` con `sessionJwt` (plugin JWT) y `authGuard` (macro Elysia)
11. Crear **middleware centralizado de errores** que captura errores y devuelve respuesta consistente `{ error: string }` sin exponer stack traces
12. Crear **validación de env vars al startup** — falla rápido si falta `MONGODB_URI`, `SESSION_SECRET`, etc.
13. Configurar CORS para `FRONTEND_URL` con credentials
14. Configurar cookie plugin con httpOnly, secure en production, sameSite Lax
15. Crear health check `GET /api/health` con status de DB
16. Crear rutas auth: `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`

### Archivos a crear/modificar

```
apps/api/
├── src/
│   ├── index.ts              # App setup, middleware, routes
│   ├── db.ts                 # MongoDB connection
│   ├── env.ts                # Validación de env vars
│   ├── seed.ts               # Seed script
│   ├── middleware/
│   │   ├── auth.ts           # sessionJwt + authGuard
│   │   └── error.ts          # Error handler centralizado
│   ├── models/
│   │   ├── user.ts
│   │   ├── hero-image.ts
│   │   ├── gallery-image.ts
│   │   ├── appointment.ts
│   │   ├── payment.ts
│   │   ├── conversation.ts
│   │   └── message.ts
│   └── routes/
│       └── auth.ts           # Login, logout, me
```

### Quality Gate

- [ ] Login: credenciales válidas → cookie httpOnly con JWT
- [ ] Login: credenciales inválidas → 401 con `{ error: "Invalid credentials" }`
- [ ] Logout: limpia cookie → 200
- [ ] Me: token válido → datos del usuario (sin passwordHash)
- [ ] Me: sin token → 401
- [ ] Me: token inválido/expirado → 401
- [ ] Request sin token a endpoint futuro protegido → 401
- [ ] Error de DB no expone stack trace al cliente
- [ ] Missing env var causa error claro al iniciar (no crash misterioso)
- [ ] Seed crea usuario admin correctamente
- [ ] `console.log` eliminado de archivos creados
- [ ] Todos los modelos tienen `.lean()` en queries de lectura
- [ ] Todos los campos tienen validación en schema Mongoose
- [ ] Health check retorna status de DB
- [ ] Git: `feat: backend foundation with auth` committed

---

## Fase 2 — Frontend Foundation

**Objetivo:** Layouts, routing, auth hook, design system base.

**Duración estimada:** 2-3 días

**Dependencias:** Fase 1

### Tareas

1. Configurar Tailwind v4 con tokens OKLCH en `globals.css` (colores, tipografía, glassmorphism)
2. Cargar Space Grotesk desde Google Fonts
3. Crear `PublicLayout` — Navbar + `<Outlet />` + Footer
4. Crear `AdminLayout` — AdminSidebar + `<Outlet />`
5. Crear `SiteNavbar`: pill flotante, glass on scroll, links smooth scroll a secciones
6. Crear `Footer`: redes sociales (Instagram, Facebook, WhatsApp) con iconos
7. Definir rutas en `App.tsx`: `/` (HomePage), `/admin/login`, `/admin/*` (protegidas)
8. Crear `useAuth` hook — `login()`, `logout()`, `me()` contra `/api/auth/*`
9. Crear `api.ts` client con interceptores de error y manejo de sesiones
10. Crear `cn.ts` utility (clsx + tailwind-merge)
11. Crear componentes base reutilizables: `Button`, `Input`, `Modal`, `LoadingSpinner`
12. Crear placeholder `HomePage` con 3 secciones vacías (Hero, Gallery, Contact)
13. Crear placeholder `LoginPage` con formulario básico
14. Implementar route guard: redirige a `/admin/login` si no autenticado
15. Implementar redirect: redirige a `/admin/home` si ya autenticado en login

### Archivos a crear

```
apps/web/
├── src/
│   ├── main.tsx
│   ├── App.tsx               # Router definition
│   ├── layouts/
│   │   ├── PublicLayout.tsx
│   │   └── AdminLayout.tsx
│   ├── pages/
│   │   ├── public/
│   │   │   └── HomePage.tsx
│   │   └── admin/
│   │       ├── LoginPage.tsx
│   │       └── AdminDashboard.tsx  # Placeholder para /admin/home
│   ├── components/
│   │   ├── SiteNavbar.tsx
│   │   ├── Footer.tsx
│   │   ├── AdminSidebar.tsx
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   └── LoadingSpinner.tsx
│   ├── hooks/
│   │   └── useAuth.ts
│   ├── lib/
│   │   ├── api.ts
│   │   └── cn.ts
│   └── styles/
│       └── globals.css
```

### Quality Gate

- [ ] Navegación pública funciona (scroll smooth entre secciones)
- [ ] Login redirige a `/admin/home` si ya hay sesión activa
- [ ] Ruta protegida redirige a `/admin/login` si no hay sesión
- [ ] Logout limpia cookie y redirige a `/`
- [ ] Errores de red se muestran al usuario (no solo en consola)
- [ ] Responsive: mobile (320px), tablet (768px), desktop (1440px)
- [ ] No hay `any` en props de componentes
- [ ] Navbar cambia a glass effect al hacer scroll
- [ ] Footer muestra redes sociales con links correctos
- [ ] Componentes base (Button, Input, Modal) funcionan
- [ ] Git: `feat: frontend foundation with layouts and auth` committed

---

## Fase 3 — Hero Section

**Objetivo:** Hero público con carrusel + admin CRUD de imágenes.

**Duración estimada:** 2 días

**Dependencias:** Fase 2

### Tareas

**Backend:**
1. Crear ruta `GET /api/hero-images` (público, retorna imágenes activas ordenadas)
2. Crear ruta `POST /api/hero-images` (admin, upload a Vercel Blob + crear registro)
3. Crear ruta `PUT /api/hero-images/:id` (admin, actualizar orden/activo)
4. Crear ruta `DELETE /api/hero-images/:id` (admin, borrar de Blob + DB)
5. Crear servicio `blob.ts` para upload/delete de Vercel Blob

**Frontend público:**
6. Crear `GrainientHero`: componente con `<Grainient>` animado como fondo
7. Crear `HeroCarousel`: carrusel de imágenes desde `/api/hero-images`
8. Agregar placeholders mientras no haya imágenes reales
9. Transiciones suaves entre slides

**Frontend admin:**
10. Crear `HomeAdminPage`: grid de imágenes con drag & drop para reordenar
11. Crear `ImageUploader`: sube a Vercel Blob, muestra preview, guarda URL
12. Toggle activar/desactivar imagen
13. Botón eliminar con confirmación

### Archivos a crear

```
apps/api/src/
├── routes/
│   └── hero-images.ts
├── services/
│   └── blob.ts               # Vercel Blob wrapper

apps/web/src/
├── components/
│   ├── GrainientHero.tsx
│   ├── HeroCarousel.tsx
│   └── ImageUploader.tsx
├── pages/
│   ├── public/
│   │   └── HomePage.tsx      # Actualizar con Hero real
│   └── admin/
│       └── HomeAdminPage.tsx
```

### Quality Gate

- [ ] GET `/api/hero-images` funciona sin auth
- [ ] POST/PUT/DELETE requieren auth (401 sin token)
- [ ] Imagen subida aparece en carrusel público
- [ ] Eliminar imagen borra de Vercel Blob + MongoDB
- [ ] Toggle activo/inactivo refleja en tiempo real
- [ ] Drag & drop reordena imágenes
- [ ] Loading states en uploader y carrusel
- [ ] Error de upload muestra mensaje claro
- [ ] Hero se ve correctamente en mobile y desktop
- [ ] Git: `feat: hero section with image management` committed

---

## Fase 4 — Gallery Section

**Objetivo:** Drift wall público + admin CRUD.

**Duración estimada:** 2 días

**Dependencias:** Fase 3 (reutilizar ImageUploader y servicio blob)

### Tareas

**Backend:**
1. Crear ruta `GET /api/gallery` (público, retorna imágenes activas)
2. Crear ruta `POST /api/gallery` (admin, upload + crear registro)
3. Crear ruta `PUT /api/gallery/:id` (admin, actualizar metadata)
4. Crear ruta `DELETE /api/gallery/:id` (admin, borrar de Blob + DB)

**Frontend público:**
5. Crear `DriftGallery`: componente con drift-wall de reactbits
6. Cada imagen con título y categoría al hover
7. Placeholder images mientras no haya reales

**Frontend admin:**
8. Sección de galería en admin (página aparte o dentro de HomeAdmin)
9. `ImageUploader` con campos de título y categoría
10. Grid de imágenes con acciones (editar, eliminar)

### Archivos a crear

```
apps/api/src/
├── routes/
│   └── gallery.ts

apps/web/src/
├── components/
│   └── DriftGallery.tsx
├── pages/
│   ├── public/
│   │   └── HomePage.tsx      # Actualizar con Gallery real
│   └── admin/
│       └── GalleryAdminPage.tsx
```

### Quality Gate

- [ ] GET `/api/gallery` funciona sin auth
- [ ] POST/PUT/DELETE requieren auth
- [ ] Imágenes se muestran en drift wall
- [ ] Hover muestra título y categoría
- [ ] Categorías funcionan como filtro
- [ ] Admin puede crear, editar, eliminar imágenes
- [ ] Responsive en mobile (drift wall se adapta)
- [ ] Git: `feat: gallery section with drift wall` committed

---

## Fase 5 — Chat WebSocket

**Objetivo:** Chat en tiempo real público + admin.

**Duración estimada:** 3-4 días

**Dependencias:** Fase 2 (frontend foundation)

### Tareas

**Backend:**
1. Crear WebSocket handler `/ws/chat`
2. Implementar mensaje `init`: crea/recupera conversación por email
3. Implementar mensaje `message`: guarda en DB + broadcast a la conversación
4. Implementar manejo de reconexión y estado de conexión
5. Implementar `broadcastToConversation()` y `broadcastToAdmin()`
6. Crear rutas REST: `GET /api/conversations` (admin), `GET /api/conversations/:id` (admin), `PUT /api/conversations/:id` (admin)

**Frontend público:**
7. Crear `ContactSection`: layout split 1/4 izquierda (redes) + 3/4 derecha (chat trigger)
8. Crear `ChatPanel`: popup overlay glass con WebSocket
9. Modal de ingreso de email + nombre antes de iniciar chat
10. Conexión WebSocket con `conversationId`
11. Burbujas de mensajes (cliente derecha, admin izquierda)
12. Input de texto + botón adjuntar imagen
13. Animación `rise-in` en cada mensaje enviado
14. Crear `useWebSocket` hook con reconexión automática

**Frontend admin:**
15. Crear `ChatPage`: layout de 2 paneles
16. Izquierda: lista de conversaciones (ordenadas por última actividad)
17. Indicador de mensajes no leídos
18. Derecha: chat en tiempo real con WebSocket
19. Indicador "escribiendo..."
20. Scroll automático al último mensaje

### Archivos a crear

```
apps/api/src/
├── ws/
│   └── chat.ts
├── routes/
│   └── conversations.ts

apps/web/src/
├── components/
│   ├── ContactSection.tsx
│   ├── ChatPanel.tsx
│   └── ChatBubble.tsx
├── pages/
│   ├── public/
│   │   └── HomePage.tsx      # Actualizar con Contact real
│   └── admin/
│       └── ChatPage.tsx
├── hooks/
│   └── useWebSocket.ts
```

### Quality Gate

- [ ] Cliente puede iniciar conversación con email/nombre
- [ ] Mensajes persisten en MongoDB
- [ ] Mensajes se ven en tiempo real (cliente + admin)
- [ ] Reconexión funciona (no pierde mensajes al reconectar)
- [ ] WebSocket no tiene memory leak (cleanup en `onClose`)
- [ ] Admin ve todas las conversaciones
- [ ] Indicador de mensajes no leídos funciona
- [ ] Indicador "escribiendo..." funciona
- [ ] No hay `any` en el handler WebSocket
- [ ] Chat funciona en mobile (overlay se adapta)
- [ ] Git: `feat: real-time chat with WebSocket` committed

---

## Fase 6 — Appointments + Notifications

**Objetivo:** CRUD de turnos + notificaciones por email y WebSocket.

**Duración estimada:** 2-3 días

**Dependencias:** Fase 5 (conversaciones vinculadas a turnos)

### Tareas

**Backend:**
1. Crear ruta `GET /api/appointments` (admin, con query params de filtro por status y date)
2. Crear ruta `POST /api/appointments` (admin, crea turno + envía notificación)
3. Crear ruta `PUT /api/appointments/:id` (admin, actualiza + envía notificación)
4. Crear ruta `DELETE /api/appointments/:id` (admin)
5. Crear servicio `email.ts` con Resend
6. Crear templates HTML:
   - Turno agendado: "Su turno fue agendado para el X a las XX:XX"
   - Turno modificado: notificación de cambio
   - Turno cancelado: notificación de cancelación
7. Disparar email al crear/actualizar/cancelar appointment
8. Broadcast WebSocket `appointment_created`, `appointment_updated`, `appointment_cancelled` al cliente conectado

**Frontend admin:**
9. Crear `SchedulePage`: tabla/calendario de turnos
10. Filtros por fecha y estado
11. Modal crear/editar turno (cliente, fecha, hora, monto, descripción)
12. Acciones: confirmar, cancelar, completar
13. Desde `ChatPage`: botón "Agendar turno" que abre modal pre-llenado con datos del cliente

### Archivos a crear

```
apps/api/src/
├── routes/
│   └── appointments.ts
├── services/
│   └── email.ts              # Resend email service

apps/web/src/
├── pages/
│   └── admin/
│       ├── SchedulePage.tsx
│       └── ChatPage.tsx      # Agregar botón "Agendar turno"
```

### Quality Gate

- [ ] Crear turno envía email al cliente
- [ ] Actualizar turno envía email de notificación
- [ ] Cancelar turno envía email de cancelación
- [ ] Notificación WebSocket llega al cliente conectado
- [ ] Filtros por fecha y estado funcionan
- [ ] Crear turno desde chat pre-llena datos del cliente
- [ ] Estados de turno: pending → confirmed → completed / cancelled
- [ ] Email se envía correctamente (verificar en Resend dashboard)
- [ ] Git: `feat: appointments with email and WebSocket notifications` committed

---

## Fase 7 — Payments

**Objetivo:** Tabla de pagos con estados editables.

**Duración estimada:** 1-2 días

**Dependencias:** Fase 6 (pagos vinculados a turnos)

### Tareas

**Backend:**
1. Crear ruta `GET /api/payments` (admin, con filtros por status)
2. Crear ruta `POST /api/payments` (admin)
3. Crear ruta `PUT /api/payments/:id` (admin, actualizar estado/monto)
4. Crear ruta `DELETE /api/payments/:id` (admin)

**Frontend admin:**
5. Crear `PaymentsPage`: tabla con FilterTable
6. Columnas: cliente, monto, estado (chip de color), fecha, appointment vinculado
7. Filtro por estado
8. Editar estado en línea (dropdown/select en la fila)
9. Modal crear nuevo pago
10. Estados con colores: pending (amarillo), paid (verde), cancelled (gris), refunded (rojo)

### Archivos a crear

```
apps/api/src/
├── routes/
│   └── payments.ts

apps/web/src/
├── components/
│   └── PaymentTable.tsx
├── pages/
│   └── admin/
│       └── PaymentsPage.tsx
```

### Quality Gate

- [ ] Tabla muestra pagos correctamente
- [ ] Chips de color por estado
- [ ] Editar estado funciona y persiste
- [ ] Crear pago funciona
- [ ] Filtro por estado funciona
- [ ] Pago vinculado a appointment se muestra correctamente
- [ ] Git: `feat: payments management` committed

---

## Fase 8 — Testing

**Objetivo:** Suite de tests básica pero funcional.

**Duración estimada:** 3-4 días

**Dependencias:** Fases 1-7 (todo el backend y frontend implementado)

### Tareas

1. Configurar Vitest o Bun test en `apps/api`
2. Configurar Vitest en `apps/web`
3. **Unit tests para servicios:**
   - `email.ts`: verificar que genera HTML correcto para cada tipo de notificación
   - `blob.ts`: verificar upload/delete (mock de Vercel Blob)
4. **Integration tests para auth:**
   - Login con credenciales válidas → 200 + cookie
   - Login con credenciales inválidas → 401
   - Logout → cookie limpia
   - Me con token válido → 200 + datos
   - Me sin token → 401
   - Me con token inválido → 401
5. **Integration tests para CRUD:**
   - GET/POST/PUT/DELETE `/api/hero-images` con y sin auth
   - GET/POST/PUT/DELETE `/api/gallery` con y sin auth
   - GET/POST/PUT/DELETE `/api/appointments` con y sin auth
   - GET/POST/PUT/DELETE `/api/payments` con y sin auth
   - GET/PUT `/api/conversations` con y sin auth
6. **E2E tests críticos:**
   - Login → crear appointment → verificar que email se envía (mock)
   - Login → crear conversation → enviar message → verificar persistencia
7. Configurar coverage mínimo: 60% services, 80% auth
8. Agregar scripts `test` y `test:coverage` en package.json

### Archivos a crear

```
apps/api/
├── src/
│   └── __tests__/
│       ├── auth.test.ts
│       ├── hero-images.test.ts
│       ├── gallery.test.ts
│       ├── appointments.test.ts
│       ├── payments.test.ts
│       ├── conversations.test.ts
│       └── services/
│           ├── email.test.ts
│           └── blob.test.ts
├── vitest.config.ts          # o bun test config

apps/web/
├── src/
│   └── __tests__/
│       └── useAuth.test.ts
├── vitest.config.ts
```

### Quality Gate

- [ ] `bun run test` pasa sin errores
- [ ] Auth endpoints cubiertos al 80%
- [ ] Services cubiertos al 60%
- [ ] No hay tests pendientes (`it.skip` o `it.todo`)
- [ ] Coverage report se genera correctamente
- [ ] Tests corren en < 30 segundos
- [ ] Git: `test: add unit and integration tests` committed

---

## Fase 9 — Security Audit

**Objetivo:** Lista de vulnerabilidades corregidas.

**Duración estimada:** 1-2 días

**Dependencias:** Fase 8 (tests pasando)

### Checklist de Seguridad

**Autenticación:**
- [ ] JWT secret no es hardcodeado en producción (solo fallback en development)
- [ ] Cookie `secure: true` en producción
- [ ] Cookie `httpOnly: true` siempre
- [ ] Cookie `sameSite: "Lax"` siempre
- [ ] Token expira en 24 horas máximo
- [ ] No se retorna `passwordHash` en ningún endpoint

**Rate Limiting:**
- [ ] Rate limiting en `POST /api/auth/login` (máx 5 intentos/minuto por IP)
- [ ] Rate limiting en WebSocket (máx 10 conexiones por conversación)

**Input Validation:**
- [ ] Todos los endpoints tienen validación de body (Elysia schema)
- [ ] Todos los params de URL validados (ObjectId format)
- [ ] Todos los query params validados
- [ ] Input sanitizado contra MongoDB injection

**WebSocket Security:**
- [ ] WebSocket no permite conexiones sin identificación
- [ ] Admin WebSocket requiere token válido
- [ ] Mensajes validados antes de guardar en DB

**Error Handling:**
- [ ] No se exponen stack traces en errores de producción
- [ ] No se exponen mensajes de error internos al cliente
- [ ] Errores de DB se loguean pero no se retornan al cliente

**Environment:**
- [ ] Variables de entorno no están en el repo (.gitignore)
- [ ] `.env.example` no tiene valores reales
- [ ] Falta de env var causa error claro al startup

**Dependencies:**
- [ ] `bun audit` no tiene vulnerabilidades críticas
- [ ] Dependencias actualizadas a versiones recientes

### Quality Gate

- [ ] Todos los items del checklist marcados
- [ ] No hay `console.log` con datos sensibles
- [ ] No hay secrets en el código fuente
- [ ] Git: `fix: security audit fixes` committed

---

## Fase 10 — Polish & Responsive

**Objetivo:** UX pulida en todos los breakpoints.

**Duración estimada:** 2 días

**Dependencias:** Fase 9

### Tareas

1. Revisar responsive en breakpoints: 320px, 375px, 768px, 1024px, 1440px
2. Animaciones: transiciones de página, hover states, loading states
3. SEO: meta tags, Open Graph, `sitemap.xml`
4. Favicon y metadatos de la app
5. Empty states (cuando no hay imágenes, turnos, pagos, conversaciones)
6. Loading skeletons para todas las tablas y grids
7. Error states amigables (404, 500, network error)
8. Touch interactions en mobile (swipe en carousel, tap en chat)
9. Keyboard navigation en admin
10. Prefers-reduced-motion: desactivar animaciones si el usuario lo prefiere

### Quality Gate

- [ ] Funciona en iPhone SE (320px), iPhone 14 (390px), iPad (768px), Desktop (1440px)
- [ ] No hay overflow horizontal en ningún breakpoint
- [ ] Animaciones son suaves (no causan layout shift)
- [ ] Empty states muestran mensaje amigable con acción sugerida
- [ ] Loading states muestran skeleton/spinner
- [ ] Error states muestran mensaje claro con botón de retry
- [ ] SEO: meta description, Open Graph tags presentes
- [ ] Favicon funciona en todos los navegadores
- [ ] Keyboard navigation funciona en admin (tab, enter, escape)
- [ ] Animaciones se desactivan con prefers-reduced-motion
- [ ] Git: `fix: responsive and polish` committed

---

## Fase 11 — Deploy & Production

**Objetivo:** App desplegada y funcional en producción.

**Duración estimada:** 1 día

**Dependencias:** Fase 10

### Tareas

1. Deploy frontend en Vercel
2. Deploy backend (Vercel/Railway/Fly.io)
3. Configurar variables de entorno en producción
4. Conectar dominio personalizado
5. Configurar HTTPS
6. Prueba de flujo completo en producción:
   - Login → crear appointment → enviar email → verificar email
   - Chat → enviar mensaje → verificar en admin
   - Crear turno → verificar notificación WebSocket
7. Verificar que no hay errores en consola del navegador
8. Verificar performance (Lighthouse score > 90)
9. Configurar monitoreo básico (errores, uptime)

### Quality Gate

- [ ] Frontend carga en < 3 segundos
- [ ] API responde en < 500 milisegundos
- [ ] Login funciona en producción
- [ ] Chat funciona en producción
- [ ] Emails se envían en producción
- [ ] No hay errores en consola del navegador
- [ ] CORS configurado para dominio de producción
- [ ] Lighthouse performance score > 90
- [ ] HTTPS funciona correctamente
- [ ] Git: `chore: deploy to production` committed

---

## Resumen de Fases

| Fase | Nombre | Duración | Dependencias |
|------|--------|----------|--------------|
| 0 | Scaffolding & Tooling | 1-2 días | Ninguna |
| 1 | Backend Foundation | 2-3 días | Fase 0 |
| 2 | Frontend Foundation | 2-3 días | Fase 1 |
| 3 | Hero Section | 2 días | Fase 2 |
| 4 | Gallery Section | 2 días | Fase 3 |
| 5 | Chat WebSocket | 3-4 días | Fase 2 |
| 6 | Appointments + Notifications | 2-3 días | Fase 5 |
| 7 | Payments | 1-2 días | Fase 6 |
| 8 | Testing | 3-4 días | Fases 1-7 |
| 9 | Security Audit | 1-2 días | Fase 8 |
| 10 | Polish & Responsive | 2 días | Fase 9 |
| 11 | Deploy & Production | 1 día | Fase 10 |
| **Total** | | **22-31 días** | |

---

## Reglas de Calidad Generales

1. **No hay `any`** — tipado estricto en todo el código
2. **No hay `console.log`** — usar logger o nada
3. **No hay funciones inline en JSX** — declarar como constantes
4. **No hay valores hardcodeados** — usar constantes con nombre
5. **Los filtros van en el backend** — la DB hace el trabajo
6. **No hay transformación de datos en frontend** — la API sirve datos listos
7. **Convencional Commits** — `feat:`, `fix:`, `refactor:`, `test:`, etc.
8. **Un commit por checkpoint significativo** — no commits por cada save
9. **Nunca hacer push** — push manual por parte del usuario
10. **Production-ready desde el día 0** — sin placeholders permanentes, sin TODOs sin ticket
