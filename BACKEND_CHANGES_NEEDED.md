# Cambios Necesarios en el Backend

## Problema Actual

Cuando el cajero se autentica con su PIN, el backend retorna los datos del empleado pero **faltan campos críticos** que el frontend necesita:

1. `empleado_netsuite_id` - Para incluir en las órdenes
2. `sucursales_ids` - Para filtrar sucursales disponibles

## Endpoints a Modificar

### 1. `POST /api/v1/auth/cashier-login` (Login directo de cajeros)

**Ubicación probable**: `app/Controllers/Api/V1/AuthController.php`

**Problema**: No retorna `netsuite_id` ni `sucursales_ids` del empleado

### 2. `POST /api/v1/pos-empleados/validate-pin` (Validación de PIN)

**Ubicación probable**: `app/Controllers/Api/V1/PosEmpleadosController.php`

**Problema**: No retorna `empleado_netsuite_id` ni `sucursales_ids`

## Cambios Requeridos

### ENDPOINT 1: `/api/v1/auth/cashier-login`

Este endpoint es el más importante ya que es el que se usa en el login directo de cajeros.

**IMPORTANTE**: El backend debe consultar el campo `empleado_netsuite_id` de la tabla `posempleados` usando el `empleado_id` que validó con el PIN.

**Respuesta actual:**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJ0eXAi...",
    "empleado": {
      "id": "5",
      "nombres": "Carlos",
      "apellidos": "Vidal",
      "rol": "cajero"
    },
    "tienda": {
      "id": "12097",
      "nombre": "sanjorgeprueba",
      "ruc": "20603317204"
    }
  }
}
```

**Respuesta esperada (AGREGAR CAMPOS):**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJ0eXAi...",
    "empleado": {
      "id": "5",
      "nombres": "Carlos",
      "apellidos": "Vidal",
      "rol": "cajero",
      "netsuite_id": "890",           // ← AGREGAR ESTE CAMPO
      "sucursales_ids": "404,405"     // ← AGREGAR ESTE CAMPO (IDs separados por comas)
    },
    "tienda": {
      "id": "12097",
      "nombre": "sanjorgeprueba",
      "ruc": "20603317204"
    }
  }
}
```

**Código PHP a modificar:**
```php
// En AuthController::cashierLogin()

// 1. Al buscar el empleado, incluir los campos necesarios
$empleadoModel = new \App\Models\PosEmpleadoModel();
$empleado = $empleadoModel
    ->select([
        'empleado_id',
        'empleado_nombres',
        'empleado_apellidos',
        'empleado_rol',
        'empleado_pin',
        'empleado_netsuite_id',  // ← IMPORTANTE: Incluir este campo en la query
        'empleado_activo'
    ])
    ->where('tienda_id', $tienda['tienda_id'])
    ->where('empleado_pin', $pin)
    ->where('empleado_activo', 1)
    ->first();

// 2. Si las sucursales están en una tabla de relación, obtenerlas
$sucursalesModel = new \App\Models\PosEmpleadoSucursalModel();
$sucursalesIds = $sucursalesModel
    ->where('empleado_id', $empleado['empleado_id'])
    ->findColumn('tiendadireccion_id');

$empleado['sucursales_ids'] = !empty($sucursalesIds) ? implode(',', $sucursalesIds) : null;

// 3. Retornar la respuesta con los campos completos
return $this->respond([
    'success' => true,
    'data' => [
        'access_token' => $jwt,
        'empleado' => [
            'id' => $empleado['empleado_id'],
            'nombres' => $empleado['empleado_nombres'],
            'apellidos' => $empleado['empleado_apellidos'],
            'rol' => $empleado['empleado_rol'],
            'netsuite_id' => $empleado['empleado_netsuite_id'] ?? null,  // ← AGREGAR
            'sucursales_ids' => $empleado['sucursales_ids'] ?? null      // ← AGREGAR
        ],
        'tienda' => [
            'id' => $tienda['tienda_id'],
            'nombre' => $tienda['tienda_nombre_comercial'],
            'ruc' => $tienda['tienda_ruc']
        ]
    ]
]);
```

