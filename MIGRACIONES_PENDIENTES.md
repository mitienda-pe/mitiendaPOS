# Migraciones Pendientes Base de Datos - MiTienda POS

## Resumen

Este documento contiene las instrucciones para ejecutar las migraciones pendientes necesarias para el correcto funcionamiento del sistema POS.

**Total de migraciones pendientes**: 4

---

## 1. CreateTiendasventasPagosPos

**Archivo**: `2025-01-20-000001_CreateTiendasventasPagosPos.php`
**Propósito**: Crear tabla para registrar pagos mixtos en ventas POS

### Descripción
Crea la tabla `tiendasventas_pagos_pos` que permite registrar múltiples métodos de pago en una misma venta (efectivo + tarjeta, Yape + efectivo, etc.).

### Estructura de la tabla
```sql
CREATE TABLE tiendasventas_pagos_pos (
    tiendaventa_pago_id INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tiendaventa_id INT(11) UNSIGNED NOT NULL,
    metodo VARCHAR(50) NOT NULL COMMENT 'cash, card, transfer, yape, plin, gift_card, points',
    metodo_nombre VARCHAR(100) NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    referencia VARCHAR(255) NULL COMMENT 'Número de operación, voucher, etc.',
    fecha DATETIME NOT NULL,
    INDEX idx_tiendaventa_id (tiendaventa_id),
    FOREIGN KEY (tiendaventa_id) REFERENCES tiendasventas(tiendaventa_id) ON DELETE CASCADE ON UPDATE CASCADE
);
```

### Métodos de pago soportados
- `cash`: Efectivo
- `card`: Tarjeta de crédito/débito
- `transfer`: Transferencia bancaria
- `yape`: Yape
- `plin`: Plin
- `gift_card`: Tarjeta de regalo
- `points`: Puntos de fidelidad

---

## 2. AddUsuarioIdToTiendasventas

**Archivo**: `2025-01-20-150000_AddUsuarioIdToTiendasventas.php`
**Propósito**: Agregar campo `usuario_id` para clientes de tienda virtual

### Descripción
Agrega la columna `usuario_id` que se refiere al **cliente/comprador de la tienda virtual** (no al cajero).

**IMPORTANTE**:
- `usuario_id` = ID del cliente que compra en la web
- `cajero_id` = ID del empleado que registra la venta en POS
- `tiendacliente_id` = Referencia al registro en tabla `tiendasclientes`

### Query SQL
```sql
-- Agregar columna usuario_id
ALTER TABLE tiendasventas
ADD COLUMN usuario_id INT(11) UNSIGNED NULL
COMMENT 'ID del cliente/usuario de la tienda virtual (web)',
ALGORITHM=INPLACE, LOCK=NONE;

-- Agregar índice
ALTER TABLE tiendasventas
ADD INDEX idx_usuario_id (usuario_id),
ALGORITHM=INPLACE, LOCK=NONE;
```

### Uso en el sistema
- Ventas desde **web**: `usuario_id` tiene el ID del usuario logueado, `cajero_id` es NULL
- Ventas desde **POS**: `cajero_id` tiene el ID del empleado, `usuario_id` es NULL
- `tiendacliente_id`: Se usa en ambos casos para vincular con la tabla de clientes

---

## 3. AddCajeroIdToTiendasventas

**Archivo**: `2025-01-20-160000_AddCajeroIdToTiendasventas.php`
**Propósito**: Agregar campo `cajero_id` para empleados que registran ventas en POS

### Descripción
Agrega la columna `cajero_id` que identifica al **empleado/cajero que registró la venta desde el POS**.

### Query SQL
```sql
-- Agregar columna cajero_id
ALTER TABLE tiendasventas
ADD COLUMN cajero_id INT(11) UNSIGNED NULL AFTER usuario_id
COMMENT 'ID del cajero/empleado que registró la venta desde el POS',
ALGORITHM=INPLACE, LOCK=NONE;

-- Agregar índice
ALTER TABLE tiendasventas
ADD INDEX idx_cajero_id (cajero_id),
ALGORITHM=INPLACE, LOCK=NONE;
```

### Diferencia entre usuario_id y cajero_id

| Campo | Descripción | Cuándo se usa |
|-------|-------------|---------------|
| `usuario_id` | Cliente que compra en la web | Ventas desde tienda virtual |
| `cajero_id` | Empleado que registra venta | Ventas desde POS |
| `tiendacliente_id` | Referencia a tabla clientes | Ambos casos |

