# PRD: MiTienda POS Mobile (Android)

## 1. Resumen Ejecutivo

Replicar la aplicación web MiTiendaPOS como aplicación nativa Android para dispositivos POS (Sunmi, Imin, Pos-D). La app se conecta al mismo backend (`api2.mitienda.pe/api/v1`) y replica la funcionalidad completa del POS web, con integración nativa al hardware del dispositivo: impresora térmica incorporada, lector de tarjetas/pin pad, escáner de código de barras y caja registradora.

---

## 2. Recomendación de Stack: Kotlin Nativo

### ¿Por qué Kotlin y no Flutter o React Native?

| Criterio | Kotlin | Flutter | React Native |
|----------|--------|---------|-------------|
| SDK de hardware POS (Sunmi/Imin/Pos-D) | **Nativo, sin bridge** | Requiere platform channels | Requiere native modules |
| SDK de pagos con tarjeta/pin pad | **Nativo, sin bridge** | Requiere platform channels | Requiere native modules |
| Rendimiento en hardware limitado | **Óptimo** | Bueno | Inferior |
| Impresora térmica integrada | **Acceso directo al SDK** | Plugin de terceros | Plugin de terceros |
| Mantenimiento de integraciones HW | **Directo, sin capa intermedia** | Mantener plugins + platform channels | Mantener bridges |
| Velocidad de desarrollo UI | Moderada (Jetpack Compose) | Alta | Alta |
| Ecosistema Android POS | **Todos los SDK son Java/Kotlin** | Wrappers parciales | Wrappers parciales |

**Decisión: Kotlin con Jetpack Compose.**

El factor decisivo es la integración con hardware. Los dispositivos Sunmi, Imin y Pos-D proporcionan SDKs Android nativos (Java/Kotlin) para:
- Impresora térmica incorporada
- Lector de tarjetas EMV / NFC / banda magnética
- Pin pad para ingreso de PIN de tarjeta
- Escáner de código de barras (físico)
- Caja registradora (cash drawer)

Con Flutter o React Native, cada SDK requeriría un bridge/plugin que:
1. Agrega una capa de mantenimiento y posibles bugs
2. Limita el acceso a features nuevos del SDK hasta que el plugin se actualice
3. Complica el debugging de problemas de hardware
4. Los plugins de terceros para Sunmi/Imin tienen mantenimiento irregular

Como la app es **exclusivamente Android** (todos los dispositivos POS target son Android), no hay beneficio de cross-platform.

### Stack Técnico Propuesto

| Componente | Tecnología |
|-----------|-----------|
| Lenguaje | Kotlin |
| UI | Jetpack Compose + Material 3 |
| Arquitectura | MVVM + Clean Architecture |
| Navegación | Compose Navigation |
| HTTP Client | Retrofit 2 + OkHttp |
| Serialización | Kotlinx Serialization o Moshi |
| State Management | StateFlow + ViewModel |
| Local Storage | DataStore (preferences) + Room (offline cache) |
| DI | Hilt (Dagger) |
| Impresión | SDK nativo por fabricante (Sunmi/Imin/Pos-D) |
| Pagos | SDK nativo por fabricante + pasarelas de pago |
| Barcode Scanner | SDK nativo + CameraX (fallback software) |
| Min SDK | API 24 (Android 7.0) — cubre todos los POS target |

---

## 3. Usuarios y Roles

### 3.1 Tipos de Acceso

| Tipo | Método de Login | Alcance |
|------|----------------|---------|
| **Administrador** | Email + contraseña → selector de tienda | Acceso completo: POS, dashboard, inventario, config, reportes |
| **Supervisor** | Email + contraseña → selector de tienda | Acceso completo excepto configuración avanzada |
| **Cajero** | Store ID + PIN (4 dígitos) | Solo POS, ventas, turno de caja. Sin cambiar tienda ni config |

### 3.2 Autorizaciones por PIN

