# Manejo de Errores en Login de Cajero

## 📋 Problema Original

El error de autenticación de cajeros no era específico, lo que dificultaba el soporte. Por ejemplo, un error 403 por "fuera de horario" no mostraba detalles claros al usuario ni al administrador.

**Caso real**: Cajero con `store_id: 12097` y `PIN: 2345` no podía ingresar mostrando error genérico, cuando en realidad tenía un horario restrictivo (08:00-10:00) y estaba intentando ingresar a las 14:58.

---

## 🎯 Todas las Razones de Fallo en Login de Cajero

| Código HTTP | Causa | Mensaje Mejorado (Frontend) | Solución para Soporte |
|-------------|-------|----------------------------|----------------------|
| **400** | Parámetros faltantes (`store_id` o `pin` no enviados) | "Datos incompletos. Verifica el ID de tienda y PIN" | Verificar que la UI esté enviando ambos campos |
| **401** | PIN incorrecto | "PIN incorrecto o empleado desactivado" | Verificar PIN del cajero en Configuración → Usuarios |
| **401** | Empleado desactivado (`empleado_activo = 0`) | "PIN incorrecto o empleado desactivado" | Ir a Configuración → Usuarios → Activar empleado |
| **403** | Fuera de horario de trabajo | "⏰ Fuera de horario. Tu horario es de 08:00 a 10:00 (hora actual: 14:58)" | Ir a Configuración → Usuarios → Ajustar horario o dejarlo vacío |
| **404** | Tienda no existe | "La tienda con ID 12097 no existe" | Verificar que el `store_id` sea correcto |
| **500** | Error de sistema (BD caída, JWT secret faltante, etc.) | "Error al iniciar sesión. Intenta nuevamente" | Revisar logs del servidor |

---

## ✅ Cambios Implementados

### Frontend (mitienda-POS) - ✅ COMPLETADO

**Archivo modificado**: `src/views/CashierLogin.vue` (líneas 193-230)

**Mejoras**:
- ✅ Detección específica de errores por código HTTP (400, 401, 403, 404, 500)
- ✅ Mensajes de error claros y accionables
- ✅ Muestra detalles de horario cuando está fuera de horario
- ✅ Muestra ID de tienda cuando no existe
- ✅ Diferencia entre errores de autenticación y configuración

**Código implementado**:
```javascript
catch (err) {
  const response = err.response?.data;
  const status = err.response?.status;

  if (status === 401) {
    // PIN inválido o empleado inactivo
    error.value = response?.message || 'PIN incorrecto o empleado desactivado';
  } else if (status === 403) {
    // Fuera de horario
    const horarioInicio = response?.empleado_horario_inicio?.substring(0, 5);
    const horarioFin = response?.empleado_horario_fin?.substring(0, 5);
    const horaActual = response?.hora_actual?.substring(0, 5);

    if (horarioInicio && horarioFin) {
      error.value = `⏰ Fuera de horario. Tu horario es de ${horarioInicio} a ${horarioFin} (hora actual: ${horaActual})`;
    } else {
      error.value = response?.message || 'No tienes permiso para ingresar en este momento';
    }
  } else if (status === 404) {
    // Tienda no encontrada
    error.value = `La tienda con ID ${storeId.value} no existe`;
  } else if (status === 400) {
    // Parámetros faltantes
    error.value = 'Datos incompletos. Verifica el ID de tienda y PIN';
  } else {
    // Error genérico
    error.value = response?.message || err.message || 'Error al iniciar sesión. Intenta nuevamente';
  }

  pin.value = ''; // Limpiar PIN
  pinInput.value?.focus();
}
```

---

### Backend (mitienda-api-ci4) - 📝 PENDIENTE DE IMPLEMENTAR

**Archivos a modificar**:
1. `app/Models/PosEmpleadoModel.php`
2. `app/Controllers/AuthController.php`

