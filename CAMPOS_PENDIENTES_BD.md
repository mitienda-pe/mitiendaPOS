# Campos Pendientes Base de Datos

## Resumen
Campos adicionales identificados durante el desarrollo del POS que necesitan ser agregados a la base de datos.

---

## 1. Productos: Campo `publicado_pos`

### Propósito
Controlar qué productos están disponibles para venta en el POS, independientemente de su publicación en la web.

### Problema actual
- Campo `producto_publicado` apaga productos en **todos lados** (web y POS)
- No hay forma de tener productos exclusivos de web o exclusivos de tienda física

### Solución
Agregar campo `producto_publicado_pos` que controle visibilidad específica en POS.

### Casos de uso

| producto_publicado | producto_publicado_pos | Visible en Web | Visible en POS |
|-------------------|------------------------|----------------|----------------|
| 1 | 1 | ✅ Sí | ✅ Sí |
| 1 | 0 | ✅ Sí | ❌ No (solo web) |
| 0 | 1 | ❌ No | ✅ Sí (solo tienda) |
| 0 | 0 | ❌ No | ❌ No (oculto) |

### Migración SQL

```sql
-- Agregar campo producto_publicado_pos
ALTER TABLE producto
ADD COLUMN producto_publicado_pos TINYINT(1) NOT NULL DEFAULT 1
COMMENT 'Publicado en POS: 1=visible en tienda física, 0=oculto en POS'
AFTER producto_publicado,
ALGORITHM=INPLACE, LOCK=NONE;

-- Agregar índice para consultas POS
ALTER TABLE producto
ADD INDEX idx_publicado_pos (producto_publicado_pos),
ALGORITHM=INPLACE, LOCK=NONE;

-- Índice compuesto para filtros combinados
ALTER TABLE producto
ADD INDEX idx_publicado_web_pos (producto_publicado, producto_publicado_pos),
ALGORITHM=INPLACE, LOCK=NONE;
```

### Archivo de migración CodeIgniter

**Nombre**: `2025-01-21-100000_AddPublicadoPosToProducto.php`

```php
<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class AddPublicadoPosToProducto extends Migration
{
    public function up()
    {
        // Agregar campo producto_publicado_pos
        $fields = [
            'producto_publicado_pos' => [
                'type' => 'TINYINT',
                'constraint' => 1,
                'null' => false,
                'default' => 1,
                'comment' => 'Publicado en POS: 1=visible en tienda física, 0=oculto en POS',
                'after' => 'producto_publicado'
            ]
        ];

        $this->forge->addColumn('producto', $fields);

        // Agregar índices
        $this->db->query('ALTER TABLE producto ADD INDEX idx_publicado_pos (producto_publicado_pos)');
        $this->db->query('ALTER TABLE producto ADD INDEX idx_publicado_web_pos (producto_publicado, producto_publicado_pos)');
    }

    public function down()
    {
        // Eliminar índices
        $this->db->query('ALTER TABLE producto DROP INDEX IF EXISTS idx_publicado_web_pos');
        $this->db->query('ALTER TABLE producto DROP INDEX IF EXISTS idx_publicado_pos');

        // Eliminar columna
        $this->forge->dropColumn('producto', 'producto_publicado_pos');
    }
}
```

### Uso en el API

```php
// ProductController.php - Endpoint para POS
public function getProductsForPOS()
{
    $tienda_id = $this->getTiendaIdFromAuth();

    $products = $this->model
        ->where('tienda_id', $tienda_id)
        ->where('producto_publicado_pos', 1)  // Solo publicados en POS
        ->where('producto_stock >', 0)         // Con stock
        ->findAll();

    return $this->respond(['success' => true, 'data' => $products]);
}
```

---

## 2. Tiendas: Campo `tienda_pos_activo`

### Propósito
Identificar qué direcciones de tienda tienen punto de venta (POS) activo, diferenciándolas de almacenes, distribuidores o puntos de recojo.

### Contexto
- Sistema legacy tiene `tiendasdirecciones` con checkbox para pickup (recojo)
- No todas las direcciones son tiendas con POS
- Pueden ser: almacenes, centros de distribución, puntos de recojo, o tiendas físicas con POS

### Problema actual
No hay forma de saber qué direcciones tienen POS instalado y activo.

### Solución
Agregar campo `tienda_pos_activo` a la tabla de direcciones/sucursales.

### Tipos de ubicaciones