### Ejemplo de uso
```php
// Venta desde WEB
$ventaWeb = [
    'tienda_id' => 404,
    'usuario_id' => 12345,      // Cliente logueado en web
    'cajero_id' => NULL,         // No hay cajero
    'tiendacliente_id' => 67890, // Mismo cliente en tabla clientes
    'tiendaventa_origen' => 'web'
];

// Venta desde POS
$ventaPOS = [
    'tienda_id' => 404,
    'usuario_id' => NULL,        // No hay usuario web
    'cajero_id' => 408,          // Empleado que atiende
    'tiendacliente_id' => 67890, // Cliente registrado
    'tiendaventa_origen' => 'pos'
];
```

---

## 4. AddOrigenFieldToTiendasventas

**Archivo**: `2025-10-18-120000_AddOrigenFieldToTiendasventas.php`
**Propósito**: Identificar el origen de cada venta

### Descripción
Agrega el campo `tiendaventa_origen` para diferenciar de dónde proviene cada venta.

### Query SQL
```sql
-- Agregar columna tiendaventa_origen
ALTER TABLE tiendasventas
ADD COLUMN tiendaventa_origen VARCHAR(20) NULL DEFAULT 'web' AFTER tiendaventa_pagado
COMMENT 'Origen de la venta: web, pos, api',
ALGORITHM=INPLACE, LOCK=NONE;

-- Agregar índice
ALTER TABLE tiendasventas
ADD INDEX idx_tiendaventa_origen (tiendaventa_origen),
ALGORITHM=INPLACE, LOCK=NONE;
```

### Valores posibles
- `web`: Venta desde la tienda virtual (e-commerce)
- `pos`: Venta desde el sistema POS (punto de venta físico)
- `api`: Venta desde integración externa (marketplace, ERP, etc.)

### Queries de ejemplo

**Ventas solo desde POS:**
```sql
SELECT
    tiendaventa_id,
    tiendaventa_fecha,
    tiendaventa_totalpagar,
    cajero_id
FROM tiendasventas
WHERE tienda_id = 404
  AND tiendaventa_origen = 'pos'
ORDER BY tiendaventa_fecha DESC;
```

**Reporte de ventas por origen:**
```sql
SELECT
    tiendaventa_origen,
    COUNT(*) as total_ventas,
    SUM(tiendaventa_totalpagar) as total_monto
FROM tiendasventas
WHERE tienda_id = 404
  AND DATE(tiendaventa_fecha) = CURDATE()
GROUP BY tiendaventa_origen;
```

**Ventas de un cajero específico:**
```sql
SELECT
    v.tiendaventa_id,
    v.tiendaventa_fecha,
    v.tiendaventa_totalpagar,
    c.tiendacliente_nombres,
    c.tiendacliente_apellidos
FROM tiendasventas v
LEFT JOIN tiendasclientes c ON v.tiendacliente_id = c.tiendacliente_id
WHERE v.tienda_id = 404
  AND v.cajero_id = 408
  AND v.tiendaventa_origen = 'pos'
ORDER BY v.tiendaventa_fecha DESC
LIMIT 50;
```

---

## Instrucciones de Ejecución

### Opción 1: Ejecutar todas las migraciones (Recomendado)

```bash
# Conectarse al servidor
ssh mtserv

# Ir al directorio del proyecto
cd /var/www/api2.mitienda.pe

# Ejecutar migraciones pendientes
php spark migrate

# Verificar estado
php spark migrate:status
```

### Opción 2: Ejecutar migraciones SQL manualmente

Si prefieres ejecutar los queries SQL directamente:

```bash
# Conectarse al servidor
ssh mtserv

# Conectar a MySQL
mysql mitienda

# Ejecutar los queries en orden:
```

#### 1. Crear tabla de pagos POS
```sql
CREATE TABLE tiendasventas_pagos_pos (
    tiendaventa_pago_id INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tiendaventa_id INT(11) UNSIGNED NOT NULL,
    metodo VARCHAR(50) NOT NULL COMMENT 'cash, card, transfer, yape, plin, gift_card, points',
    metodo_nombre VARCHAR(100) NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    referencia VARCHAR(255) NULL COMMENT 'Número de operación, voucher, etc.',
    fecha DATETIME NOT NULL,
    INDEX idx_tiendaventa_id (tiendaventa_id),
    FOREIGN KEY (tiendaventa_id) REFERENCES tiendasventas(tiendaventa_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 2. Agregar usuario_id
```sql
ALTER TABLE tiendasventas
ADD COLUMN usuario_id INT(11) UNSIGNED NULL
COMMENT 'ID del cliente/usuario de la tienda virtual (web)',
ALGORITHM=INPLACE, LOCK=NONE;

