# Resumen de Implementación - POS con Backend Real

## 📅 Fecha: 2025-10-17

Este documento resume todos los cambios implementados para integrar el sistema POS con el backend de producción.

---

## 🎯 Objetivos Completados

✅ **Diferenciación de ventas por origen** (Web, POS, API)
✅ **Endpoint dedicado para ventas del POS**
✅ **Sistema de webhooks para notificar a Oracle NetSuite**
✅ **Soporte para múltiples métodos de pago**
✅ **Actualización automática de inventario**
✅ **Generación de números de orden únicos**

---

## 📂 Archivos Modificados

### Backend (mitienda-api-ci4)

#### 1. **app/Models/OrderModel.php**
**Cambio**: Agregado campo `tiendaventa_origen` al array `$allowedFields`

```php
protected $allowedFields = [
    'tienda_id',
    'tiendacliente_id',
    'tiendaventa_codigoreferencia',
    'tiendaventa_fecha',
    'tiendaventa_pagado',
    'tiendaventa_origen', // ← NUEVO
    'tiendaventa_montoenvio',
    // ... resto de campos
];
```

#### 2. **app/Controllers/V1/Order.php**
**Cambios**:
- ✅ Agregado filtro por `source` en método `index()` (línea 27, 41-45)
- ✅ Nuevo método `createFromPOS()` (línea 255-373)
- ✅ Métodos auxiliares:
  - `generateOrderNumber()` - Genera números únicos (POS-YYYY-MM-NNNNNN)
  - `getDocumentTypeId()` - Mapea tipos de documento
  - `getCurrencyId()` - Mapea monedas
  - `getPaymentGatewayId()` - Mapea métodos de pago
  - `savePOSPayments()` - Guarda pagos múltiples
  - `getPaymentMethodName()` - Nombres de métodos de pago
  - `sendWebhookNotification()` - Envía webhooks a sistemas externos

**Nota**: El archivo `app/Config/Routes.php` debe actualizarse **manualmente** en el servidor.

### Frontend (mitienda-POS)

#### 3. **src/services/ordersApi.js**
**Cambios**:
- ✅ Actualizado endpoint de `createOrder()` a `/api/v1/orders/pos` (línea 6)
- ✅ Agregado filtro `source` en `getOrders()` (línea 20)

---

## 🗄️ Migraciones de Base de Datos

### Migración 1: Campo tiendaventa_origen
**Archivo**: `backend_migrations/01_add_tiendaventa_origen.sql`

```sql
ALTER TABLE tiendasventas
ADD COLUMN tiendaventa_origen ENUM('web', 'pos', 'api') DEFAULT NULL
AFTER tiendaventa_pagado;

ALTER TABLE tiendasventas
ADD INDEX idx_origen (tiendaventa_origen),
ADD INDEX idx_tienda_origen (tienda_id, tiendaventa_origen);
```

**Importante**: Si `tiendaventa_origen` es NULL, se asume que es 'web' (tienda virtual).

### Migración 2: Tablas Auxiliares
**Archivo**: `backend_migrations/02_create_auxiliary_tables.sql`

**Tablas creadas**:

1. **tiendasventas_pagos_pos**: Registro de pagos múltiples del POS
   - Campos: id, tiendaventa_id, metodo, metodo_nombre, monto, referencia, fecha

2. **webhooks_config**: Configuración de webhooks por tienda
   - Campos: id, tienda_id, webhook_url, auth_type, auth_token, enabled, events, retry_enabled, max_retries

3. **webhooks_log**: Auditoría de webhooks enviados
   - Campos: id, tienda_id, tiendaventa_id, webhook_url, event_type, payload, response_code, response_body, retry_count, fecha

---

## 🔌 API Endpoints

### Nuevo Endpoint: Crear Orden desde POS

```
POST /api/v1/orders/pos
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "customer_id": null,
  "customer_name": "Cliente General",
  "customer_email": "cliente@example.com",
  "customer_phone": "987654321",
  "customer_document": "12345678",
  "document_type": "boleta",
  "currency": "PEN",
  "items": [
    {
      "product_id": 123,
      "sku": "PROD-001",
      "name": "Producto Ejemplo",
      "quantity": 2,
      "unit_price": 50.00
    }
  ],
  "payments": [
    {
      "method": "cash",
      "method_name": "Efectivo",
      "amount": 118.00,
      "reference": null
    }
  ],
  "subtotal": 100.00,
  "tax": 18.00,
  "total": 118.00
}
```

**Response**:
```json
{
  "error": 0,
  "message": "Orden creada exitosamente",
  "data": {
    "order_id": 12345,
    "order_number": "POS-2025-10-000001",
    "status": "completed",
    "created_at": "2025-10-17 15:30:00",
    "webhook_sent": true
  }
}
```

### Endpoint Actualizado: Listar Órdenes

```
GET /api/v1/orders?source=pos&page=1&limit=20
Authorization: Bearer {access_token}
```

**Parámetros**:
- `source` (opcional): Filtra por origen: `web`, `pos`, `api`
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Registros por página (default: 20)
- `status` (opcional): Estado del pago: 0, 1, 2
- `search` (opcional): Búsqueda por código, nombre, email

---

## 💳 Métodos de Pago Soportados

El sistema mapea los métodos de pago del POS a las pasarelas existentes:

| Método POS | ID Pasarela | Nombre |
|------------|-------------|--------|
| cash | 4 | Pago Contra Entrega |
| card | 2 | Culqi (Tarjetas) |
| transfer | 5 | Depósito/Transferencia |
| yape | 12 | Yape |
| plin | 10 | Plin |
| gift_card | 4 | Tarjeta de Regalo (temporal) |
| points | 4 | Puntos (temporal) |

---

## 🔔 Sistema de Webhooks

### Payload Enviado

Cuando se crea una orden desde el POS, se envía el siguiente payload al webhook configurado:

```json
{
  "event": "order.created",
  "timestamp": "2025-10-17T15:30:00-05:00",
  "store_id": 10715,
  "order": {
    "id": 12345,
    "order_number": "POS-2025-10-000001",
    "created_at": "2025-10-17 15:30:00",
    "status": "completed",
    "source": "pos",
    "subtotal": 100.00,
    "tax": 18.00,
    "tax_rate": 0.18,
    "total": 118.00,
    "currency": "PEN",
    "document_type": "boleta",
    "customer": {
      "name": "Cliente General",
      "email": "cliente@example.com",
      "phone": "987654321",
      "document_number": "12345678"
    },
    "items": [
      {
        "product_id": 123,
        "sku": "PROD-001",
        "name": "Producto Ejemplo",
        "quantity": 2,
        "unit_price": 50.00,
        "subtotal": 84.75,
        "tax": 15.25,
        "total": 100.00
      }
    ],
    "payments": [
      {
        "method": "cash",
        "method_name": "Efectivo",
        "amount": 118.00,
        "reference": null
      }
    ]
  }
}
```

### Configuración para Tienda 10715

```sql
INSERT INTO webhooks_config (tienda_id, webhook_url, auth_type, auth_token, enabled, events, created_at)
VALUES (
    10715,
    'https://[URL_DEL_CLIENTE]/webhooks/mitienda/orders',
    'bearer',
    '[TOKEN_DEL_CLIENTE]',
    1,
    '["order.created"]',
    NOW()
);
```

---

## 📋 Checklist de Despliegue

### Pre-Despliegue
- [x] Código del backend modificado y testeado localmente
- [x] Código del frontend actualizado
- [x] Migraciones SQL preparadas
- [x] Documentación completa

### Despliegue Backend
- [ ] Commit de cambios en mitienda-api-ci4
- [ ] `git push live main:master`
- [ ] Verificar que el código se desplegó correctamente

### Migraciones de Base de Datos
- [ ] Backup de la base de datos
- [ ] Ejecutar `01_add_tiendaventa_origen.sql`
- [ ] Ejecutar `02_create_auxiliary_tables.sql`
- [ ] Verificar que las tablas y campos se crearon

### Configuración
- [ ] Editar `app/Config/Routes.php` manualmente en el servidor
- [ ] Agregar ruta: `$routes->post('orders/pos', 'Order::createFromPOS');`
- [ ] Configurar webhook para tienda 10715

### Testing Post-Despliegue
- [ ] Test con Postman: crear orden desde POS
- [ ] Verificar que el webhook se envía correctamente
- [ ] Test desde frontend: completar una venta real
- [ ] Verificar que el stock se actualiza
- [ ] Verificar que el backoffice sigue funcionando
- [ ] Verificar que la app móvil sigue funcionando

---

## 🚨 Rollback Plan

Ver archivo [DEPLOYMENT.md](DEPLOYMENT.md) sección "Rollback" para instrucciones detalladas.

---

## 📊 Monitoreo

### Queries Útiles

```sql
-- Ver ventas del POS del día
SELECT * FROM tiendasventas
WHERE tienda_id = 10715
AND tiendaventa_origen = 'pos'
AND DATE(tiendaventa_fecha) = CURDATE();

-- Ver webhooks enviados hoy
SELECT * FROM webhooks_log
WHERE tienda_id = 10715
AND DATE(fecha) = CURDATE()
ORDER BY fecha DESC;

-- Ver webhooks fallidos
SELECT * FROM webhooks_log
WHERE tienda_id = 10715
AND response_code NOT BETWEEN 200 AND 299
ORDER BY fecha DESC
LIMIT 20;

-- Ver métodos de pago usados
SELECT
    metodo_nombre,
    COUNT(*) as cantidad_transacciones,
    SUM(monto) as total_monto
FROM tiendasventas_pagos_pos pp
JOIN tiendasventas v ON pp.tiendaventa_id = v.tiendaventa_id
WHERE v.tienda_id = 10715
AND DATE(pp.fecha) = CURDATE()
GROUP BY metodo_nombre;
```

---

## 📝 Notas Adicionales

### Importante
1. El campo `tiendaventa_origen` puede ser NULL para ventas antiguas - se asume 'web'
2. El sistema continúa soportando las ventas del eCommerce sin cambios
3. Los webhooks fallan silenciosamente - no interrumpen la creación de órdenes
4. Los logs de webhooks se mantienen indefinidamente (considerar política de retención)

### Para el Cliente (Oracle NetSuite)
- El webhook se envía inmediatamente después de crear la orden
- El payload incluye toda la información necesaria
- Se espera respuesta HTTP 200-299 para considerar exitoso
- Reintentos automáticos (si están habilitados en configuración)

---

## ✅ Estado Final

**Backend**: Listo para desplegar
**Frontend**: Actualizado y funcionando
**Migraciones**: Preparadas
**Documentación**: Completa
**Testing**: Pendiente en producción

---

## 👥 Créditos

Implementado por: Claude
Fecha: 2025-10-17
Proyecto: MiTienda POS - Integración con Backend Real