#### 1. Agregar método `validatePinDetailed()` en PosEmpleadoModel.php

**Ubicación**: Después del método `validatePin()` (línea ~84)

```php
/**
 * Validate PIN with detailed error information
 *
 * Error codes:
 * - INVALID_PIN: PIN does not exist for this store
 * - EMPLOYEE_INACTIVE: Employee exists but is deactivated
 *
 * @return array ['success' => bool, 'empleado' => array|null, 'error_code' => string|null, 'error_message' => string|null]
 */
public function validatePinDetailed(int $tiendaId, string $pin): array
{
    // First check if the PIN exists for this store (regardless of active status)
    $empleadoWithPin = $this->where('tienda_id', $tiendaId)
                             ->where('empleado_pin', $pin)
                             ->first();

    if (!$empleadoWithPin) {
        return [
            'success' => false,
            'empleado' => null,
            'error_code' => 'INVALID_PIN',
            'error_message' => 'PIN incorrecto para esta tienda'
        ];
    }

    // Check if employee is active
    if (!$empleadoWithPin['empleado_activo']) {
        return [
            'success' => false,
            'empleado' => $empleadoWithPin,
            'error_code' => 'EMPLOYEE_INACTIVE',
            'error_message' => sprintf(
                'Empleado "%s %s" está desactivado. Contacta al administrador.',
                $empleadoWithPin['empleado_nombres'],
                $empleadoWithPin['empleado_apellidos']
            )
        ];
    }

    // All validations passed
    return [
        'success' => true,
        'empleado' => $empleadoWithPin,
        'error_code' => null,
        'error_message' => null
    ];
}
```

#### 2. Actualizar AuthController::cashierLogin()

**Ubicación**: `app/Controllers/AuthController.php`, línea ~330

**Cambio 1 - Validación de PIN con detalles**:

Reemplazar:
```php
$empleado = $empleadoModel->validatePin($storeId, $pin);
log_message('error', 'AuthController::cashierLogin - Empleado encontrado: ' . ($empleado ? 'SÍ' : 'NO'));

if (!$empleado) {
    return $this->fail('PIN inválido o empleado inactivo', 401);
}
```

Por:
```php
$validation = $empleadoModel->validatePinDetailed($storeId, $pin);
log_message('error', 'AuthController::cashierLogin - Validación: ' . json_encode([
    'success' => $validation['success'],
    'error_code' => $validation['error_code'] ?? null
]));

if (!$validation['success']) {
    return $this->fail($validation['error_message'], 401);
}

$empleado = $validation['empleado'];
```

**Cambio 2 - Mensaje de error de horario mejorado**:

**Ubicación**: Línea ~340

Reemplazar:
```php
if (!$ignoreSchedule && !$empleadoModel->canWorkNow($empleado['empleado_id'])) {
    return $this->respond([
        'success' => false,
        'message' => 'Fuera del horario permitido',
        'empleado_horario_inicio' => $empleado['empleado_horario_inicio'],
        'empleado_horario_fin' => $empleado['empleado_horario_fin'],
        'hora_actual' => date('H:i:s')
    ], 403);
}
```

Por:
```php
if (!$ignoreSchedule && !$empleadoModel->canWorkNow($empleado['empleado_id'])) {
    $horaInicio = substr($empleado['empleado_horario_inicio'], 0, 5); // 08:00
    $horaFin = substr($empleado['empleado_horario_fin'], 0, 5); // 10:00
    $horaActual = date('H:i');

    return $this->respond([
        'success' => false,
        'error_code' => 'OUTSIDE_SCHEDULE',
        'message' => sprintf(
            'Fuera de horario. Tu horario es de %s a %s (hora actual: %s)',
            $horaInicio,
            $horaFin,
            $horaActual
        ),
        'empleado_horario_inicio' => $empleado['empleado_horario_inicio'],
        'empleado_horario_fin' => $empleado['empleado_horario_fin'],
        'hora_actual' => date('H:i:s')
    ], 403);
}
```