---

### ENDPOINT 2: `/api/v1/pos-empleados/validate-pin`

El método `validatePin()` debe incluir `empleado_netsuite_id` en la respuesta:

```php
public function validatePin()
{
    // ... validación de PIN existente ...

    // Al retornar los datos del empleado, asegurar que incluye:
    return $this->response->setJSON([
        'success' => true,
        'data' => [
            'empleado_id' => $empleado->empleado_id,
            'empleado_nombres' => $empleado->empleado_nombres,
            'empleado_apellidos' => $empleado->empleado_apellidos,
            'empleado_rol' => $empleado->empleado_rol,
            'empleado_netsuite_id' => $empleado->empleado_netsuite_id, // ← AGREGAR ESTE CAMPO
            'sucursales_ids' => $empleado->sucursales_ids, // ← AGREGAR ESTE CAMPO (puede ser NULL)
            // ... otros campos existentes ...
        ]
    ]);
}
```

### 2. Asegurar que el Modelo Incluye los Campos

**Archivo**: `app/Models/PosEmpleadoModel.php`

Verificar que `$allowedFields` incluya:

```php
protected $allowedFields = [
    // ... campos existentes ...
    'empleado_netsuite_id',  // ← Verificar que existe
];
```

### 3. Verificar la Query de Validación

La consulta que busca al empleado por PIN debe incluir los campos necesarios:

```php
$empleado = $model->select([
    'empleado_id',
    'empleado_nombres',
    'empleado_apellidos',
    'empleado_rol',
    'empleado_netsuite_id',  // ← AGREGAR
    'empleado_activo',
    // ... otros campos ...
])
->where('empleado_pin', $pin)
->where('tienda_id', $tiendaId)
->first();
```

### 4. Incluir Sucursales Asignadas

Si las sucursales están en una tabla relacionada, necesitas hacer un JOIN o subconsulta:

```php
// Opción A: Si está en la misma tabla como string separado por comas
$empleado = $model->find($empleadoId);

// Opción B: Si está en tabla de relación
$sucursalesIds = $empleadoSucursalesModel
    ->where('empleado_id', $empleadoId)
    ->findColumn('tiendadireccion_id');

$empleado['sucursales_ids'] = implode(',', $sucursalesIds);
```

## Testing

Después de hacer los cambios, probar el endpoint:

```bash
curl -X POST https://api2.mitienda.pe/api/v1/pos-empleados/validate-pin \
  -H "Content-Type: application/json" \
  -d '{
    "tienda_id": 404,
    "pin": "1234"
  }'
```

**Respuesta esperada**:
```json
{
  "success": true,
  "data": {
    "empleado_id": 2,
    "empleado_nombres": "Juan",
    "empleado_apellidos": "Pérez",
    "empleado_rol": "cajero",
    "empleado_netsuite_id": "12345",  // ← DEBE ESTAR AQUÍ
    "sucursales_ids": "1,2,3"         // ← DEBE ESTAR AQUÍ
  }
}
```

## Impacto

Una vez implementados estos cambios:

1. ✅ Las órdenes incluirán el `empleado_netsuite_id` correctamente
2. ✅ El modal de apertura de turno solo mostrará sucursales asignadas al cajero
3. ✅ Mayor seguridad al prevenir que cajeros abran turnos en sucursales no autorizadas

## Orden de Implementación

1. Agregar columna `empleado_netsuite_id` a tabla `posempleados` (migración ya proporcionada anteriormente)
2. Actualizar modelo para incluir el campo en `$allowedFields`
3. Modificar método `validatePin()` para incluir ambos campos en la respuesta
4. Probar con un empleado que tenga NetSuite ID asignado
5. Probar filtrado de sucursales en el POS
