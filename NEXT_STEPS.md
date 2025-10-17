# 🚀 Próximos Pasos - Despliegue del POS

Este documento indica qué hacer a continuación para completar el despliegue.

---

## ✅ Estado Actual

**Completado**:
- ✅ Código del backend modificado y commiteado
- ✅ Código del frontend actualizado y commiteado
- ✅ Migraciones SQL preparadas en `backend_migrations/`
- ✅ Documentación completa (PRD, Deployment, Implementation Summary)
- ✅ Branch `feature/api-integration` con todos los cambios

**Pendiente**:
- ⏳ Despliegue del backend a producción
- ⏳ Ejecución de migraciones en base de datos
- ⏳ Configuración de rutas en servidor
- ⏳ Configuración del webhook para tienda 10715
- ⏳ Testing en producción

---

## 📋 Paso 1: Desplegar Backend a Producción

### Opción A: Desde tu máquina local

```bash
cd /Users/carlosvidal/www/mitienda/mitienda-api-ci4

# Verificar commit
git log --oneline -1
# Debe mostrar: "feat: Add POS orders support with webhook integration"

# Desplegar a producción
git push live main:master
```

### Opción B: Primero hacer push a origin, luego al servidor

```bash
cd /Users/carlosvidal/www/mitienda/mitienda-api-ci4

# Push a GitHub/GitLab
git push origin main

# Luego push a servidor de producción
git push live main:master
```

**⚠️ Importante**: Verificar que el despliegue fue exitoso antes de continuar.

---

## 📋 Paso 2: Ejecutar Migraciones SQL

### Preparación

1. **Hacer backup de la base de datos**:

```bash
# Conectarse al servidor (o desde tu máquina si tienes acceso directo)
ssh usuario@api2.mitienda.pe

# Backup de la base de datos
mysqldump -u [usuario] -p [nombre_db] > backup_antes_migracion_$(date +%Y%m%d_%H%M%S).sql
```

2. **Copiar archivos SQL al servidor**:

```bash
# Desde tu máquina local
scp /Users/carlosvidal/www/mitienda/mitienda-POS/backend_migrations/*.sql usuario@api2.mitienda.pe:/tmp/
```

### Ejecución

```bash
# Conectado al servidor vía SSH
mysql -u [usuario] -p [nombre_db] < /tmp/01_add_tiendaventa_origen.sql
mysql -u [usuario] -p [nombre_db] < /tmp/02_create_auxiliary_tables.sql

# Limpiar archivos temporales
rm /tmp/01_add_tiendaventa_origen.sql
rm /tmp/02_create_auxiliary_tables.sql
```

### Verificación

```sql
-- Conectarse a MySQL
mysql -u [usuario] -p [nombre_db]

-- Verificar campo tiendaventa_origen
DESCRIBE tiendasventas;
-- Debe aparecer: tiendaventa_origen ENUM('web', 'pos', 'api')

-- Verificar tablas auxiliares
SHOW TABLES LIKE 'tiendasventas_pagos_pos';
SHOW TABLES LIKE 'webhooks_config';
SHOW TABLES LIKE 'webhooks_log';

-- Verificar índices
SHOW INDEX FROM tiendasventas WHERE Key_name IN ('idx_origen', 'idx_tienda_origen');
```

---

## 📋 Paso 3: Configurar Rutas (Manual)

**⚠️ Este paso debe hacerse manualmente en el servidor**

```bash
# Conectarse al servidor
ssh usuario@api2.mitienda.pe

# Navegar al directorio del API
cd [ruta_del_api]

# Editar Routes.php
nano app/Config/Routes.php
```

Agregar esta línea dentro del grupo `api/v1`:

```php
$routes->group('api/v1', ['namespace' => 'App\Controllers\V1', 'filter' => 'auth'], static function ($routes) {
    // ... rutas existentes ...

    // Nueva ruta para órdenes del POS
    $routes->post('orders/pos', 'Order::createFromPOS');
});
```

Guardar y salir (Ctrl+O, Enter, Ctrl+X).

---

## 📋 Paso 4: Configurar Webhook para Tienda 10715

**Necesitas obtener del cliente**:
1. URL del webhook de Oracle NetSuite
2. Tipo de autenticación (bearer token, API key, basic auth)
3. Token/credenciales de autenticación

Una vez que tengas esa información:

```sql
-- Conectarse a MySQL
mysql -u [usuario] -p [nombre_db]

-- Insertar configuración del webhook
INSERT INTO webhooks_config (
    tienda_id,
    webhook_url,
    auth_type,
    auth_token,
    enabled,
    events,
    created_at
)
VALUES (
    10715,
    '[URL_PROPORCIONADA_POR_CLIENTE]',  -- Ej: https://sistema-cliente.com/api/webhooks/mitienda
    'bearer',  -- o 'api_key', 'basic', 'none'
    '[TOKEN_PROPORCIONADO_POR_CLIENTE]',
    1,
    '["order.created"]',
    NOW()
);

-- Verificar
SELECT * FROM webhooks_config WHERE tienda_id = 10715;
```

---

## 📋 Paso 5: Testing en Producción

### Test 1: API con Postman

```
POST https://api2.mitienda.pe/api/v1/orders/pos
Headers:
  Authorization: Bearer [tu_access_token]
  Content-Type: application/json

Body:
{
  "customer_id": null,
  "customer_name": "Test Cliente POS",
  "customer_document": "12345678",
  "document_type": "boleta",
  "items": [
    {
      "product_id": [ID_PRODUCTO_REAL],
      "sku": "TEST-001",
      "name": "Producto de Prueba",
      "quantity": 1,
      "unit_price": 10.00
    }
  ],
  "payments": [
    {
      "method": "cash",
      "method_name": "Efectivo",
      "amount": 11.80
    }
  ],
  "subtotal": 10.00,
  "tax": 1.80,
  "total": 11.80,
  "currency": "PEN"
}
```