---

## 🚀 Proceso de Implementación en Backend

**⚠️ IMPORTANTE**: NO editar archivos directamente en el servidor. Ver `docs/deployment-bare-repository.md`

```bash
# 1. Ve al repositorio del backend
cd /path/to/mitienda-api-ci4

# 2. Crea una rama para las mejoras
git checkout -b feature/improve-cashier-login-errors

# 3. Implementa los cambios en:
#    - app/Models/PosEmpleadoModel.php
#    - app/Controllers/AuthController.php

# 4. Prueba localmente
php spark serve
# Probar con curl o Postman:
curl -X POST http://localhost:8080/api/v1/auth/cashier-login \
  -H "Content-Type: application/json" \
  -d '{"store_id": 12097, "pin": "9999"}'

# 5. Commitea
git add .
git commit -m "feat: improve cashier login error messages for better support

- Add validatePinDetailed() method to distinguish between invalid PIN and inactive employee
- Improve schedule error message to show specific times
- Add error_code field to responses for frontend processing"

# 6. Sube a GitHub (backup)
git push origin feature/improve-cashier-login-errors

# 7. Despliega a producción
git push live feature/improve-cashier-login-errors:master

# 8. Verifica en producción
curl https://api2.mitienda.pe/api/v1/auth/cashier-login \
  -H "Content-Type: application/json" \
  -d '{"store_id": 12097, "pin": "9999"}'
```

---

## 📚 Guía de Soporte para Administradores

### Cuando un Cajero Reporta que No Puede Ingresar

**1. Pregunta al cajero**: "¿Qué mensaje de error te aparece exactamente?"

**2. Según el mensaje, actúa**:

#### ⏰ "Fuera de horario. Tu horario es de X a Y"
**Causa**: El cajero tiene un horario restrictivo configurado

**Solución**:
1. Ir a **Configuración** → **Usuarios** en el POS
2. Buscar al empleado en la lista
3. Click en botón **Editar** (ícono de lápiz)
4. Ajustar campos:
   - **Horario Inicio**: Cambiar a horario más amplio (ej: 07:00) o dejarlo vacío
   - **Horario Fin**: Cambiar a horario más amplio (ej: 23:00) o dejarlo vacío
   - **Nota**: Si ambos campos están vacíos, el cajero puede ingresar en cualquier horario
5. Click en **Guardar**
6. El cajero puede intentar ingresar nuevamente

**Alternativa rápida (solo emergencias)**:
```bash
ssh -i ~/.ssh/ssh-key-2025-06-23.key ubuntu@150.136.181.143
mysql -h 129.213.75.80 -u admin -p'PASSWORD' mitiendape

UPDATE pos_empleados
SET empleado_horario_inicio = NULL,
    empleado_horario_fin = NULL
WHERE empleado_id = X AND tienda_id = Y;
```

#### 🔐 "PIN incorrecto o empleado desactivado"
**Posibles causas**:
- El cajero está usando el PIN incorrecto
- El empleado fue desactivado

**Solución**:
1. Ir a **Configuración** → **Usuarios**
2. Buscar al empleado
3. Verificar:
   - ¿Aparece badge "Inactivo"? → Click **Editar** y marcar como activo
   - ¿PIN correcto? → El cajero puede estar confundiendo su PIN
4. Si es necesario, resetear PIN desde la UI de edición

#### 🏪 "La tienda con ID X no existe"
**Causa**: El cajero está ingresando un `store_id` incorrecto

**Solución**:
- Verificar el ID correcto de la tienda
- Comunicar al cajero el `store_id` correcto
- Considerar pegar un letrero en la caja registradora con el `store_id` correcto

#### 📝 "Datos incompletos. Verifica el ID de tienda y PIN"
**Causa**: Problema con el formulario o el cajero no llenó todos los campos