Ciertas acciones requieren PIN de supervisor (mismo comportamiento que web):
- Editar carrito en estado BLOQUEADO (con pagos parciales)
- Eliminar pagos registrados
- Anular ventas
- Aplicar descuentos manuales

---

## 4. Módulos Funcionales

### 4.1 Autenticación

**Flujo Admin (2 tokens):**
```
POST /auth/login {email, password}
  → Token #1 + user data
GET /user/stores
  → Lista de tiendas del usuario
POST /user/store/select {store_id}
  → Token #2 (scoped a tienda)
```

**Flujo Cajero (1 token):**
```
POST /auth/cashier-login {store_id, pin}
  → Token pre-scoped a tienda
```

**Autenticación de empleado POS (dentro de sesión admin):**
```
POST /pos-empleados/validate-pin {tienda_id, pin}
  → Datos del empleado, sesión de 12 horas
```

**Refresh de token:**
```
POST /auth/refresh {refresh_token}
  → Nuevo access_token + refresh_token
```

**Requisitos:**
- Persistir tokens en DataStore (encriptado)
- Auto-refresh en interceptor OkHttp al recibir 401
- Sesión de cajero con TTL de 12 horas
- Pantalla de bloqueo con re-ingreso de PIN (sin perder sesión)

---

### 4.2 Menú Principal

Grid de módulos idéntico a la web, adaptado a pantalla del dispositivo POS (típicamente 5.5" a 8"):

| Módulo | Roles | Icono |
|--------|-------|-------|
| Dashboard | supervisor, admin | Gráfico de barras |
| Mi Turno | todos | Reloj |
| POS (Vender) | todos (requiere turno activo) | Carrito |
| Ventas | todos | Lista |
| Documentos | todos | Documento |
| Inventario | todos (solo lectura para cajero) | Cajas |
| Clientes | todos | Personas |
| Promociones | todos | Estrella |
| Vales y Gift Cards | todos | Ticket |
| Devoluciones | todos | Refresh |
| Configuración | supervisor, admin | Engranaje |
| Ayuda | todos | Interrogación |

---

### 4.3 Turno de Caja (Shift Management)

**Abrir turno:**
```
POST /cash-register-shifts/open
{
  caja_numero: int,
  monto_inicial: float,
  notas_apertura: string,
  empleado_id: int,
  tiendadireccion_id: int  // sucursal
}
```

**Consultar turno activo:**
```
GET /cash-register-shifts/active?caja_numero={n}
```

**Cerrar turno:**
```
POST /cash-register-shifts/close/{shiftId}
{
  monto_real: float,      // conteo real de caja
  notas_cierre: string,
  desglose_billetes: {},   // denominaciones
  pin: string
}
```

**Reglas de negocio:**
- No se puede acceder al POS sin turno activo
- Un turno por caja registradora
- Turnos >24h muestran advertencia de auto-cierre
- Supervisor puede cerrar turno de otro cajero
- Al cerrar: mostrar resumen con diferencia entre monto esperado y real

**Movimientos de caja:**
```
POST /cash-register-shifts/movements
{
  turnocaja_id, tipo ('venta'|'entrada'|'salida'|'ajuste'),
  metodo_pago ('efectivo'|'tarjeta'|'yape'|'plin'|'transferencia'|'qr'),
  monto, concepto, referencia, notas
}
```

**Desglose de billetes al cerrar (denominaciones PEN):**
- Billetes: 200, 100, 50, 20, 10
- Monedas: 5, 2, 1, 0.50, 0.20, 0.10

---

### 4.4 POS — Pantalla Principal de Venta

Este es el módulo core. La pantalla se divide en:

**Panel izquierdo (o superior en pantalla pequeña):** Búsqueda y selección de productos
**Panel derecho (o inferior):** Carrito de compra actual

#### 4.4.1 Búsqueda de Productos

```
GET /products?search={term}&category_id={id}&page={n}&limit=20&published=1&stock_status=in_stock
```

