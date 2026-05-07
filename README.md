# Sistema MiTiendaPOS - Frontend Vue.js

Sistema de Punto de Venta (POS) desarrollado con Vue 3, Vite, Pinia y Tailwind CSS, orientado a operaciones de venta minorista en Perú (boletas/facturas, RENIEC/SUNAT, impresión térmica vía QZ Tray, integración opcional con NetSuite).

## Características

- 🔐 Autenticación JWT con dos flujos (admin con selección de tienda y cajero con PIN)
- 👥 Roles: cajero, supervisor, administrador
- 🛍️ Interfaz POS con ciclo de carrito ABIERTO → BLOQUEADO → PAGADO → FINALIZADO
- 💵 Turno de caja obligatorio para operar el POS (apertura/cierre, movimientos)
- 💳 Múltiples métodos de pago: efectivo, tarjeta, gift card, vales y pagos combinados
- 🧾 Documentos fiscales peruanos (boleta y factura)
- 🔎 Búsqueda de cliente por documento contra RENIEC/SUNAT (proxy en dev)
- 🖨️ Impresión térmica vía QZ Tray (`@point-of-sale/receipt-printer-encoder`)
- 📊 Reportes, dashboard y detalle de ventas
- 📦 Inventario, promociones, cambios y devoluciones
- 🏢 Integración opcional con NetSuite (sucursales, usuarios, cuentas de caja, stock, totales)
- 📱 Diseño responsivo con Tailwind CSS

## Requisitos previos

- Node.js 18 o superior
- npm
- Navegador moderno con soporte ES2020+

## Instalación

1. Clonar el repositorio:

   ```bash
   git clone <repository-url>
   cd MiTienda-POS-Vue3
   ```

2. Instalar dependencias:

   ```bash
   npm install
   ```

3. Configurar variables de entorno (copiar y editar):

   ```bash
   cp .env.example .env
   ```

   Variables relevantes:
   - `VITE_API_URL` — base URL para la instancia simple en `src/api/axios.js`
   - `VITE_API_BASE_URL` — base URL para `apiClient` en `src/services/axios.js` (la usada por todos los servicios nuevos)
   - `VITE_APISNET_TOKEN` — token para `apis.net.pe` (RENIEC/SUNAT)

4. Iniciar el servidor de desarrollo:

   ```bash
   npm run dev
   ```

## Scripts disponibles

- `npm run dev` — servidor Vite con proxies a `api2.mitienda.pe` y `apis.net.pe`
- `npm run build` — build de producción
- `npm run preview` — vista previa del build

Despliegue: `git push origin main` (Netlify auto-deploy).

> No hay test runner ni linter configurados en el proyecto.

## Estructura del proyecto

```
MiTienda-POS-Vue3/
├── src/
│   ├── api/          # Instancia axios simple (legado)
│   ├── assets/       # Recursos estáticos
│   ├── components/   # Componentes Vue reutilizables (incluye `ui/`)
│   ├── composables/  # Composables de Vue
│   ├── config/       # Configuración estática
│   ├── router/       # Vue Router y guards (auth, roles, turno activo)
│   ├── services/     # Capa principal de API (`apiClient`) + QZ Tray + receipt builder
│   ├── stores/       # Stores Pinia
│   ├── types/        # Tipos (TS solo en `billing.ts`)
│   ├── utils/        # Utilidades
│   ├── views/        # Vistas/páginas
│   ├── App.vue
│   └── main.js
├── public/
├── docs/
├── backend_migrations/
├── vite.config.js
└── package.json
```

## Arquitectura

### Dos flujos de autenticación

1. **Admin** (`/login`): email + password → token #1 → selección de tienda → token #2 (scoped a la tienda).
2. **Cajero** (`/cashier-login`): ID de tienda + PIN de 4 dígitos → token pre-scoped (sin selección de tienda).

Tokens en `localStorage` (`access_token`, `refresh_token`). Los usuarios no autenticados redirigen a `/cashier-login`.

### Dos instancias de Axios

- `src/api/axios.js` — instancia simple, usada por código legado (`VITE_API_URL`).
- `src/services/axios.js` — `apiClient` principal con refresh de token y normalización de respuestas (`{ error: 0 }` → `{ success: true }`). **Usar esta para código nuevo** (`VITE_API_BASE_URL`).

### Stores Pinia (`src/stores/`)

- **auth** — login, tokens, usuario, tienda, roles
- **cart** — ciclo de venta y autorización por PIN para editar carritos bloqueados
- **shift** — turno de caja (requerido para acceder al POS)
- **cashier** — movimientos de caja dentro del turno
- **billing** — tipos de comprobante (boleta/factura)
- **inventory**, **customers**, **savedSales**