| Tipo | pickup_activo | pos_activo | Descripción |
|------|---------------|------------|-------------|
| Almacén | 0 | 0 | Solo almacenamiento |
| Distribuidor | 0 | 0 | Proveedor externo |
| Punto de Recojo | 1 | 0 | Cliente recoge, sin venta en sitio |
| Tienda con POS | 1 | 1 | Tienda física con punto de venta |

### Migración SQL

**Opción A: Si ya existe tabla `tiendasdirecciones`**

```sql
-- Agregar campo tienda_pos_activo
ALTER TABLE tiendasdirecciones
ADD COLUMN tienda_pos_activo TINYINT(1) NOT NULL DEFAULT 0
COMMENT 'Punto de venta activo: 1=tiene POS instalado, 0=no tiene POS'
AFTER tienda_pickup_activo,
ALGORITHM=INPLACE, LOCK=NONE;

-- Agregar índice
ALTER TABLE tiendasdirecciones
ADD INDEX idx_pos_activo (tienda_pos_activo),
ALGORITHM=INPLACE, LOCK=NONE;
```

**Opción B: Si se va a crear tabla nueva `tiendas_sucursales`**

```sql
CREATE TABLE tiendas_sucursales (
    sucursal_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tienda_id INT UNSIGNED NOT NULL,
    sucursal_nombre VARCHAR(100) NOT NULL,
    sucursal_direccion VARCHAR(255),
    sucursal_distrito VARCHAR(100),
    sucursal_provincia VARCHAR(100),
    sucursal_departamento VARCHAR(100),
    sucursal_telefono VARCHAR(20),
    sucursal_latitud DECIMAL(10, 8) NULL,
    sucursal_longitud DECIMAL(11, 8) NULL,

    -- Flags de funcionalidad
    sucursal_pickup_activo TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Permite recojo de pedidos web',
    sucursal_pos_activo TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Tiene POS instalado',
    sucursal_almacen TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Es almacén/bodega',

    sucursal_activo TINYINT(1) NOT NULL DEFAULT 1,
    sucursal_fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    sucursal_fecha_modificacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_tienda_id (tienda_id),
    INDEX idx_pos_activo (sucursal_pos_activo),
    INDEX idx_pickup_activo (sucursal_pickup_activo),
    FOREIGN KEY (tienda_id) REFERENCES tiendas(tienda_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Archivo de migración CodeIgniter

**Nombre**: `2025-01-21-110000_AddPosActivoToTiendas.php`

```php
<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class AddPosActivoToTiendas extends Migration
{
    public function up()
    {
        // OPCIÓN A: Agregar a tabla existente tiendasdirecciones
        $fields = [
            'tienda_pos_activo' => [
                'type' => 'TINYINT',
                'constraint' => 1,
                'null' => false,
                'default' => 0,
                'comment' => 'Punto de venta activo: 1=tiene POS instalado, 0=no tiene POS',
                'after' => 'tienda_pickup_activo' // Ajustar según nombre real del campo
            ]
        ];

        // Verificar si existe la tabla antes de agregar
        if ($this->db->tableExists('tiendasdirecciones')) {
            $this->forge->addColumn('tiendasdirecciones', $fields);
            $this->db->query('ALTER TABLE tiendasdirecciones ADD INDEX idx_pos_activo (tienda_pos_activo)');
        }
    }

    public function down()
    {
        if ($this->db->tableExists('tiendasdirecciones')) {
            $this->db->query('ALTER TABLE tiendasdirecciones DROP INDEX IF EXISTS idx_pos_activo');
            $this->forge->dropColumn('tiendasdirecciones', 'tienda_pos_activo');
        }
    }
}
```

### Uso en el sistema

**Obtener tiendas con POS activo:**
```php
public function getStoresWithPOS($tienda_id)
{
    return $this->db->table('tiendasdirecciones')
        ->where('tienda_id', $tienda_id)
        ->where('tienda_pos_activo', 1)
        ->where('tienda_activo', 1)
        ->get()
        ->getResultArray();
}
```

**Validar que un empleado puede trabajar en POS:**
```php
public function canWorkOnPOS($empleado_id, $sucursal_id)
{
    $sucursal = $this->db->table('tiendasdirecciones')
        ->where('sucursal_id', $sucursal_id)
        ->where('tienda_pos_activo', 1)
        ->get()
        ->getRowArray();

    return !empty($sucursal);
}
```

---

## 3. Empleados: Campo `empleado_sucursal_id`

### Propósito
Asignar empleados a sucursales específicas, permitiendo rotación entre tiendas.

### Contexto
- Los empleados pueden rotar entre diferentes tiendas/sucursales
- Un empleado puede trabajar en múltiples sucursales
- Necesitamos saber en qué sucursal está trabajando actualmente

### Solución

**Opción A: Campo simple (un empleado, una sucursal actual)**
```sql
ALTER TABLE empleados
ADD COLUMN empleado_sucursal_id INT UNSIGNED NULL
COMMENT 'Sucursal donde trabaja actualmente'
AFTER tienda_id,
ALGORITHM=INPLACE, LOCK=NONE;