- Búsqueda por nombre, SKU o código de barras
- Filtro por categoría
- Grid de productos con imagen, nombre, precio, stock
- Indicador visual de stock bajo o agotado

**Escáner de código de barras:**
- **Prioridad 1:** Escáner físico integrado del dispositivo (SDK nativo Sunmi/Imin)
- **Prioridad 2:** Cámara del dispositivo con CameraX + ML Kit
- Al escanear, buscar producto y agregarlo al carrito automáticamente

#### 4.4.2 Carrito — Máquina de Estados

```
ABIERTO → BLOQUEADO → PAGADO → FINALIZADO
```

| Estado | Agregar productos | Editar cantidad | Eliminar productos | Agregar pagos | Eliminar pagos |
|--------|:-:|:-:|:-:|:-:|:-:|
| **ABIERTO** | Sí | Sí | Sí | Sí | N/A |
| **BLOQUEADO** | Con PIN cajero | Con PIN cajero | PIN supervisor | Sí | PIN supervisor |
| **PAGADO** | No | No | No | No | PIN supervisor |
| **FINALIZADO** | No | No | No | No | No |

- Transición a BLOQUEADO: cuando se agrega el primer pago
- Transición a PAGADO: cuando total pagado >= total de venta (tolerancia < 0.005)
- Transición a FINALIZADO: cuando la orden se crea en el backend

#### 4.4.3 Cálculo de Totales

**Método preferido — Backend (NetSuite):**
```
POST /orders/calculate-total
{ items: [{ product_id, quantity, price }] }
→ { subtotal, tax, total, items: [...] }
```

**Fallback local:**
```
subtotal = Σ (price / 1.18 * quantity)
igv = subtotal * 0.18
total = subtotal + igv
```

- IGV (impuesto): 18%, incluido en el precio
- Los precios siempre incluyen IGV; subtotal se calcula dividiendo entre 1.18
- Redondeo de efectivo: al 0.10 más cercano (moneda peruana)

#### 4.4.4 Tipo de Documento (antes de vender)

Al iniciar una venta, seleccionar:
- **Boleta** — para consumidores (DNI opcional)
- **Factura** — para empresas (RUC obligatorio)

El tipo de documento determina qué datos del cliente son requeridos.

#### 4.4.5 Búsqueda / Asignación de Cliente

```
GET /customers?search={term}
GET /customers/search-by-document?document_number={n}&document_type={dni|ruc}
GET /customers/lookup/{documentNumber}?type={dni|ruc}  // RENIEC/SUNAT lookup
POST /customers  // crear nuevo
```

- DNI → consulta RENIEC (auto-completa nombres)
- RUC → consulta SUNAT (auto-completa razón social)
- Cliente obligatorio para factura, opcional para boleta

#### 4.4.6 Validación de Stock Pre-Pago

```
POST /orders/validate-stock
{ items: [{ product_id, quantity, inventory_number? }] }
```

- Se ejecuta antes de abrir el modal de pago
- Si hay items sin stock, mostrar modal de error con detalle por producto
- Cachear `inventory_number` por producto para evitar llamadas repetidas al API de NetSuite

#### 4.4.7 Pagos

**Métodos activos:**

| Método | Comportamiento |
|--------|---------------|
| **Efectivo** | Permite monto mayor al total (vuelto). Redondeo a 0.10 |
| **Tarjeta** | Monto máximo = saldo pendiente. **Integración con pin pad nativo** |

**Métodos futuros (mostrar deshabilitados):**
- Yape / Plin (QR)
- Transferencia bancaria
- Nota de crédito

**Pagos combinados:** Una venta puede tener múltiples pagos (ej: parte efectivo + parte tarjeta).

**Reglas de redondeo:**
- Solo aplica cuando el pago es 100% efectivo
- Si se agrega un método no-efectivo, se elimina el redondeo
- Redondeo puede ser positivo (cobrar más) o negativo (cobrar menos)