ALTER TABLE tiendasventas
ADD INDEX idx_usuario_id (usuario_id),
ALGORITHM=INPLACE, LOCK=NONE;
```

#### 3. Agregar cajero_id
```sql
ALTER TABLE tiendasventas
ADD COLUMN cajero_id INT(11) UNSIGNED NULL AFTER usuario_id
COMMENT 'ID del cajero/empleado que registró la venta desde el POS',
ALGORITHM=INPLACE, LOCK=NONE;

ALTER TABLE tiendasventas
ADD INDEX idx_cajero_id (cajero_id),
ALGORITHM=INPLACE, LOCK=NONE;
```

#### 4. Agregar tiendaventa_origen
```sql
ALTER TABLE tiendasventas
ADD COLUMN tiendaventa_origen VARCHAR(20) NULL DEFAULT 'web' AFTER tiendaventa_pagado
COMMENT 'Origen de la venta: web, pos, api',
ALGORITHM=INPLACE, LOCK=NONE;

ALTER TABLE tiendasventas
ADD INDEX idx_tiendaventa_origen (tiendaventa_origen),
ALGORITHM=INPLACE, LOCK=NONE;
```

---

## Verificación Post-Migración

Después de ejecutar las migraciones, verificar:

### 1. Verificar estructura de tiendasventas
```sql
DESCRIBE tiendasventas;
```

Debe incluir:
- `usuario_id` (INT UNSIGNED NULL)
- `cajero_id` (INT UNSIGNED NULL)
- `tiendaventa_origen` (VARCHAR(20) DEFAULT 'web')

### 2. Verificar tabla de pagos POS
```sql
SHOW CREATE TABLE tiendasventas_pagos_pos;
```

### 3. Verificar índices
```sql
SHOW INDEX FROM tiendasventas WHERE Key_name IN ('idx_usuario_id', 'idx_cajero_id', 'idx_tiendaventa_origen');
```

### 4. Prueba de inserción (opcional)
```sql
-- Insertar venta POS de prueba
INSERT INTO tiendasventas (
    tienda_id,
    cajero_id,
    tiendaventa_origen,
    tiendaventa_fecha,
    tiendaventa_totalpagar,
    moneda_id
) VALUES (
    404,
    408,
    'pos',
    NOW(),
    150.00,
    1
);

-- Verificar
SELECT * FROM tiendasventas WHERE tiendaventa_origen = 'pos' ORDER BY tiendaventa_id DESC LIMIT 1;

-- Eliminar registro de prueba
DELETE FROM tiendasventas WHERE tiendaventa_origen = 'pos' AND cajero_id = 408 ORDER BY tiendaventa_id DESC LIMIT 1;
```

---

## Notas Importantes

### Sobre ALGORITHM=INPLACE y LOCK=NONE

Las migraciones usan `ALGORITHM=INPLACE, LOCK=NONE` para:
- ✅ No bloquear la tabla durante la migración
- ✅ Permitir lectura/escritura mientras se ejecuta
- ✅ MySQL 8.0.42+ soporta esto para ADD COLUMN

### Sobre usuario_id vs cajero_id

**NO confundir**:
- `usuario_id` → Cliente que compra en WEB
- `cajero_id` → Empleado que vende en POS
- `tiendacliente_id` → Registro en tabla clientes (usado en ambos casos)

### Rollback (si es necesario)

Si algo sale mal, puedes revertir las migraciones:

```bash
php spark migrate:rollback
```

O manualmente:
```sql
-- Eliminar campos agregados
ALTER TABLE tiendasventas DROP COLUMN tiendaventa_origen;
ALTER TABLE tiendasventas DROP COLUMN cajero_id;
ALTER TABLE tiendasventas DROP COLUMN usuario_id;

-- Eliminar tabla de pagos
DROP TABLE tiendasventas_pagos_pos;
```

---

## Estado Actual

**Fecha**: 2025-10-21
**Migraciones ejecutadas**: 6
**Migraciones pendientes**: 4

### Migraciones ya ejecutadas ✅
- CreateLogsTable (2025-01-09)
- CreateMobileAuthTables (2025-09-07)
- AddVideoFieldsToProducto (2025-10-03)
- AddCloudflareFieldsToProductImages (2025-10-10)
- ModifyTiendaimagenIdToNullable (2025-10-10)
- CreateProductosCloudflareImagesTable (2025-10-10)

### Migraciones pendientes ⏳
1. CreateTiendasventasPagosPos
2. AddUsuarioIdToTiendasventas
3. AddCajeroIdToTiendasventas
4. AddOrigenFieldToTiendasventas

---

## Contacto

Si tienes dudas sobre estas migraciones, contacta al equipo de desarrollo.
