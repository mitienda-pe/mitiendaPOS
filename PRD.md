# Product Requirements Document (PRD)
## MiTiendaPOS - Sistema de Punto de Venta en la Nube

**Versión:** 1.0
**Fecha:** 17 de Octubre, 2025
**Autor:** Equipo MiTienda.pe
**Estado:** Draft

---

## 📋 Tabla de Contenidos

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Objetivos del Producto](#2-objetivos-del-producto)
3. [Usuarios Objetivo](#3-usuarios-objetivo)
4. [Casos de Uso](#4-casos-de-uso)
5. [Requisitos Funcionales](#5-requisitos-funcionales)
6. [Requisitos No Funcionales](#6-requisitos-no-funcionales)
7. [Arquitectura y Stack Tecnológico](#7-arquitectura-y-stack-tecnológico)
8. [Roadmap y Fases](#8-roadmap-y-fases)
9. [Métricas de Éxito](#9-métricas-de-éxito)
10. [Riesgos y Mitigaciones](#10-riesgos-y-mitigaciones)

---

## 1. Resumen Ejecutivo

MiTiendaPOS es un sistema de punto de venta en la nube, diseñado como parte del ecosistema de aplicaciones de MiTienda.pe. El objetivo es ofrecer una solución **ágil, básica y fácil de operar** que permita a pequeños y medianos comercios gestionar sus ventas diarias de manera eficiente, conectándose al API centralizado de MiTienda.pe.

### Propuesta de Valor
- ✅ **Rápido de implementar**: Instalación y configuración en menos de 30 minutos
- ✅ **Fácil de usar**: Interfaz intuitiva que no requiere capacitación extensiva
- ✅ **Accesible**: Funciona en cualquier navegador moderno (Chrome, Edge, Safari)
- ✅ **Integrado**: Conectado al ecosistema MiTienda.pe (eCommerce, Admin Panel)
- ✅ **Escalable**: Arquitectura cloud-first que crece con el negocio

### Diferenciadores
- Sin necesidad de instalación local
- Actualizaciones automáticas
- Acceso desde múltiples dispositivos
- Sincronización en tiempo real con inventario online
- Costo accesible (modelo SaaS)

---

## 2. Objetivos del Producto

### Objetivos de Negocio
1. **Completar el ecosistema MiTienda.pe** con una solución POS integrada
2. **Aumentar el ARPU** (Average Revenue Per User) ofreciendo un producto adicional
3. **Retener clientes** proporcionando herramientas que cubran todo el ciclo de venta
4. **Capturar datos de venta física** para análisis y recomendaciones

### Objetivos de Producto
1. Permitir **procesar ventas en menos de 30 segundos** por transacción
2. Soportar **operación offline básica** (guardar ventas localmente)
3. Proporcionar **reportes básicos en tiempo real**
4. Integrar **múltiples métodos de pago** (efectivo, tarjeta, transferencia)
5. Facilitar la **gestión de inventario** desde el punto de venta

### Objetivos de Usuario
1. **Cajeros**: Procesar ventas rápidamente sin errores
2. **Supervisores**: Monitorear ventas y stock en tiempo real
3. **Administradores**: Configurar el sistema y generar reportes
4. **Propietarios**: Tener visibilidad completa del negocio desde cualquier lugar

---

## 3. Usuarios Objetivo

### Perfil del Cliente Ideal (ICP)
- **Tipo de negocio**: Tiendas minoristas, boutiques, farmacias, minimarkets
- **Tamaño**: 1-10 empleados
- **Ubicación**: Perú (inicialmente)
- **Facturación**: S/ 50,000 - S/ 500,000 mensuales
- **Pain Points**:
  - Necesitan un POS pero las soluciones tradicionales son costosas
  - Quieren unificar ventas online y físicas
  - Buscan reportes y análisis sin complejidad

### Roles de Usuario

#### 👤 Cajero
- **Responsabilidades**: Procesar ventas, cobrar, emitir comprobantes
- **Acceso**: Módulo POS, consulta de clientes básica
- **Limitaciones**: No puede modificar precios, ver reportes completos

#### 👥 Supervisor
- **Responsabilidades**: Supervisar operaciones, resolver incidencias, reportes básicos
- **Acceso**: POS + Dashboard + Inventario + Ventas
- **Limitaciones**: No puede configurar el sistema

#### 👔 Administrador
- **Responsabilidades**: Configuración completa del sistema, gestión de usuarios
- **Acceso**: Acceso total a todos los módulos
- **Limitaciones**: Ninguna

---

## 4. Casos de Uso

### Caso de Uso 1: Venta Simple con Efectivo
**Actor**: Cajero
**Flujo**:
1. Cliente llega con 2 productos
2. Cajero escanea código de barras de cada producto (o busca manualmente)
3. Sistema muestra productos en carrito con subtotal
4. Cajero selecciona método de pago: Efectivo
5. Ingresa monto recibido
6. Sistema calcula cambio
7. Sistema actualiza inventario y genera ticket
8. Imprime ticket (opcional)

**Resultado**: Venta registrada en 20-30 segundos

---

### Caso de Uso 2: Venta con Múltiples Métodos de Pago
**Actor**: Cajero
**Flujo**:
1. Total de venta: S/ 500
2. Cliente desea pagar S/ 300 en efectivo y S/ 200 con tarjeta
3. Cajero agrega primer pago: Efectivo S/ 300
4. Sistema muestra saldo pendiente: S/ 200
5. Cajero agrega segundo pago: Tarjeta S/ 200
6. Sistema valida que saldo = 0
7. Confirma transacción y genera ticket con desglose de pagos

**Resultado**: Flexibilidad en formas de pago

---

### Caso de Uso 3: Búsqueda Rápida de Productos
**Actor**: Cajero
**Flujo**:
1. Cliente pide "camisa azul talla M"
2. Cajero escribe "camisa azul" en buscador
3. Sistema muestra resultados en tiempo real
4. Cajero selecciona producto correcto
5. Producto se agrega al carrito

**Resultado**: Búsqueda en menos de 5 segundos

---

### Caso de Uso 4: Consulta de Stock
**Actor**: Supervisor
**Flujo**:
1. Supervisor ingresa a módulo Inventario
2. Filtra por categoría "Ropa"
3. Sistema muestra listado con stock actual
4. Identifica productos con stock bajo (alerta visual)
5. Puede exportar reporte o hacer ajuste de inventario

**Resultado**: Visibilidad completa del inventario

---

### Caso de Uso 5: Venta Guardada (Sale on Hold)
**Actor**: Cajero
**Flujo**:
1. Cajero escanea 5 productos para Cliente A
2. Cliente A necesita buscar más productos
3. Cajero guarda la venta temporalmente
4. Atiende a Cliente B (nueva venta)
5. Completa venta de Cliente B
6. Recupera venta guardada de Cliente A
7. Completa la transacción

**Resultado**: Gestión eficiente de múltiples clientes

---

## 5. Requisitos Funcionales

### 5.1 Autenticación y Seguridad
| ID | Requisito | Prioridad | Estado |
|----|-----------|-----------|--------|
| AUTH-01 | Login con email y contraseña | 🔴 Alta | ✅ Completado |
| AUTH-02 | JWT tokens (access + refresh) | 🔴 Alta | ✅ Completado |
| AUTH-03 | Renovación automática de tokens | 🔴 Alta | ✅ Completado |
| AUTH-04 | Selección de tienda al iniciar sesión | 🔴 Alta | ✅ Completado |
| AUTH-05 | Control de acceso basado en roles | 🟡 Media | ⏳ Temporal |
| AUTH-06 | Logout y limpieza de sesión | 🔴 Alta | ✅ Completado |
| AUTH-07 | Recuperación de contraseña | 🟢 Baja | ⬜ Pendiente |

---

### 5.2 Módulo POS (Punto de Venta)
| ID | Requisito | Prioridad | Estado |
|----|-----------|-----------|--------|
| POS-01 | Búsqueda de productos por nombre/SKU | 🔴 Alta | ✅ Completado |
| POS-02 | Búsqueda por código de barras | 🔴 Alta | ✅ Completado |
| POS-03 | Agregar productos al carrito | 🔴 Alta | ✅ Completado |
| POS-04 | Modificar cantidad de productos | 🔴 Alta | ✅ Completado |
| POS-05 | Eliminar productos del carrito | 🔴 Alta | ✅ Completado |
| POS-06 | Calcular subtotal, IGV y total automáticamente | 🔴 Alta | ✅ Completado |
| POS-07 | Seleccionar cliente (opcional) | 🟡 Media | ⬜ Pendiente |
| POS-08 | Agregar cliente rápido (nombre + DNI) | 🟡 Media | ⬜ Pendiente |
| POS-09 | Múltiples métodos de pago | 🔴 Alta | ✅ Completado |
| POS-10 | Pagos combinados | 🔴 Alta | ✅ Completado |
| POS-11 | Calcular cambio (efectivo) | 🔴 Alta | ✅ Completado |
| POS-12 | Guardar venta temporalmente | 🟡 Media | ✅ Completado |
| POS-13 | Recuperar ventas guardadas | 🟡 Media | ✅ Completado |
| POS-14 | Generar ticket de venta | 🔴 Alta | ✅ Completado |
| POS-15 | Imprimir ticket (impresora térmica) | 🟡 Media | ⬜ Pendiente |
| POS-16 | Cancelar venta | 🔴 Alta | ✅ Completado |
| POS-17 | Actualizar stock al completar venta | 🔴 Alta | ✅ Completado |
| POS-18 | Seleccionar tipo de comprobante (Boleta/Factura) | 🟡 Media | ⬜ Pendiente |
| POS-19 | Aplicar descuentos manuales | 🟢 Baja | ⬜ Pendiente |
| POS-20 | Historial de últimas ventas (dentro del POS) | 🟢 Baja | ⬜ Pendiente |
| POS-21 | Notificación de orden a webhook externo (POST) | 🔴 Alta | ⬜ Pendiente |

---

### 5.3 Módulo de Inventario
| ID | Requisito | Prioridad | Estado |
|----|-----------|-----------|--------|
| INV-01 | Listar todos los productos | 🔴 Alta | ✅ Completado |
| INV-02 | Buscar productos por nombre/SKU | 🔴 Alta | ✅ Completado |
| INV-03 | Filtrar por categoría | 🟡 Media | ⬜ Pendiente |
| INV-04 | Filtrar por stock (bajo stock, sin stock, publicado) | 🟡 Media | ✅ Completado |
| INV-05 | Ver detalles de producto | 🔴 Alta | ✅ Completado |
| INV-06 | Edición rápida de precio y stock | 🔴 Alta | ✅ Completado |
| INV-07 | Ver historial de movimientos de stock | 🟢 Baja | ⬜ Pendiente |
| INV-08 | Alertas de stock mínimo | 🟡 Media | ✅ Completado |
| INV-09 | Sincronización con productos del Admin Panel | 🔴 Alta | ✅ Completado |
| INV-10 | Paginación de productos | 🔴 Alta | ✅ Completado |
| INV-11 | Estadísticas de inventario (totales) | 🟡 Media | ✅ Completado |

**Nota**: La creación, edición completa y categorización de productos se hace desde el **Admin Panel** (backoffice), no desde el POS.

**Implementación**:
- ✅ Store Pinia completo con estado reactivo
- ✅ Modal de edición rápida (precio y stock)
- ✅ Badges visuales para estado de stock (Disponible/Bajo Stock/Sin Stock)
- ✅ Filtros funcionales con API real
- ✅ Solo muestra productos publicados por defecto

---

### 5.4 Módulo de Clientes
| ID | Requisito | Prioridad | Estado |
|----|-----------|-----------|--------|
| CLI-01 | Listar clientes | 🟡 Media | ✅ Completado |
| CLI-02 | Buscar cliente por nombre/DNI/RUC | 🟡 Media | ✅ Completado |
| CLI-03 | Ver detalle de cliente | 🟡 Media | ✅ Completado |
| CLI-04 | Ver historial de compras de cliente | 🟢 Baja | ⬜ Pendiente |
| CLI-05 | Crear cliente desde vista Clientes | 🟡 Media | ✅ Completado |
| CLI-06 | Crear cliente rápido desde POS | 🟡 Media | ⬜ Pendiente |
| CLI-07 | Editar cliente | 🟡 Media | ✅ Completado |
| CLI-08 | Eliminar cliente (soft delete) | 🟡 Media | ✅ Completado |
| CLI-09 | Consulta DNI vía RENIEC (Decolecta) | 🔴 Alta | ✅ Completado |
| CLI-10 | Consulta RUC vía SUNAT (Decolecta) | 🔴 Alta | ✅ Completado |
| CLI-11 | Detección de clientes duplicados | 🟡 Media | ✅ Completado |
| CLI-12 | Paginación de clientes | 🔴 Alta | ✅ Completado |
| CLI-13 | Sincronización con clientes del Admin Panel | 🔴 Alta | ✅ Completado |

**Implementación**:
- ✅ Store Pinia completo con gestión de estado
- ✅ Búsqueda con debounce (500ms) para optimización
- ✅ Modal de creación/edición con validaciones
- ✅ Integración con API de Decolecta para validación de documentos
- ✅ Búsqueda en base de datos antes de crear duplicados
- ✅ Soporte para DNI (8 dígitos) y RUC (11 dígitos)
- ✅ Auto-población de datos desde RENIEC/SUNAT

---

### 5.5 Módulo de Ventas (Historial)
| ID | Requisito | Prioridad | Estado |
|----|-----------|-----------|--------|
| VEN-01 | Listar ventas del día | 🔴 Alta | ✅ Completado |
| VEN-02 | Filtrar por rango de fechas | 🟡 Media | ✅ Completado |
| VEN-03 | Filtrar por estado (Aprobado, Pendiente, etc.) | 🟡 Media | ✅ Completado |
| VEN-04 | Filtrar por fuente (Web, POS, App) | 🟡 Media | ✅ Completado |
| VEN-05 | Buscar venta por número/cliente | 🟡 Media | ⬜ Pendiente |
| VEN-06 | Ver detalle completo de venta | 🔴 Alta | ✅ Completado |
| VEN-07 | Vista de ticket estilo recibo térmico | 🔴 Alta | ✅ Completado |
| VEN-08 | Reimprimir ticket (vista previa) | 🟡 Media | ✅ Completado |
| VEN-09 | Mostrar cajero que atendió la venta | 🟡 Media | ⚠️ Backend listo |
| VEN-10 | Exportar reporte de ventas (CSV/Excel) | 🟢 Baja | ⬜ Pendiente |
| VEN-11 | Ver totales del día (resumen) | 🔴 Alta | ⬜ Pendiente |
| VEN-12 | Paginación de ventas | 🔴 Alta | ✅ Completado |
| VEN-13 | Formato de número de orden POS{tienda_id}{hash4} | 🔴 Alta | ✅ Completado |

**Implementación**:
- ✅ Listado con filtros predeterminados (Estado: Aprobado, Fuente: Web, Fecha: Hoy)
- ✅ Vista detalle full-screen con formato de ticket térmico
- ✅ Compatibilidad con múltiples formatos de datos (order_items y products)
- ✅ Mapeo inteligente de datos de cliente (directo y desde billing_info)
- ✅ Truncado de nombres de cliente a 36 caracteres
- ⚠️ Campo cajero_nombre: Backend listo, requiere ejecutar migración en BD (timeout issue)

---

### 5.6 Módulo de Dashboard
| ID | Requisito | Prioridad | Estado |
|----|-----------|-----------|--------|
| DASH-01 | Ventas del día (monto total) | 🔴 Alta | ⬜ Pendiente |
| DASH-02 | Número de transacciones del día | 🔴 Alta | ⬜ Pendiente |
| DASH-03 | Ticket promedio | 🟡 Media | ⬜ Pendiente |
| DASH-04 | Productos más vendidos (top 5) | 🟡 Media | ⬜ Pendiente |
| DASH-05 | Gráfico de ventas por hora | 🟢 Baja | ⬜ Pendiente |
| DASH-06 | Gráfico de ventas por método de pago | 🟢 Baja | ⬜ Pendiente |
| DASH-07 | Productos con stock bajo | 🟡 Media | ⬜ Pendiente |
| DASH-08 | Comparativa semanal/mensual | 🟢 Baja | ⬜ Pendiente |

---

### 5.7 Módulo de Caja (Apertura/Cierre)
| ID | Requisito | Prioridad | Estado |
|----|-----------|-----------|--------|
| CAJA-01 | Apertura de caja (monto inicial) | 🟡 Media | ✅ Completado |
| CAJA-02 | Cierre de caja (conteo de efectivo) | 🟡 Media | ✅ Completado |
| CAJA-03 | Reporte de movimientos de caja | 🟡 Media | ✅ Completado |
| CAJA-04 | Arqueo de caja (diferencias) | 🟡 Media | ✅ Completado |
| CAJA-05 | Validación de turno activo antes de vender | 🔴 Alta | ✅ Completado |
| CAJA-06 | Retiros de caja | 🟢 Baja | ⬜ Pendiente |
| CAJA-07 | Historial de aperturas/cierres | 🟢 Baja | ⬜ Pendiente |

**Implementación**:
- ✅ Modal de apertura con monto inicial
- ✅ Modal de cierre con conteo por denominación
- ✅ Cálculo automático de diferencias (esperado vs contado)
- ✅ Store Pinia con estado de turno activo
- ✅ Validación en POS: no permite vender sin turno abierto
- ✅ Backend completo con endpoints CRUD para turnos

---

### 5.8 Módulo de Devoluciones y Cambios
| ID | Requisito | Prioridad | Estado |
|----|-----------|-----------|--------|
| DEV-01 | Buscar venta original | 🟡 Media | ⬜ Pendiente |
| DEV-02 | Seleccionar productos a devolver | 🟡 Media | ⬜ Pendiente |
| DEV-03 | Motivo de devolución | 🟡 Media | ⬜ Pendiente |
| DEV-04 | Reintegro de stock | 🟡 Media | ⬜ Pendiente |
| DEV-05 | Generar nota de crédito | 🟢 Baja | ⬜ Pendiente |
| DEV-06 | Cambio por otro producto | 🟢 Baja | ⬜ Pendiente |

---

### 5.9 Módulo de Documentos Fiscales
| ID | Requisito | Prioridad | Estado |
|----|-----------|-----------|--------|
| DOC-01 | Generación de Boleta de Venta | 🟡 Media | ⬜ Pendiente |
| DOC-02 | Generación de Factura | 🟡 Media | ⬜ Pendiente |
| DOC-03 | Integración con SUNAT (Facturación Electrónica) | 🟢 Baja | ⬜ Pendiente |
| DOC-04 | Nota de Crédito | 🟢 Baja | ⬜ Pendiente |
| DOC-05 | Nota de Débito | 🟢 Baja | ⬜ Pendiente |
| DOC-06 | Consulta de documentos emitidos | 🟡 Media | ⬜ Pendiente |

---

### 5.10 Módulo de Integraciones
| ID | Requisito | Prioridad | Estado |
|----|-----------|-----------|--------|
| INT-01 | Configurar webhook URL por tienda | 🔴 Alta | ⬜ Pendiente |
| INT-02 | Notificar orden a webhook al completar venta | 🔴 Alta | ⬜ Pendiente |
| INT-03 | Formato de payload configurable (JSON) | 🔴 Alta | ⬜ Pendiente |
| INT-04 | Reintentos automáticos en caso de fallo | 🔴 Alta | ⬜ Pendiente |
| INT-05 | Log de notificaciones enviadas | 🟡 Media | ⬜ Pendiente |
| INT-06 | Autenticación del webhook (API Key, Basic Auth) | 🔴 Alta | ⬜ Pendiente |
| INT-07 | Headers personalizados para webhook | 🟡 Media | ⬜ Pendiente |
| INT-08 | Testing de webhook desde configuración | 🟡 Media | ⬜ Pendiente |
| INT-09 | Soporte para múltiples webhooks por tienda | 🟢 Baja | ⬜ Pendiente |
| INT-10 | Integración con Oracle NetSuite (mapping de campos) | 🔴 Alta | ⬜ Pendiente |

**Nota importante sobre integraciones**:
- El webhook debe dispararse **después** de que la orden se registre exitosamente en el API de MiTienda.pe
- El payload debe incluir toda la información de la orden (productos, cliente, pagos, totales)
- Debe ser resiliente: si el webhook falla, la orden debe guardarse igualmente
- El cliente puede configurar el webhook desde el Admin Panel o directamente en la configuración de la tienda

---

### 5.11 Módulos Futuros (Baja Prioridad)
- **Promociones y Descuentos**: Aplicar ofertas automáticas
- **Vales y Tarjetas de Regalo**: Gestión de gift cards
- **Sucursales**: Multi-tienda (múltiples puntos de venta)
- **Preferencias**: Configuración avanzada del sistema

---

## 6. Requisitos No Funcionales

### 6.1 Rendimiento
| Requisito | Métrica | Estado |
|-----------|---------|--------|
| Tiempo de carga inicial | < 3 segundos | ⬜ |
| Tiempo de búsqueda de productos | < 500 ms | ✅ |
| Tiempo de procesamiento de venta | < 2 segundos | ⬜ |
| Actualización de stock en tiempo real | < 1 segundo | ⬜ |

### 6.2 Escalabilidad
- Soportar **hasta 100 transacciones por hora** por tienda
- Catálogo de **hasta 10,000 productos** sin degradación de rendimiento
- Soportar **hasta 50 tiendas** en una sola cuenta (multi-tienda)

### 6.3 Disponibilidad
- **Uptime objetivo**: 99.5% (SLA)
- **Operación offline**: Guardar ventas localmente y sincronizar cuando se restablezca conexión
- **Recuperación ante fallos**: < 5 minutos

### 6.4 Seguridad
- ✅ Autenticación JWT con tokens de corta duración
- ✅ HTTPS en todas las comunicaciones
- 🔄 Encriptación de datos sensibles (tarjetas, tokens)
- 🔄 Logs de auditoría para todas las transacciones
- 🔄 Protección contra ataques CSRF y XSS

### 6.5 Usabilidad
- **Interfaz intuitiva**: Un cajero sin experiencia debe poder operar el sistema con menos de 1 hora de capacitación
- **Diseño responsive**: Funcionar en tablets y dispositivos táctiles
- **Accesibilidad**: Cumplir con estándares WCAG 2.1 nivel AA (texto legible, contraste, navegación por teclado)

### 6.6 Compatibilidad
- **Navegadores soportados**:
  - Chrome (últimas 2 versiones)
  - Edge (últimas 2 versiones)
  - Safari (últimas 2 versiones)
  - Firefox (últimas 2 versiones)
- **Dispositivos**:
  - Desktop (Windows, macOS, Linux)
  - Tablets (iPad, Android tablets)
  - (Futuro) Aplicación nativa móvil

### 6.7 Mantenibilidad
- Código modular y documentado
- Tests unitarios (cobertura > 70%)
- Tests E2E para flujos críticos
- Logs estructurados y monitoreo con alertas

---

## 7. Arquitectura y Stack Tecnológico

### 7.1 Arquitectura General

```
┌─────────────────────────────────────────────────────────────┐
│                      ECOSISTEMA MITIENDA.PE                  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌───────────────┐  ┌───────────────┐  ┌──────────────┐    │
│  │   eCommerce   │  │  Admin Panel  │  │  MiTiendaPOS │    │
│  │   (Tienda)    │  │  (Backoffice) │  │  (Frontend)  │    │
│  │   Frontend    │  │   Frontend    │  │   Vue 3      │    │
│  └───────┬───────┘  └───────┬───────┘  └──────┬───────┘    │
│          │                  │                  │             │
│          └──────────────────┴──────────────────┘             │
│                             │                                │
│                             ▼                                │
│                   ┌──────────────────┐                       │
│                   │   API Gateway    │                       │
│                   │  api2.mitienda.pe│                       │
│                   └────────┬─────────┘                       │
│                            │                                 │
│            ┌───────────────┼───────────────┐                │
│            ▼               ▼               ▼                 │
│     ┌──────────┐   ┌──────────┐   ┌──────────┐             │
│     │ Products │   │  Orders  │   │   Users  │             │
│     │  Service │   │  Service │   │  Service │             │
│     └────┬─────┘   └────┬─────┘   └────┬─────┘             │
│          │              │              │                     │
│          └──────────────┴──────────────┘                     │
│                         │                                    │
│                         ▼                                    │
│                  ┌────────────┐                              │
│                  │  Database  │                              │
│                  │   MySQL    │                              │
│                  └────────────┘                              │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### 7.2 Frontend (MiTiendaPOS)

**Stack Actual**:
- ✅ **Vue 3** (Composition API)
- ✅ **Vite** (Build tool)
- ✅ **Pinia** (State management)
- ✅ **Vue Router** (Routing)
- ✅ **Axios** (HTTP client)
- ✅ **Tailwind CSS** (Styling)
- ✅ **Lucide Icons** (Iconografía)

**Integraciones Externas**:
- 🔄 **Webhooks**: Notificación de órdenes a sistemas externos (Oracle NetSuite, ERPs, etc.)

**Estructura de Carpetas**:
```
src/
├── api/              # Mock APIs (deprecated)
├── services/         # API services (real)
│   ├── axios.js
│   ├── authApi.js
│   ├── productsApi.js
│   ├── ordersApi.js  (pendiente)
│   └── customersApi.js (pendiente)
├── components/       # Componentes reutilizables
├── views/            # Páginas/Vistas
├── stores/           # Pinia stores
├── router/           # Configuración de rutas
├── assets/           # Assets estáticos
└── utils/            # Utilidades
```

### 7.3 Backend (API)

**Stack**:
- **CodeIgniter 4** (PHP Framework)
- **MySQL** (Base de datos)
- **JWT** (Autenticación)
- **RESTful API**

**Endpoints Clave** (ya implementados):
- `POST /auth/login`
- `POST /auth/refresh`
- `GET /api/v1/user/profile`
- `GET /api/v1/user/stores`
- `POST /api/v1/user/store/select`
- `GET /api/v1/products`
- `GET /api/v1/products/{id}`
- `PUT /api/v1/products/{id}`

**Endpoints Pendientes**:
- `POST /api/v1/orders` (crear orden/venta) - **Con webhook notification**
- `GET /api/v1/orders` (listar ventas)
- `GET /api/v1/orders/{id}` (detalle de venta)
- `GET /api/v1/customers` (listar clientes)
- `POST /api/v1/customers` (crear cliente rápido)
- `GET /api/v1/stores/{id}/webhooks` (obtener configuración de webhooks)
- `PUT /api/v1/stores/{id}/webhooks` (actualizar configuración de webhooks)
- `POST /api/v1/webhooks/test` (probar webhook)

### 7.4 Sistema de Webhooks

**Flujo de Notificación**:

```
┌──────────────┐     1. Crear      ┌─────────────┐
│  MiTiendaPOS │ ────Orden──────▶  │  API Server │
│   Frontend   │                   │ api2.mitienda│
└──────────────┘                   └──────┬──────┘
                                          │
                                   2. Guardar en DB
                                          │
                                          ▼
                                   ┌─────────────┐
                                   │   MySQL     │
                                   └──────┬──────┘
                                          │
                                   3. Trigger Webhook
                                          │
                    ┌─────────────────────┼─────────────────────┐
                    ▼                     ▼                     ▼
             ┌─────────────┐      ┌─────────────┐      ┌─────────────┐
             │   Oracle    │      │   Custom    │      │   Zapier    │
             │  NetSuite   │      │   ERP/CRM   │      │Integration  │
             └─────────────┘      └─────────────┘      └─────────────┘
```

**Características del Sistema de Webhooks**:
- ✅ **Asíncrono**: No bloquea la respuesta de creación de orden
- ✅ **Reintentos**: 3 intentos con backoff exponencial (5s, 25s, 125s)
- ✅ **Idempotente**: Incluye `order_id` para evitar duplicados
- ✅ **Timeout**: 30 segundos por intento
- ✅ **Logs**: Registro completo de intentos y respuestas
- ✅ **Queue**: Sistema de cola para evitar sobrecarga

**Payload de Ejemplo (JSON)**:
```json
{
  "event": "order.created",
  "timestamp": "2025-10-17T14:30:00Z",
  "store_id": 10715,
  "store_name": "Mi Tienda Demo",
  "order": {
    "id": "ORD-2025-001234",
    "order_number": "001234",
    "created_at": "2025-10-17T14:30:00Z",
    "status": "completed",
    "subtotal": 100.00,
    "tax": 18.00,
    "tax_rate": 0.18,
    "total": 118.00,
    "currency": "PEN",
    "document_type": "boleta",
    "customer": {
      "id": 456,
      "name": "Juan Pérez",
      "email": "juan@example.com",
      "phone": "+51987654321",
      "document_type": "DNI",
      "document_number": "12345678"
    },
    "items": [
      {
        "product_id": 789,
        "sku": "PROD-001",
        "name": "Producto Ejemplo",
        "quantity": 2,
        "unit_price": 50.00,
        "subtotal": 100.00,
        "tax": 18.00,
        "total": 118.00
      }
    ],
    "payments": [
      {
        "method": "cash",
        "method_name": "Efectivo",
        "amount": 100.00,
        "reference": null
      },
      {
        "method": "card",
        "method_name": "Tarjeta",
        "amount": 18.00,
        "reference": "AUTH-123456"
      }
    ],
    "cashier": {
      "id": 12,
      "name": "Ana García",
      "email": "ana@mitienda.pe"
    }
  }
}
```

**Configuración por Tienda** (tabla `webhooks_config`):
```json
{
  "store_id": 10715,
  "webhook_url": "https://sistema-cliente.com/api/webhooks/orders",
  "authentication": {
    "type": "bearer", // o "basic", "api_key"
    "token": "sk_live_xxxxxxxxxxxxx"
  },
  "custom_headers": {
    "X-Custom-Header": "value"
  },
  "events": ["order.created", "order.updated", "order.cancelled"],
  "enabled": true,
  "retry_policy": {
    "max_retries": 3,
    "backoff": "exponential"
  }
}
```

### 7.5 Infraestructura

- **Hosting Frontend**: Vercel / Netlify (recomendado)
- **Hosting Backend**: VPS / Cloud (ya existente en api2.mitienda.pe)
- **Base de Datos**: MySQL (compartida con otros servicios)
- **Queue System**: Redis (para webhooks asíncronos)
- **CDN**: Cloudflare (para assets estáticos)
- **Monitoreo**: (por definir - Sentry, LogRocket)

---

## 8. Roadmap y Fases

### 🎯 **Fase 0: MVP Core (Completado ~85%)**
**Duración**: 2-3 semanas
**Estado**: Casi completo

#### Completado ✅
- [x] Autenticación con JWT
- [x] Selección de tienda con múltiples opciones
- [x] Búsqueda de productos (API real)
- [x] Carrito de compras funcional
- [x] Pagos combinados (múltiples métodos)
- [x] Generación de ticket térmico
- [x] Actualización de stock automática
- [x] Módulo de Inventario completo
- [x] Módulo de Clientes con Decolecta
- [x] Módulo de Ventas (Historial)
- [x] Gestión de turnos de caja (apertura/cierre)
- [x] Guardado temporal de ventas (Sale on Hold)
- [x] Vista detalle de venta con ticket

#### Pendiente ⬜
- [ ] Crear endpoint `POST /api/v1/orders` (Backend) - **CRÍTICO**
- [ ] Implementar sistema de webhooks en el backend
- [ ] Integrar creación de órdenes con el API (Frontend)
- [ ] Notificación automática a webhook externo (Oracle NetSuite u otros)
- [ ] Configuración de webhook desde Admin Panel
- [ ] Selección de cliente en el POS
- [ ] Cliente rápido desde modal de venta (nombre + DNI)
- [ ] Tipo de comprobante (Boleta/Factura)
- [ ] Testing completo del flujo de venta + webhook
- [ ] Ejecutar migración de cajero_id en producción

**Criterio de Éxito**: Un cajero puede realizar una venta completa de principio a fin, el sistema registra la orden en el backend Y notifica exitosamente al sistema externo del cliente (ej: Oracle NetSuite).

**Avance**: 85% completo. Módulos de soporte (Inventario, Clientes, Ventas, Caja) están completos. Falta conectar el flujo principal de venta con el backend.

---

### 🎯 **Fase 1: Funcionalidad Operativa Completa (Completado ~90%)**
**Duración**: 3-4 semanas
**Estado**: Casi completo

#### Completado ✅
- [x] **Inventario**:
  - Listar productos con filtros y paginación
  - Edición rápida (precio, stock) con modal
  - Alertas de stock bajo con badges visuales
  - Búsqueda en tiempo real
  - Solo productos publicados
  - Estadísticas de inventario

- [x] **Ventas (Historial)**:
  - Listar ventas con filtros (estado, fuente, fecha)
  - Ver detalle completo estilo ticket
  - Reimprimir ticket (vista previa)
  - Paginación funcional
  - Formato de orden POS{tienda_id}{hash4}
  - Mapeo inteligente de datos históricos

- [x] **Caja**:
  - Apertura de caja con monto inicial
  - Cierre de caja con conteo
  - Arqueo automático (diferencias)
  - Validación de turno activo

- [x] **Clientes**:
  - Listar clientes con paginación
  - Buscar por DNI/nombre/email/teléfono
  - Crear/editar/eliminar clientes
  - Consulta RENIEC/SUNAT (Decolecta)
  - Detección de duplicados

#### Pendiente ⬜
- [ ] **Dashboard**:
  - Ventas del día
  - Número de transacciones
  - Ticket promedio
  - Top 5 productos
  - Gráficos visuales

- [ ] **Clientes**:
  - Ver historial de compras por cliente

**Criterio de Éxito**: Cajeros y supervisores pueden operar el POS completamente sin depender del Admin Panel.

**Avance**: 90% completo. Solo falta Dashboard y historial de compras por cliente.

---

### 🎯 **Fase 2: Funcionalidades Avanzadas**
**Duración**: 4-6 semanas

#### Módulos a Implementar
- [ ] **Caja**:
  - Apertura de caja
  - Cierre de caja
  - Arqueo
- [ ] **Devoluciones y Cambios**:
  - Buscar venta
  - Procesar devolución
  - Reintegro de stock
- [ ] **Documentos Fiscales**:
  - Generación de Boletas
  - Generación de Facturas
  - Integración básica con SUNAT (opcional)
- [ ] **Impresión Térmica**:
  - Soporte para impresoras ESC/POS
  - Configuración de impresora
- [ ] **Operación Offline**:
  - IndexedDB para almacenamiento local
  - Sincronización automática al recuperar conexión

**Criterio de Éxito**: El POS puede operar de manera autónoma, incluso sin conexión a internet temporal.

---

### 🎯 **Fase 3: Optimización y Escalabilidad**
**Duración**: 2-3 semanas

#### Mejoras Técnicas
- [ ] Optimización de rendimiento (lazy loading, code splitting)
- [ ] PWA (Progressive Web App) - Instalable
- [ ] Tests E2E completos (Cypress/Playwright)
- [ ] Documentación técnica completa
- [ ] Monitoreo y alertas (Sentry, LogRocket)

#### Mejoras de UX
- [ ] Onboarding interactivo para nuevos usuarios
- [ ] Tooltips y ayuda contextual
- [ ] Atajos de teclado para operaciones rápidas
- [ ] Modo oscuro (opcional)

**Criterio de Éxito**: Sistema estable, rápido y fácil de mantener.

---

### 🎯 **Fase 4: Funcionalidades Premium (Futuro)**
**Duración**: TBD

- [ ] Multi-tienda (Sucursales)
- [ ] Promociones automáticas
- [ ] Programa de fidelización (puntos)
- [ ] Vales y Gift Cards
- [ ] Integración con pasarelas de pago online
- [ ] Reportes avanzados y analytics
- [ ] Aplicación móvil nativa (iOS/Android)

---

## 9. Métricas de Éxito

### KPIs de Producto

| Métrica | Objetivo | Frecuencia |
|---------|----------|------------|
| **Tiempo promedio de venta** | < 30 segundos | Diaria |
| **Tasa de error en ventas** | < 1% | Semanal |
| **Uptime del sistema** | > 99.5% | Mensual |
| **Adopción de usuarios** | > 80% de clientes MiTienda activos | Mensual |
| **NPS (Net Promoter Score)** | > 50 | Trimestral |

### KPIs de Negocio

| Métrica | Objetivo | Frecuencia |
|---------|----------|------------|
| **Usuarios activos mensuales (MAU)** | 100 tiendas en 6 meses | Mensual |
| **Tasa de retención** | > 90% | Mensual |
| **Ticket promedio de venta** | Monitorear evolución | Mensual |
| **Transacciones procesadas** | 10,000/mes en 6 meses | Mensual |

### KPIs Técnicos

| Métrica | Objetivo |
|---------|----------|
| **Cobertura de tests** | > 70% |
| **Tiempo de carga inicial** | < 3 segundos |
| **Tiempo de respuesta de API** | < 500ms (p95) |
| **Errores de frontend** | < 0.1% de sesiones |

---

## 10. Riesgos y Mitigaciones

### Riesgos Técnicos

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| **Pérdida de conexión a internet** | Alta | Alto | Implementar modo offline con sincronización automática |
| **Fallas del API** | Media | Alto | Implementar retry logic, circuit breaker y cache local |
| **Rendimiento con catálogos grandes** | Media | Medio | Paginación, lazy loading, índices en BD |
| **Problemas de compatibilidad de navegadores** | Baja | Medio | Testing en múltiples navegadores, polyfills |

### Riesgos de Negocio

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| **Baja adopción por parte de usuarios** | Media | Alto | Onboarding claro, soporte activo, capacitaciones |
| **Competencia con soluciones establecidas** | Alta | Alto | Diferenciación por integración con ecosistema, precio competitivo |
| **Cambios en regulaciones fiscales (SUNAT)** | Media | Alto | Mantener integración modular y actualizable |

### Riesgos Operativos

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| **Falta de recursos de desarrollo** | Media | Alto | Priorización clara, roadmap realista |
| **Dependencias con el API compartido** | Media | Medio | Coordinación estrecha con equipo de backend |
| **Cambios de alcance frecuentes** | Alta | Medio | Definición clara de MVP, control de cambios |

---

## 11. Dependencias y Supuestos

### Dependencias Externas
- ✅ API de MiTienda.pe debe estar disponible y estable
- ⬜ Endpoints de órdenes/ventas deben implementarse en el backend
- ⬜ Documentación del API debe estar actualizada
- ⬜ Permisos y roles deben estar sincronizados entre sistemas

### Supuestos
- El usuario tiene conexión a internet estable (al menos 3G)
- El usuario tiene un navegador moderno actualizado
- El usuario tiene permisos adecuados en su cuenta de MiTienda.pe
- Los productos ya están cargados desde el Admin Panel

---

## 12. Glosario

- **POS**: Point of Sale (Punto de Venta)
- **SKU**: Stock Keeping Unit (Código de producto)
- **JWT**: JSON Web Token (Token de autenticación)
- **IGV**: Impuesto General a las Ventas (18% en Perú)
- **Boleta**: Comprobante de venta para consumidores finales
- **Factura**: Comprobante de venta para empresas (con RUC)
- **DNI**: Documento Nacional de Identidad
- **RUC**: Registro Único de Contribuyentes
- **SUNAT**: Superintendencia Nacional de Aduanas y de Administración Tributaria
- **ESC/POS**: Estándar de comandos para impresoras térmicas
- **PWA**: Progressive Web App (aplicación web instalable)

---

## 13. Apéndice

### Recursos Adicionales
- [API_INTEGRATION.md](API_INTEGRATION.md) - Documentación de integración con el API
- [README.md](README.md) - Documentación del proyecto
- [Figma Mockups](#) - (pendiente)
- [User Stories](#) - (pendiente)

### Contactos del Proyecto
- **Product Owner**: (pendiente)
- **Tech Lead**: Carlos Vidal (carlos@mitienda.pe)
- **Backend Team**: (pendiente)
- **Frontend Team**: (pendiente)

---

**Última actualización**: 17 de Octubre, 2025
**Próxima revisión**: Cada 2 semanas (Sprint review)