#### 4.4.8 Creación de Orden

```
POST /orders/legacy
{
  items: [{ product_id, quantity, price, name, sku, ... }],
  payments: [{ method, amount, reference? }],
  customer: { document_type, document_number, name, email?, phone? },
  billing_document_type: 'boleta' | 'factura',
  source: 'pos-mobile',  // diferenciador vs 'pos'
  shift_id: int,
  employee_id: int,
  branch_id: int,
  notes: string?,
  rounding_adjustment: float?
}
```

- Protección contra duplicados: deshabilitar botón durante procesamiento
- En caso de error de red, NO reintentar automáticamente (riesgo de duplicación)
- Después de crear: imprimir ticket, registrar movimiento de caja, limpiar carrito

#### 4.4.9 Ventas Guardadas (Parking)

- Guardar carrito actual (snapshot) para atender otro cliente
- Listar ventas guardadas y restaurar cualquiera
- Merge de dos ventas guardadas en una sola
- Persistir en almacenamiento local (Room DB) para sobrevivir reinicios

---

### 4.5 Historial de Ventas

```
GET /orders?page={n}&limit=20&date_from={date}&date_to={date}&status={status}&source={source}
```

**Filtros:**
- Búsqueda por texto libre
- Estado: Aprobado, Pendiente, Anulado, Rechazado, Creado
- Origen: POS, POS-Mobile, Web, API
- Rango de fechas

**Acciones por venta:**
- Ver detalle completo
- Reimprimir ticket: `GET /orders/{id}` → imprimir
- Reenviar email: `POST /orders/{id}/resend-invoice-email`
- Anular venta: `POST /orders/{id}/void` (requiere auth supervisor + motivo)

---

### 4.6 Inventario

```
GET /products?page={n}&limit=20&search={term}&category_id={id}&stock_status={status}
PUT /products/{id}  // quick edit (solo admin/supervisor)
```

- Vista de estadísticas: total productos, en stock, stock bajo, agotados
- Lista con búsqueda y filtros
- Edición rápida de precio y stock (admin/supervisor)
- Solo lectura para cajeros (banner visible)

---

### 4.7 Clientes

```
GET /customers?page={n}&limit=20&search={term}
POST /customers
PUT /customers/{id}
DELETE /customers/{id}
GET /customers/lookup/{doc}?type=dni|ruc
```

- CRUD completo
- Búsqueda por nombre, email, teléfono, documento
- Consulta RENIEC (DNI) y SUNAT (RUC) para auto-completar datos
- Detección de duplicados antes de crear

---

### 4.8 Dashboard

```
GET /orders/summary/daily?date={YYYY-MM-DD}
```

- Resumen del día: total ventas, cantidad de transacciones, ticket promedio
- Ventas por método de pago
- Solo visible para supervisor y administrador

---

### 4.9 Configuración

- **Sucursales:** `GET /branches`
- **Usuarios POS:** CRUD en `/pos-empleados`
- **Impresora:** Selección de impresora, prueba de impresión, configuración de ancho de papel
- **NetSuite:** Preferencias, sucursales NS, usuarios NS, cuentas de cajero NS
- **Series de facturación:** `GET/PUT /stores/{id}/series-config`

---

## 5. Integraciones de Hardware

### 5.1 Impresora Térmica Incorporada

| Fabricante | SDK | Ancho papel |
|-----------|-----|-------------|
| Sunmi | `SunmiPrinterService` (AIDL) | 58mm / 80mm |
| Imin | `IminPrintUtils` | 58mm / 80mm |
| Pos-D | SDK propietario Pos-D | 80mm |

**Arquitectura propuesta:**
```kotlin
interface PosPrinter {
    fun printReceipt(receipt: Receipt): Result<Unit>
    fun printTestPage(): Result<Unit>
    fun openCashDrawer(): Result<Unit>
    fun getPrinterStatus(): PrinterStatus
    fun getPaperWidth(): PaperWidth  // 58mm | 80mm
}

class SunmiPrinter : PosPrinter { ... }
class IminPrinter : PosPrinter { ... }
class PosDPrinter : PosPrinter { ... }
class GenericEscPosPrinter : PosPrinter { ... }  // Bluetooth/USB fallback
```