**Respuesta esperada**:
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

### Test 2: Verificar Webhook

```sql
-- Ver webhooks enviados
SELECT * FROM webhooks_log
WHERE tienda_id = 10715
ORDER BY fecha DESC
LIMIT 5;

-- Verificar respuesta exitosa
SELECT
    tiendaventa_id,
    response_code,
    response_body,
    fecha
FROM webhooks_log
WHERE tienda_id = 10715
ORDER BY fecha DESC
LIMIT 1;
```

**Código esperado**: `200` o `201`

### Test 3: Verificar Orden Creada

```sql
-- Ver última orden del POS
SELECT * FROM tiendasventas
WHERE tienda_id = 10715
AND tiendaventa_origen = 'pos'
ORDER BY tiendaventa_id DESC
LIMIT 1;

-- Ver detalles de la orden
SELECT * FROM tiendasventasdetalles
WHERE tiendaventa_id = [ID_DE_LA_ORDEN];

-- Ver pagos registrados
SELECT * FROM tiendasventas_pagos_pos
WHERE tiendaventa_id = [ID_DE_LA_ORDEN];
```

### Test 4: Frontend POS

1. Abrir POS en navegador: https://[URL_DEL_POS]
2. Login con carlos@mitienda.pe
3. Buscar un producto y agregarlo al carrito
4. Seleccionar método de pago
5. Completar la venta
6. Verificar que aparece mensaje de éxito
7. Verificar en la base de datos que la orden se creó

---

## 📋 Paso 6: Monitoreo Post-Despliegue

Durante las primeras horas después del despliegue, monitorear:

### Logs del Servidor

```bash
# Logs de errores de nginx/apache
tail -f /var/log/nginx/error.log

# Logs de la aplicación CodeIgniter
tail -f [ruta_api]/writable/logs/log-*.log
```

### Logs de MySQL

```sql
-- Ventas del POS creadas hoy
SELECT COUNT(*) as total_ventas_pos_hoy
FROM tiendasventas
WHERE tienda_id = 10715
AND tiendaventa_origen = 'pos'
AND DATE(tiendaventa_fecha) = CURDATE();

-- Webhooks enviados hoy
SELECT COUNT(*) as total_webhooks_hoy
FROM webhooks_log
WHERE tienda_id = 10715
AND DATE(fecha) = CURDATE();

-- Webhooks fallidos
SELECT COUNT(*) as webhooks_fallidos
FROM webhooks_log
WHERE tienda_id = 10715
AND DATE(fecha) = CURDATE()
AND response_code NOT BETWEEN 200 AND 299;
```

### Verificar que el sistema anterior sigue funcionando

- ✅ Backoffice puede ver órdenes
- ✅ App móvil sigue funcionando
- ✅ Ventas de la tienda web se crean normalmente
- ✅ No hay errores 500 en el API

---

## 🚨 Si Algo Sale Mal

### Rollback del Código

```bash
cd /Users/carlosvidal/www/mitienda/mitienda-api-ci4

# Ver commits recientes
git log --oneline -5

# Revertir el último commit
git revert HEAD

# Desplegar el rollback
git push live main:master
```

### Rollback de Migraciones

Ver archivo [DEPLOYMENT.md](DEPLOYMENT.md) sección "Rollback" para SQL completo.

```sql
-- Eliminar campo
ALTER TABLE tiendasventas DROP COLUMN tiendaventa_origen;

-- Eliminar índices
ALTER TABLE tiendasventas DROP INDEX idx_origen;
ALTER TABLE tiendasventas DROP INDEX idx_tienda_origen;

-- Eliminar tablas
DROP TABLE IF EXISTS webhooks_log;
DROP TABLE IF EXISTS webhooks_config;
DROP TABLE IF EXISTS tiendasventas_pagos_pos;
```

---

## 📞 Contacto y Dudas

Si tienes dudas durante el despliegue:

1. Revisa [DEPLOYMENT.md](DEPLOYMENT.md) para más detalles
2. Revisa [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) para entender los cambios
3. Revisa [BACKEND_REAL_IMPLEMENTATION.md](BACKEND_REAL_IMPLEMENTATION.md) para detalles técnicos

---

## 📊 Resumen de Archivos de Documentación

| Archivo | Propósito |
|---------|-----------|
| **NEXT_STEPS.md** (este archivo) | Guía paso a paso de qué hacer ahora |
| **DEPLOYMENT.md** | Guía técnica detallada de despliegue |
| **IMPLEMENTATION_SUMMARY.md** | Resumen completo de todos los cambios |
| **BACKEND_REAL_IMPLEMENTATION.md** | Especificaciones técnicas del backend |
| **PRD.md** | Product Requirements Document completo |

---

## ✅ Checklist Final

Marca cada paso cuando lo completes:

- [ ] **Paso 1**: Backend desplegado con `git push live main:master`
- [ ] **Paso 2**: Migraciones SQL ejecutadas y verificadas
- [ ] **Paso 3**: Rutas configuradas manualmente en `Routes.php`
- [ ] **Paso 4**: Webhook configurado para tienda 10715
- [ ] **Paso 5**: Testing completado (API, Webhook, Frontend)
- [ ] **Paso 6**: Monitoreo activo durante primeras horas
- [ ] **Paso 7**: Sistema estable, sin errores

---

## 🎉 Una Vez Completado

Cuando todo esté funcionando correctamente:

1. Notificar al cliente que el sistema está operativo
2. Proporcionar documentación del webhook al cliente
3. Realizar capacitación al equipo sobre el nuevo POS
4. Continuar monitoreando durante los primeros días

**¡Éxito en el despliegue! 🚀**