### Capa de servicios (`src/services/*Api.js`)

Cada dominio de API tiene su archivo: `authApi`, `billingApi`, `branchesApi`, `cashierAccountsApi`, `cashMovementsApi`, `cashRegisterShiftsApi`, `customersApi`, `employeesApi`, `inventoryApi`, `kasnetQrApi`, `netsuiteStockApi`, `ordersApi`, `posEmpleadosApi`, `productsApi`, `promotionsApi`, `shiftsApi`, `storeSeriesApi`. Todos usan `apiClient`.

Servicios no-HTTP: `qzTrayService.js` (impresión) y `receiptBuilder.js` (layout del recibo).

### Guards del router

El router exige autenticación, roles (`meta.roles`) y turno activo para `/pos` (`requiresActiveShift`).

## Módulos del sistema

### Operativos

- **POS** (`/pos`) — interfaz principal de ventas
- **Clientes** (`/customers`)
- **Inventario** (`/inventory`)
- **Cambios y devoluciones** (`/returns`)
- **Vales y gift cards** (`/vouchers`)
- **Promociones** (`/promotions`, `/promotions/:id`)

### Caja y turnos

- **Mi turno** (`/my-shift`)
- **Turnos** (`/shifts`, `/shifts/:id`)
- **Caja** (`/cashier`) — movimientos de efectivo

### Reportes y administración

- **Dashboard** (`/dashboard`)
- **Ventas** (`/sales`, `/sales/:id`)
- **Reportes** (`/reports`)
- **Documentos** (`/documents`)

### Configuración (`/settings`)

- **Sucursales** (`/settings/branches`)
- **Usuarios** (`/settings/users`)
- **Impresora** (`/settings/printer`)
- **NetSuite** — preferencias, sucursales, usuarios y cuentas de caja (`/settings/netsuite/...`)

### Otros

- **Menú** (`/menu`)
- **Ayuda** (`/help`)

## Métodos de pago

- **Efectivo** — soporta ajuste por redondeo (moneda peruana)
- **Tarjeta** — crédito/débito
- **Gift card** — requiere código de validación
- **Vales**
- **Pagos combinados** — múltiples métodos en una sola transacción

### Pagos combinados

Permite cubrir el total con varios métodos, ver el saldo pendiente en tiempo real y emitir un comprobante con el detalle. Flujo:

1. Seleccionar el método inicial e ingresar el monto (puede ser parcial)
2. Agregar pago
3. Repetir con otros métodos hasta cubrir el total
4. Confirmar cuando el saldo pendiente sea cero

## Características por rol

### Cajero

- POS, gestión básica de clientes, emisión de comprobantes, su propio turno

### Supervisor

- Lo del cajero + reportes, inventario, dashboard, autorización (vía PIN) de operaciones sobre carritos bloqueados

### Administrador

- Acceso completo, configuración del sistema, gestión de usuarios y sucursales, integración NetSuite

## Soporte de hardware

### Impresora térmica

Vía **QZ Tray** y `@point-of-sale/receipt-printer-encoder` (comandos ESC/POS). El layout del recibo se construye en [src/services/receiptBuilder.js](src/services/receiptBuilder.js).

### Lector de código de barras

Compatible con cualquier lector HID (emulación de teclado).

## Integraciones externas

- **api2.mitienda.pe** — backend principal (proxy `/api` en dev)
- **apis.net.pe** — RENIEC/SUNAT para consulta de DNI/RUC (proxies `/api-reniec` y `/api-sunat`, requiere `VITE_APISNET_TOKEN`)
- **NetSuite** — sincronización opcional de sucursales, usuarios, cuentas de caja, stock y totales calculados
- **QZ Tray** — puente local para impresión térmica

## Tecnologías principales

- Vue 3 (Composition API, `<script setup>`)
- Vite 5
- Pinia
- Vue Router
- Tailwind CSS
- `@heroicons/vue` para iconografía
- Chart.js para gráficos del dashboard
- jsPDF / jspdf-autotable para exportación de PDFs
- QuaggaJS (`@ericblade/quagga2`) para escaneo por cámara

## Convenciones

- Idioma de UI: español (es-PE)
- Color primario: `#00b2a6` — usar `text-primary` / `bg-primary` (no usar `indigo-*` ni `blue-*` para elementos interactivos)
- Componentes UI base: `AppButton`, `AppInput`, `AppBadge`, `AppEmptyState`, `AppErrorState` (en `@/components/ui`)
- Commits: conventional commits (`feat:`, `fix:`, etc.)
- Servicios nuevos van en `src/services/` y usan `apiClient` desde `src/services/axios.js`