Auto-detectar fabricante al iniciar la app (`Build.MANUFACTURER` / `Build.MODEL`).

**Contenido del ticket (replicar receiptBuilder.js):**
- Header: logo empresa, razón social, RUC, dirección
- Tipo de documento: FACTURA ELECTRÓNICA / BOLETA DE VENTA ELECTRÓNICA
- Datos del cliente (documento, nombre/razón social)
- Línea separadora
- Detalle de items: cantidad, descripción, precio unitario (sin IGV), subtotal
- Descuentos por item si aplica
- Subtotal (sin IGV)
- IGV (18%)
- Redondeo (si aplica)
- **Total**
- Métodos de pago utilizados
- Vuelto (si efectivo)
- Texto de autorización SUNAT
- Texto de representación impresa
- Fecha/hora de emisión

### 5.2 Lector de Tarjetas / Pin Pad

| Fabricante | SDK de Pagos |
|-----------|-------------|
| Sunmi | Sunmi Payment SDK / PayCloud |
| Imin | Integración con pasarela (depende del procesador) |
| Pos-D | SDK Pos-D Payments |

**Flujo de pago con tarjeta:**
```
1. App envía monto al SDK de pagos
2. SDK controla el pin pad y lector de tarjeta
3. Usuario inserta/desliza/acerca tarjeta
4. Usuario ingresa PIN en pin pad del dispositivo
5. SDK se comunica con procesador de pagos
6. SDK retorna resultado (aprobado/rechazado + referencia)
7. App registra el pago en el carrito con la referencia
```

**Interfaz abstracta:**
```kotlin
interface CardPaymentService {
    suspend fun processPayment(amount: Double, reference: String): PaymentResult
    suspend fun voidPayment(transactionId: String): VoidResult
    fun isAvailable(): Boolean
}

data class PaymentResult(
    val approved: Boolean,
    val transactionId: String?,
    val authorizationCode: String?,
    val cardLastFour: String?,
    val cardBrand: String?,  // VISA, MC, AMEX
    val errorMessage: String?
)
```

**Pasarelas de pago a integrar (por definir):**
- Niubiz (VisaNet Perú)
- Izipay
- Culqi Terminal

### 5.3 Escáner de Código de Barras

| Fabricante | SDK |
|-----------|-----|
| Sunmi | `SunmiScanService` (hardware scanner) |
| Imin | `IminScanManager` |
| Pos-D | Intent-based scan |

**Fallback:** CameraX + ML Kit Barcode Scanning (para dispositivos sin escáner dedicado).

**Formatos soportados:** EAN-13, EAN-8, UPC-A, Code 128, Code 39, QR.

### 5.4 Cash Drawer (Caja Registradora)

- Comando ESC/POS a través de la impresora térmica
- Pulso en pin 2 o pin 5 del conector RJ11
- Se activa automáticamente al completar una venta con efectivo

---

## 6. Arquitectura de la Aplicación

### 6.1 Estructura de Paquetes

