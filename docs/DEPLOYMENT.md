# Guía de Despliegue - POS Backend

Esta guía detalla los pasos para desplegar los cambios del backend a producción de forma segura.

## 📋 Pre-requisitos

- Acceso SSH al servidor de producción
- Acceso a la base de datos MySQL en producción
- Git configurado con acceso al repositorio
- Backup de la base de datos antes de ejecutar migraciones

---

## 🚀 Proceso de Despliegue

### Paso 1: Verificar cambios locales

Antes de desplegar, asegúrate de que todos los cambios están en el repositorio local del API:

```bash
cd /Users/carlosvidal/www/mitienda/mitienda-api-ci4

# Ver estado de los archivos modificados
git status

# Archivos que deberían aparecer:
# - app/Models/OrderModel.php (modificado)
# - app/Controllers/V1/Order.php (modificado)
```

### Paso 2: Commit de cambios

```bash
# Agregar archivos modificados
git add app/Models/OrderModel.php
git add app/Controllers/V1/Order.php

# Crear commit descriptivo
git commit -m "feat: Add POS orders support with webhook integration

- Add tiendaventa_origen field to OrderModel
- Create createFromPOS() method in Order controller
- Add source filter to index() method
- Implement webhook notifications for POS orders
- Support for multiple payment methods in POS"
```

### Paso 3: Desplegar a producción

**IMPORTANTE**: Según tus instrucciones, el despliegue se hace con:

```bash
git push live main:master
```

Esto desplegará los cambios del backend al servidor de producción.

---

## 🗄️ Migraciones de Base de Datos

**IMPORTANTE**: Estas migraciones deben ejecutarse **después** de desplegar el código, pero **antes** de usar el POS en producción.

### Opción A: Ejecutar desde cliente MySQL local

Si tienes acceso directo a la base de datos:

```bash
# 1. Conectarse a la base de datos
mysql -h [host_produccion] -u [usuario] -p [nombre_base_datos]

# 2. Ejecutar migraciones en orden:

# Migración 1: Agregar campo tiendaventa_origen
source /Users/carlosvidal/www/mitienda/mitienda-POS/backend_migrations/01_add_tiendaventa_origen.sql

# Migración 2: Crear tablas auxiliares
source /Users/carlosvidal/www/mitienda/mitienda-POS/backend_migrations/02_create_auxiliary_tables.sql
```

### Opción B: Ejecutar vía SSH en el servidor

Si prefieres ejecutar las migraciones desde el servidor:

```bash
# 1. Conectarse al servidor
ssh usuario@api2.mitienda.pe

# 2. Copiar archivos SQL al servidor (desde tu máquina local, en otra terminal):
scp /Users/carlosvidal/www/mitienda/mitienda-POS/backend_migrations/*.sql usuario@api2.mitienda.pe:/tmp/

# 3. Ejecutar migraciones (de vuelta en el servidor):
mysql -u [usuario] -p [nombre_base_datos] < /tmp/01_add_tiendaventa_origen.sql
mysql -u [usuario] -p [nombre_base_datos] < /tmp/02_create_auxiliary_tables.sql

# 4. Limpiar archivos temporales
rm /tmp/01_add_tiendaventa_origen.sql
rm /tmp/02_create_auxiliary_tables.sql
```

### Verificar migraciones

```sql
-- Verificar que el campo se agregó correctamente
DESCRIBE tiendasventas;
-- Debe aparecer: tiendaventa_origen ENUM('web', 'pos', 'api')

-- Verificar que las tablas auxiliares existen
SHOW TABLES LIKE 'tiendasventas_pagos_pos';
SHOW TABLES LIKE 'webhooks_config';
SHOW TABLES LIKE 'webhooks_log';

-- Verificar índices
SHOW INDEX FROM tiendasventas WHERE Key_name IN ('idx_origen', 'idx_tienda_origen');
```

---

## 🔌 Configuración del Webhook para Tienda 10715

Una vez que las migraciones estén ejecutadas, configurar el webhook para la tienda 10715:

```sql
-- IMPORTANTE: Reemplazar con los valores reales proporcionados por el cliente

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
    'https://[URL_PROPORCIONADA_POR_CLIENTE]/webhooks/mitienda/orders',  -- URL del cliente
    'bearer',  -- o 'api_key', 'basic', 'none'
    '[TOKEN_PROPORCIONADO_POR_CLIENTE]',  -- Token de autenticación
    1,  -- Habilitado
    '["order.created"]',  -- Eventos a notificar
    NOW()
);
```

---

## 📝 Actualizar Routes.php (Manual)

**IMPORTANTE**: Este archivo NO está versionado en git por seguridad. Debe editarse manualmente en el servidor.

```bash
# Conectarse al servidor
ssh usuario@api2.mitienda.pe

# Editar el archivo de rutas
cd /ruta/del/api
nano app/Config/Routes.php
```

Agregar esta línea dentro del grupo de rutas de `api/v1`:

```php
$routes->group('api/v1', ['namespace' => 'App\Controllers\V1', 'filter' => 'auth'], static function ($routes) {
    // ... rutas existentes ...

    // Nueva ruta para órdenes del POS
    $routes->post('orders/pos', 'Order::createFromPOS');
});
```

---

## ✅ Testing Post-Despliegue

### 1. Test desde Postman/Thunder Client

```
POST https://api2.mitienda.pe/api/v1/orders/pos
Headers:
  Authorization: Bearer [access_token]
  Content-Type: application/json

Body:
{
  "customer_id": null,
  "customer_name": "Test Cliente",
  "customer_document": "12345678",
  "document_type": "boleta",
  "items": [
    {
      "product_id": 123,
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

### 2. Verificar webhook en logs

```sql
-- Ver últimos webhooks enviados
SELECT * FROM webhooks_log
WHERE tienda_id = 10715
ORDER BY fecha DESC
LIMIT 10;

-- Verificar respuestas exitosas (código 200)
SELECT
    tiendaventa_id,
    response_code,
    fecha,
    SUBSTRING(payload, 1, 100) as payload_preview
FROM webhooks_log
WHERE tienda_id = 10715
AND response_code BETWEEN 200 AND 299
ORDER BY fecha DESC;
```

### 3. Test desde el Frontend POS

Una vez verificado que el endpoint funciona:

1. Abrir el POS: http://localhost:5173 (en desarrollo)
2. Login con carlos@mitienda.pe
3. Buscar un producto y agregarlo al carrito
4. Procesar un pago
5. Verificar que la orden se creó correctamente

---

## 🔄 Rollback (en caso de problemas)

### Rollback de código

```bash
# Ver último commit
git log --oneline -5

# Revertir al commit anterior
git revert HEAD
git push live main:master
```

### Rollback de migraciones

```sql
-- Eliminar campo tiendaventa_origen
ALTER TABLE tiendasventas DROP COLUMN tiendaventa_origen;

-- Eliminar índices
ALTER TABLE tiendasventas DROP INDEX idx_origen;
ALTER TABLE tiendasventas DROP INDEX idx_tienda_origen;

-- Eliminar tablas auxiliares
DROP TABLE IF EXISTS webhooks_log;
DROP TABLE IF EXISTS webhooks_config;
DROP TABLE IF EXISTS tiendasventas_pagos_pos;
```

---

## 📞 Contacto y Soporte

Si algo falla durante el despliegue:

1. Verificar logs del servidor: `/var/log/nginx/error.log` o equivalente
2. Verificar logs de la aplicación: `writable/logs/` en CodeIgniter
3. Revisar logs de MySQL para errores de queries

---

## 📊 Monitoreo Post-Despliegue

Después del despliegue, monitorear:

- ✅ Ventas del POS se crean correctamente
- ✅ Webhooks se envían sin errores (response_code 200-299)
- ✅ Stock se actualiza correctamente
- ✅ No hay errores en logs del servidor
- ✅ El backoffice y la app móvil siguen funcionando normalmente

---

## ⚠️ Notas Importantes

1. **BACKUP**: Siempre hacer backup de la base de datos antes de ejecutar migraciones
2. **TESTING**: Probar primero en un ambiente de staging si está disponible
3. **HORARIO**: Desplegar en horarios de bajo tráfico
4. **COMUNICACIÓN**: Notificar al equipo antes del despliegue
5. **ROLLBACK PLAN**: Tener el plan de rollback listo antes de iniciar