ALTER TABLE empleados
ADD INDEX idx_sucursal_id (empleado_sucursal_id),
ALGORITHM=INPLACE, LOCK=NONE;

ALTER TABLE empleados
ADD FOREIGN KEY fk_empleado_sucursal (empleado_sucursal_id)
REFERENCES tiendasdirecciones(sucursal_id)
ON DELETE SET NULL;
```

**Opción B: Tabla relacional (empleado puede trabajar en múltiples sucursales)**
```sql
CREATE TABLE empleados_sucursales (
    empleado_sucursal_asignacion_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    empleado_id INT UNSIGNED NOT NULL,
    sucursal_id INT UNSIGNED NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NULL,
    activo TINYINT(1) NOT NULL DEFAULT 1,

    INDEX idx_empleado_id (empleado_id),
    INDEX idx_sucursal_id (sucursal_id),
    INDEX idx_activo (activo),
    UNIQUE KEY unique_empleado_sucursal_activo (empleado_id, sucursal_id, activo),

    FOREIGN KEY (empleado_id) REFERENCES empleados(empleado_id) ON DELETE CASCADE,
    FOREIGN KEY (sucursal_id) REFERENCES tiendasdirecciones(sucursal_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Recomendación**: Opción A para MVP, migrar a Opción B si se necesita historial completo de rotaciones.

---

## 4. Sesiones POS: Tracking de dispositivo y sucursal

### Propósito
Registrar en qué dispositivo y sucursal se abrió sesión de POS.

### Nueva tabla sugerida

```sql
CREATE TABLE pos_sesiones (
    sesion_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tienda_id INT UNSIGNED NOT NULL,
    sucursal_id INT UNSIGNED NULL,
    empleado_id INT UNSIGNED NOT NULL,

    -- Info del dispositivo
    dispositivo_nombre VARCHAR(100) NULL COMMENT 'Nombre del dispositivo/caja',
    dispositivo_ip VARCHAR(45) NULL,
    dispositivo_mac VARCHAR(17) NULL,
    navegador TEXT NULL,

    -- Sesión
    sesion_inicio DATETIME NOT NULL,
    sesion_fin DATETIME NULL,
    sesion_activa TINYINT(1) NOT NULL DEFAULT 1,

    -- Turno de caja asociado (si existe)
    turno_id INT UNSIGNED NULL,

    INDEX idx_tienda_id (tienda_id),
    INDEX idx_sucursal_id (sucursal_id),
    INDEX idx_empleado_id (empleado_id),
    INDEX idx_sesion_activa (sesion_activa),
    INDEX idx_sesion_inicio (sesion_inicio),

    FOREIGN KEY (empleado_id) REFERENCES empleados(empleado_id) ON DELETE CASCADE,
    FOREIGN KEY (sucursal_id) REFERENCES tiendasdirecciones(sucursal_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 5. Empleados/Cajeros: Tabla `tiendausuarios` ✅ COMPLETADO

### Propósito
Gestionar empleados/cajeros del POS con autenticación por PIN y control de roles.

### Estado
✅ **IMPLEMENTADO** - Ver archivo `/app/Database/Migrations/2025-01-21-create-tiendausuarios-table.sql`

### Estructura creada

```sql
CREATE TABLE tiendausuarios (
  tiendausuario_id INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT(11) UNSIGNED NOT NULL,
  tienda_id INT(11) UNSIGNED NOT NULL,
  tiendausuario_pin VARCHAR(6) NOT NULL,
  tiendausuario_rol ENUM('cajero', 'supervisor', 'administrador') NOT NULL DEFAULT 'cajero',
  tiendausuario_activo TINYINT(1) NOT NULL DEFAULT 1,
  tiendausuario_sucursal_id INT(11) UNSIGNED NULL,
  tiendausuario_fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  tiendausuario_fecha_modificacion DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY idx_pin_tienda (tiendausuario_pin, tienda_id),
  KEY idx_usuario (usuario_id),
  KEY idx_tienda (tienda_id),
  KEY idx_sucursal (tiendausuario_sucursal_id),
  KEY idx_activo_rol (tiendausuario_activo, tiendausuario_rol),
  KEY idx_pin_lookup (tiendausuario_pin, tienda_id, tiendausuario_activo)
);
```

### Documentación completa
Ver archivo `MODULO_EMPLEADOS.md` para:
- Arquitectura completa (backend + frontend)
- Flujo de validación de PIN
- Roles y permisos
- Guía de configuración

### API Implementada
- ✅ `EmployeeModel.php` - Modelo con métodos CRUD
- ✅ `Employee.php` - Controller con 7 endpoints REST
- ✅ `employeesApi.js` - Servicio frontend
- ✅ `SupervisorAuthModal.vue` - Modal de autorización

### Estado de migración
⚠️ **PENDIENTE EJECUTAR** en servidor de producción:
```bash
ssh mtserv
cd /var/www/api2.mitienda.pe
mysql -u root -p mitienda < app/Database/Migrations/2025-01-21-create-tiendausuarios-table.sql
```

---

## Resumen de campos pendientes

| Tabla | Campo | Tipo | Propósito | Estado | Prioridad |
|-------|-------|------|-----------|--------|-----------|
| `tiendausuarios` | **TABLA COMPLETA** | - | Empleados/cajeros POS | ✅ Creada | 🔴 Alta |
| `producto` | `producto_publicado_pos` | TINYINT(1) | Publicación exclusiva POS | ⚠️ Pendiente | 🔴 Alta |
| `tiendasdirecciones` | `tienda_pos_activo` | TINYINT(1) | Identificar tiendas con POS | ⚠️ Pendiente | 🟡 Media |
| `empleados` | `empleado_sucursal_id` | INT | Asignación a sucursal | ⚠️ Pendiente | 🟡 Media |
| Nueva tabla | `pos_sesiones` | - | Tracking de sesiones POS | ⚠️ Pendiente | 🟢 Baja |

---

## Plan de ejecución

### ✅ Fase 0: Empleados/Cajeros (COMPLETADO)
```bash
# ✅ 1. Tabla tiendausuarios creada
# ✅ 2. API de empleados implementada (EmployeeModel + Employee controller)
# ✅ 3. Frontend con validación real de PIN
# ✅ 4. SupervisorAuthModal integrado con API

# ⚠️ PENDIENTE: Ejecutar migración en producción
ssh mtserv
cd /var/www/api2.mitienda.pe
mysql -u root -p mitienda < app/Database/Migrations/2025-01-21-create-tiendausuarios-table.sql

# ⚠️ PENDIENTE: Crear empleados de prueba
# Ver MODULO_EMPLEADOS.md sección "Configuración Inicial"
```

### Fase 1: Inmediato (necesario para MVP)
```bash
# 1. Agregar producto_publicado_pos
php spark migrate

# 2. Actualizar API de productos para filtrar por POS
# 3. Actualizar frontend para solo mostrar productos publicados en POS
```

### Fase 2: Corto plazo (siguiente semana)
```bash
# 1. Agregar tienda_pos_activo
# 2. Configurar qué sucursales tienen POS
# 3. Validar en login que sucursal tenga POS activo
```

### Fase 3: Mediano plazo (cuando se necesite rotación)
```bash
# 1. Usar tiendausuario_sucursal_id (ya existe en tiendausuarios)
# 2. Implementar asignación de empleados a sucursales en UI
# 3. Permitir rotación de empleados
```

### Fase 4: Largo plazo (optimización)
```bash
# 1. Crear tabla pos_sesiones
# 2. Implementar tracking automático
# 3. Reportes de uso por dispositivo/sucursal
```

---

## Siguiente paso

Necesito que confirmes:

1. ✅ **Nombre de la tabla de direcciones/sucursales**: ¿`tiendasdirecciones`? ¿O tiene otro nombre?
2. ✅ **Campo de pickup existente**: ¿Cómo se llama? ¿`tienda_pickup_activo`?
3. ✅ **Ejecutar migración de `producto_publicado_pos` ahora?** (necesario para filtrar productos en POS)

Una vez confirmes, procedo a:
- Crear las migraciones
- Actualizar el API de productos
- Continuar con el store de carrito