```
com.mitienda.pos/
├── di/                          # Hilt modules
├── data/
│   ├── remote/
│   │   ├── api/                 # Retrofit interfaces
│   │   ├── dto/                 # Data Transfer Objects
│   │   └── interceptors/        # Auth, token refresh
│   ├── local/
│   │   ├── datastore/           # Preferences (tokens, config)
│   │   └── db/                  # Room DB (ventas guardadas, cache)
│   └── repository/              # Repository implementations
├── domain/
│   ├── model/                   # Domain models
│   ├── repository/              # Repository interfaces
│   └── usecase/                 # Business logic
├── presentation/
│   ├── auth/                    # Login, CashierLogin
│   ├── menu/                    # Main menu
│   ├── pos/                     # POS screen, cart, payments
│   ├── sales/                   # Sales history, detail
│   ├── inventory/               # Product list, edit
│   ├── customers/               # Customer CRUD
│   ├── shifts/                  # Shift management
│   ├── dashboard/               # KPIs
│   ├── settings/                # Configuration
│   └── common/                  # Shared components, theme
├── hardware/
│   ├── printer/                 # PosPrinter abstraction + implementations
│   ├── scanner/                 # BarcodeScanner abstraction
│   ├── payment/                 # CardPaymentService abstraction
│   └── HardwareDetector.kt     # Auto-detect manufacturer
└── util/                        # Formatters, extensions
```

### 6.2 Capa de Red

**Retrofit interfaces** que replican los servicios de la app web:

| Servicio | Base Path | Prioridad |
|----------|-----------|-----------|
| AuthApi | `/auth/*`, `/user/*` | P0 — MVP |
| OrdersApi | `/orders/*` | P0 — MVP |
| ProductsApi | `/products/*` | P0 — MVP |
| CustomersApi | `/customers/*` | P0 — MVP |
| ShiftsApi | `/cash-register-shifts/*` | P0 — MVP |
| CashMovementsApi | `/cash-register-shifts/*/movements` | P0 — MVP |
| PosEmpleadosApi | `/pos-empleados/*` | P0 — MVP |
| BillingApi | `/billing/*` | P1 |
| InventoryApi | `/products/*` (inventory view) | P1 |
| PromotionsApi | `/promotions/*` | P1 |
| BranchesApi | `/branches/*` | P1 |
| StoreSeriesApi | `/stores/*/series-config` | P2 |
| CashierAccountsApi | `/netsuite-cashier-accounts/*` | P2 |
| NetsuiteStockApi | `/products/*/netsuite-stock` | P2 |

**Interceptores OkHttp:**
1. `AuthInterceptor` — Agrega `Bearer {token}` a cada request
2. `TokenRefreshAuthenticator` — En 401, intenta refresh automático
3. `ResponseNormalizer` — Transforma `{error: 0, data}` → `{success: true, data}`

### 6.3 Almacenamiento Local

| Dato | Tecnología | Propósito |
|------|-----------|-----------|
| Tokens (access, refresh) | EncryptedDataStore | Seguridad |
| User, selected store | DataStore | Persistencia de sesión |
| Cashier session | DataStore | Sesión 12h con TTL |
| Saved sales (parking) | Room DB | Sobrevive reinicios |
| Printer config | DataStore | Preferencias hardware |
| Product cache | Room DB | Offline básico, búsqueda rápida |

---

## 7. UX / Diseño

### 7.1 Principios de Diseño para POS Móvil

1. **Touch-first:** Botones grandes (min 48dp), espaciado generoso
2. **Una mano:** Acciones principales accesibles con pulgar
3. **Velocidad:** El cajero no puede esperar — feedback inmediato, loading states claros
4. **Contraste alto:** Dispositivos POS se usan en tiendas con iluminación variable
5. **Sin scroll horizontal:** Todo el contenido en una columna o dos paneles verticales

### 7.2 Paleta de Colores

| Token | Valor | Uso |
|-------|-------|-----|
| Primary | `#00b2a6` | Botones de acción, links, badges activos |
| Primary Dark | `#008f85` | Status bar, pressed state |
| Surface | `#FFFFFF` | Cards, modals |
| Background | `#F3F4F6` | Fondo general (gray-100) |
| Error | `#EF4444` | Errores, stock agotado, anulaciones |
| Success | `#10B981` | Confirmaciones, pagado, en stock |
| Warning | `#F59E0B` | Stock bajo, turnos largos |
| On Surface | `#1F2937` | Texto principal (gray-800) |
| Secondary Text | `#6B7280` | Labels, texto secundario (gray-500) |

### 7.3 Adaptación de Pantallas por Tamaño