**Solución**:
- Pedir al cajero que verifique que ingresó ambos: `store_id` y `PIN`
- Si el problema persiste, puede ser un bug en la UI

#### ❌ "Error al iniciar sesión. Intenta nuevamente"
**Causa**: Error de sistema (base de datos caída, servidor con problemas, etc.)

**Solución**:
1. Verificar conectividad
2. Revisar logs del servidor:
```bash
ssh -i ~/.ssh/ssh-key-2025-06-23.key ubuntu@150.136.181.143
tail -n 100 /var/www/api2.mitienda.pe/writable/logs/log-$(date +%Y-%m-%d).log | grep -A 10 "cashierLogin"
```

---

## 🔍 Debugging Avanzado

### Ver Logs de Intentos de Login

```bash
# Conectarse al servidor
ssh -i ~/.ssh/ssh-key-2025-06-23.key ubuntu@150.136.181.143

# Ver últimos intentos de login de cajero
tail -n 300 /var/www/api2.mitienda.pe/writable/logs/log-$(date +%Y-%m-%d).log | grep -E "(cashierLogin|PIN)"

# Ver intentos de una tienda específica
tail -n 500 /var/www/api2.mitienda.pe/writable/logs/log-$(date +%Y-%m-%d).log | grep "12097"

# Ver errores de autenticación
tail -n 200 /var/www/api2.mitienda.pe/writable/logs/log-$(date +%Y-%m-%d).log | grep -E "(401|403)" | grep cashier
```

### Verificar Datos de Empleado en Base de Datos

```bash
ssh -i ~/.ssh/ssh-key-2025-06-23.key ubuntu@150.136.181.143

mysql -h 129.213.75.80 -u admin -p'nlZ1SWm%$h0@8aJ^G6aocm1&u4XeetLa' mitiendape

# Ver empleados de una tienda
SELECT
  empleado_id,
  empleado_nombres,
  empleado_apellidos,
  empleado_pin,
  empleado_activo,
  empleado_horario_inicio,
  empleado_horario_fin
FROM pos_empleados
WHERE tienda_id = 12097;

# Buscar empleado por PIN
SELECT
  empleado_id,
  empleado_nombres,
  empleado_apellidos,
  empleado_activo,
  empleado_horario_inicio,
  empleado_horario_fin
FROM pos_empleados
WHERE tienda_id = 12097 AND empleado_pin = '2345';
```

---

## 📊 Matriz de Decisión Rápida

| Síntoma | Causa Probable | Acción Inmediata |
|---------|----------------|------------------|
| Error muestra horarios | Restricción de horario | Config → Usuarios → Editar horario |
| "PIN incorrecto" constante | PIN equivocado o empleado inactivo | Config → Usuarios → Verificar estado y PIN |
| Error solo en cierta tienda | `store_id` incorrecto | Verificar ID de tienda |
| Error esporádico | Problema de red o servidor | Revisar logs, reintentar |
| Error en todos los cajeros | Problema del backend | Revisar servidor y base de datos |

---

## ✅ Checklist de Verificación

Cuando un cajero no puede ingresar:

- [ ] ¿Qué mensaje de error específico aparece?
- [ ] ¿El empleado existe en Configuración → Usuarios?
- [ ] ¿El empleado está marcado como Activo?
- [ ] ¿El empleado tiene horario restrictivo?
- [ ] ¿El `store_id` es correcto?
- [ ] ¿El PIN es correcto (4 dígitos)?
- [ ] ¿Los logs muestran el intento de login?

---

## 📝 Notas

- **Frontend mejorado**: ✅ Ya implementado en este repositorio (mitienda-POS)
- **Backend pendiente**: Los cambios propuestos para el backend deben implementarse en el repositorio `mitienda-api-ci4` siguiendo el proceso de despliegue con repositorio bare
- **NO editar servidor directamente**: Todos los cambios de código deben hacerse localmente y desplegarse con `git push live`
