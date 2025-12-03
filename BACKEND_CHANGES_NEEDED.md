# Cambios Necesarios en el Backend

## Problema Actual

Cuando el cajero se autentica con su PIN, el backend retorna los datos del empleado pero **faltan campos críticos** que el frontend necesita:

1. `empleado_netsuite_id` - Para incluir en las órdenes
2. `sucursales_ids` - Para filtrar sucursales disponibles

## Endpoint a Modificar

**Endpoint**: `POST /api/v1/pos-empleados/validate-pin`

**Ubicación probable**: `app/Controllers/Api/V1/PosEmpleadosController.php`

## Cambios Requeridos

### 1. Agregar Campo NetSuite ID a la Respuesta

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