| Tamaño | Dispositivos | Layout POS |
|--------|-------------|-----------|
| 5.5" | Sunmi V2 Pro, Pos-D | Stack vertical: productos arriba, carrito abajo |
| 6-8" | Sunmi V2s, Imin Swift | Dos paneles side-by-side |
| 10"+ | Sunmi D3, tablets | Igual que web actual |

### 7.4 Idioma

Toda la UI en **español** (es-PE). Formato de moneda: `S/ 1,234.56`.

---

## 8. Fases de Desarrollo

### Fase 1 — MVP (Core POS) — ~8-10 semanas

**Objetivo:** Cajero puede abrir turno, realizar ventas con efectivo, imprimir ticket.

| Módulo | Funcionalidad |
|--------|--------------|
| Auth | Login cajero (PIN), login admin (email+password), selector de tienda |
| Turno | Abrir, cerrar, ver turno activo |
| POS | Buscar productos, armar carrito, pago en efectivo, crear orden |
| Impresora | Impresión de ticket vía SDK nativo (Sunmi como primer target) |
| Escáner | Lectura de código de barras (hardware + cámara) |

**Entregable:** APK funcional para Sunmi V2 Pro.

### Fase 2 — Pagos y Ventas — ~4-6 semanas

| Módulo | Funcionalidad |
|--------|--------------|
| Pagos con tarjeta | Integración pin pad / lector EMV (Sunmi Payment SDK) |
| Pagos combinados | Efectivo + tarjeta en una misma venta |
| Historial de ventas | Lista, detalle, reimprimir ticket |
| Anulación | Void con auth supervisor |
| Ventas guardadas | Parking y restauración de carritos |
| Clientes | Búsqueda, creación, lookup DNI/RUC |
| Validación stock | Pre-pago con NetSuite |

### Fase 3 — Módulos Complementarios — ~4-6 semanas

| Módulo | Funcionalidad |
|--------|--------------|
| Dashboard | KPIs y resumen diario |
| Inventario | Consulta y edición rápida de stock/precio |
| Documentos | Boletas y facturas (Nubefact) |
| Promociones | Visualización y aplicación |
| Configuración | Sucursales, usuarios POS, impresora |

### Fase 4 — Multi-dispositivo y Hardening — ~3-4 semanas

| Módulo | Funcionalidad |
|--------|--------------|
| Imin | Implementación de `IminPrinter`, `IminScanner` |
| Pos-D | Implementación de `PosDPrinter`, `PosDPayment` |
| Offline básico | Cache de productos, cola de órdenes cuando no hay red |
| Cash drawer | Apertura automática de caja |
| Auto-update | Mecanismo de actualización de APK |

---

## 9. Endpoints del API — Catálogo Completo

Todos los endpoints son relativos a `{BASE_URL}/api/v1`. Auth via `Bearer` token.

### Autenticación
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/auth/login` | Login admin |
| POST | `/auth/cashier-login` | Login cajero (store_id + pin) |
| POST | `/auth/refresh` | Refresh token |
| POST | `/auth/logout` | Logout |
| GET | `/user/profile` | Perfil del usuario |
| GET | `/user/stores` | Tiendas del usuario |
| POST | `/user/store/select` | Seleccionar tienda activa |

### Empleados POS
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/pos-empleados/validate-pin` | Validar PIN de empleado |
| GET | `/pos-empleados` | Listar empleados |
| POST | `/pos-empleados` | Crear empleado |
| PUT | `/pos-empleados/{id}` | Actualizar empleado |

### Turnos de Caja
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/cash-register-shifts/active` | Turno activo |
| POST | `/cash-register-shifts/open` | Abrir turno |
| POST | `/cash-register-shifts/close/{id}` | Cerrar turno |
| GET | `/cash-register-shifts` | Listar turnos |
| GET | `/cash-register-shifts/{id}` | Detalle de turno |
| GET | `/cash-register-shifts/{id}/movements` | Movimientos del turno |
| GET | `/cash-register-shifts/{id}/movements-summary` | Resumen del turno |
| POST | `/cash-register-shifts/movements` | Registrar movimiento |

### Productos
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/products` | Listar (search, category_id, stock_status, page, limit) |
| GET | `/products/{id}` | Detalle |
| PUT | `/products/{id}` | Actualizar stock/precio |

### Órdenes
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/orders/legacy` | Crear orden POS |
| POST | `/orders/validate-stock` | Validar stock pre-pago |
| POST | `/orders/calculate-total` | Calcular totales (NetSuite) |
| GET | `/orders` | Listar (date_from, date_to, status, source, page, limit) |
| GET | `/orders/{id}` | Detalle |
| GET | `/orders/summary/daily` | Resumen diario |
| POST | `/orders/{id}/void` | Anular venta |
| POST | `/orders/{id}/resend-invoice-email` | Reenviar factura por email |

### Clientes
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/customers` | Listar (search, page, limit) |
| GET | `/customers/{id}` | Detalle |
| GET | `/customers/search-by-document` | Buscar por documento |
| GET | `/customers/lookup/{doc}` | Consulta RENIEC/SUNAT |
| POST | `/customers` | Crear |
| PUT | `/customers/{id}` | Actualizar |
| DELETE | `/customers/{id}` | Eliminar |

### Facturación
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/billing/nubefact` | Config Nubefact |
| POST | `/billing/documents/emit` | Emitir documento |
| GET | `/billing/documents` | Listar documentos |

### Promociones
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/promotions` | Listar |
| GET | `/promotions/{id}` | Detalle |
| GET | `/promotions/{id}/products` | Productos vinculados |

### Configuración
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/branches` | Sucursales |
| GET | `/stores/{id}/series-config` | Series de facturación |
| GET | `/netsuite-cashier-accounts` | Cuentas de cajero NS |

---

## 10. Diferencias Clave vs App Web

| Aspecto | Web (Vue 3) | Mobile (Kotlin) |
|---------|-------------|-----------------|
| Impresora | QZ Tray (WebSocket a desktop) | SDK nativo del dispositivo |
| Escáner | Keyboard wedge + cámara browser | SDK nativo + CameraX |
| Pagos con tarjeta | No integrado (manual) | Pin pad integrado del dispositivo |
| Cash drawer | No integrado | Comando ESC/POS o SDK |
| Almacenamiento | localStorage | EncryptedDataStore + Room |
| Offline | No soportado | Básico (cache productos, cola órdenes) |
| source en órdenes | `pos` | `pos-mobile` |
| Distribución | URL (Netlify) | APK directo o MDM |

---

## 11. Consideraciones de Seguridad

- Tokens almacenados en `EncryptedSharedPreferences` / EncryptedDataStore
- PIN de cajero nunca se almacena localmente (siempre se valida contra API)
- Pantalla de bloqueo automático tras inactividad configurable (3/5/10 min)
- Certificate pinning para `api2.mitienda.pe`
- ProGuard/R8 para ofuscación del APK en release
- No almacenar datos de tarjeta — el SDK de pagos maneja todo el flujo PCI

---

## 12. Distribución y Actualización

- **Distribución:** APK firmado, instalación manual o vía MDM (Mobile Device Management)
- **No se publica en Google Play** (app para uso interno/comercial con dispositivos específicos)
- **Auto-update:** Verificar versión al iniciar contra endpoint del backend, descargar APK nuevo si disponible
- **Versionado:** Semantic versioning, version code incremental para Android

---

## 13. Métricas de Éxito

| Métrica | Target |
|---------|--------|
| Tiempo de venta (scan → ticket impreso) | < 15 segundos |
| Tiempo de apertura de app | < 3 segundos |
| Crash rate | < 0.5% |
| Uptime (no requiere reinicio) | > 12 horas continuas |
| Impresión de ticket | < 2 segundos |
