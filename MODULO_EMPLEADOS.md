# Módulo de Empleados/Cajeros del POS

## Descripción

Sistema completo para gestionar empleados/cajeros del POS con autenticación mediante PIN de 6 dígitos y control de permisos basado en roles.

## Arquitectura

### Backend (API)

**Tabla: `tiendausuarios`**

```sql
tiendausuario_id          INT(11) AUTO_INCREMENT PRIMARY KEY
usuario_id                INT(11) FK -> usuarios.usuario_id
tienda_id                 INT(11) FK -> tiendas.tienda_id
tiendausuario_pin         VARCHAR(6) NOT NULL (PIN de 6 dígitos)
tiendausuario_rol         ENUM('cajero', 'supervisor', 'administrador')
tiendausuario_activo      TINYINT(1) DEFAULT 1
tiendausuario_sucursal_id INT(11) FK -> tiendas.tienda_id (para rotación)
tiendausuario_fecha_creacion
tiendausuario_fecha_modificacion
```

**Modelo: `EmployeeModel.php`**

Métodos principales:
- `getEmployeesByStore($tiendaId, $activeOnly)` - Lista de empleados
- `validateEmployeePin($pin, $tiendaId)` - Validar PIN
- `getEmployee($employeeId, $tiendaId)` - Obtener empleado
- `createEmployee($data)` - Crear empleado
- `updateEmployee($employeeId, $tiendaId, $data)` - Actualizar
- `changePin($employeeId, $tiendaId, $newPin)` - Cambiar PIN

**Controller: `Employee.php`**

Endpoints:

```
GET    /api/v1/employees                  - Listar empleados
GET    /api/v1/employees/:id              - Obtener empleado
POST   /api/v1/employees                  - Crear empleado
PUT    /api/v1/employees/:id              - Actualizar empleado
DELETE /api/v1/employees/:id              - Desactivar empleado
POST   /api/v1/employees/validate-pin     - Validar PIN ⭐
PUT    /api/v1/employees/:id/change-pin   - Cambiar PIN
```

### Frontend (POS)

**Servicio: `employeesApi.js`**

```javascript
employeesApi.getEmployees(activeOnly)
employeesApi.getEmployee(employeeId)
employeesApi.createEmployee(data)
employeesApi.updateEmployee(employeeId, data)
employeesApi.deleteEmployee(employeeId)
employeesApi.validatePin(pin)           // ⭐ Usado por SupervisorAuthModal
employeesApi.changePin(employeeId, newPin)
```

**Componente: `SupervisorAuthModal.vue`**

Modal para solicitar PIN de supervisor/administrador antes de ejecutar acciones restringidas.

Características:
- 6 inputs de 1 dígito cada uno
- Auto-focus y navegación con teclado
- Auto-submit al completar el último dígito
- Soporte para paste de PIN completo
- Límite de 3 intentos fallidos
- Validación de rol (solo supervisor/administrador)
- Logs detallados para debugging

**Store: `cart.js`**

Valida permisos antes de modificar el carrito:

```javascript
// Estados
'ABIERTO'    - Carrito editable libremente
'BLOQUEADO'  - Requiere PIN para agregar (cajero) o quitar (supervisor)
'PAGADO'     - Requiere PIN de supervisor para cualquier cambio
'FINALIZADO' - Carrito cerrado, no editable

// Getters de permisos
canAddProducts      - Puede agregar productos
canEditQuantity     - Puede editar cantidades
canRemoveProducts   - Puede quitar productos
canAddPayments      - Puede agregar pagos
canRemovePayments   - Puede quitar pagos (siempre false, requiere supervisor)

// Actions que requieren autorización
addItem(product, authorization)
removeItem(productId, supervisorAuth)
updateItemQuantity(productId, newQuantity, authorization)
removePayment(paymentIndex, supervisorAuth)
```

## Flujo de Validación

### 1. Usuario intenta acción restringida (ej: eliminar producto después de pago)

```javascript
// En POS.vue
const removeItem = (item) => {
  if (!cartStore.canRemoveProducts) {
    // Carrito bloqueado o pagado - requiere supervisor
    pendingAction.value = { type: 'remove_item', data: item };
    showSupervisorAuth.value = true;  // Mostrar modal
    return;
  }

  // Carrito ABIERTO - permitir directamente
  cartStore.removeItem(item.id);
};
```

### 2. SupervisorAuthModal se muestra

```javascript
// Usuario ingresa PIN de 6 dígitos
// Al completar, llama automáticamente a authorize()

const authorize = async () => {
  const response = await employeesApi.validatePin(pin.value);

  if (response.error === 0 && response.data) {
    const employee = response.data;

    // Verificar rol
    if (['supervisor', 'administrador'].includes(employee.role)) {
      emit('authorized', {
        employeeId: employee.id,
        employeeName: employee.name,
        role: employee.role,
        action: props.action,
        timestamp: new Date().toISOString()
      });
    } else {
      error.value = `${employee.name} no tiene permisos de supervisor`;
    }
  }
};
```

### 3. Backend valida PIN

```php
// EmployeeModel::validateEmployeePin()
SELECT tu.*, u.usuario_nombre, u.usuario_email
FROM tiendausuarios tu
JOIN usuarios u ON u.usuario_id = tu.usuario_id
WHERE tu.tiendausuario_pin = '123456'
  AND tu.tienda_id = 404
  AND tu.tiendausuario_activo = 1
```

### 4. POS recibe autorización y ejecuta acción

```javascript
// En POS.vue
const onSupervisorAuthorized = (authData) => {
  const { type, data } = pendingAction.value;

  switch (type) {
    case 'remove_item':
      cartStore.removeItem(data.id, authData);  // ✅ Con autorización
      break;
    // ... otros casos
  }
};
```

### 5. Cart store valida rol y ejecuta

```javascript
// En cart.js
removeItem(productId, supervisorAuth = null) {
  // Validar autorización
  if (!this.canRemoveProducts && !supervisorAuth) {
    throw new Error('Requiere PIN de supervisor');
  }

  // Validar rol
  if (supervisorAuth && !['supervisor', 'administrador'].includes(supervisorAuth.role)) {
    throw new Error('Solo supervisores pueden eliminar productos');
  }

  // Ejecutar
  this.items = this.items.filter(i => i.id !== productId);

  // Auditoría
  this._logAudit('REMOVE_ITEM', supervisorAuth, { productId });
}
```

## Roles y Permisos

### Cajero
- ✅ Agregar productos a carrito bloqueado (con PIN)
- ❌ NO puede quitar productos de carrito bloqueado
- ❌ NO puede quitar pagos
- ❌ NO puede hacer devoluciones
- ❌ NO puede aplicar descuentos especiales

### Supervisor
- ✅ Todo lo que puede cajero
- ✅ Quitar productos de carrito bloqueado
- ✅ Quitar pagos registrados
- ✅ Hacer devoluciones (futuro)
- ✅ Aplicar descuentos especiales (futuro)

### Administrador
- ✅ Todo lo que puede supervisor
- ✅ Gestionar empleados (crear, editar, desactivar)
- ✅ Cambiar PINs de empleados
- ✅ Ver reportes de auditoría (futuro)
- ✅ Acceso al panel de administración web

## Configuración Inicial

### 1. Ejecutar migración en base de datos

```bash
ssh mtserv
cd /var/www/api2.mitienda.pe
mysql -u root -p mitienda < app/Database/Migrations/2025-01-21-create-tiendausuarios-table.sql
```

### 2. Crear empleados de prueba

```sql
-- Obtener tu usuario_id
SELECT usuario_id, usuario_email FROM usuarios WHERE usuario_email = 'carlos@mitienda.pe';

-- Insertar empleados de prueba
INSERT INTO tiendausuarios
  (usuario_id, tienda_id, tiendausuario_pin, tiendausuario_rol, tiendausuario_activo)
VALUES
  (408, 404, '123456', 'supervisor', 1),
  (408, 404, '654321', 'administrador', 1),
  (408, 404, '111111', 'cajero', 1);
```

### 3. Verificar configuración

```bash
# Test del API
curl -X POST "https://api2.mitienda.pe/api/v1/employees/validate-pin" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"pin":"123456"}'

# Respuesta esperada:
{
  "error": 0,
  "message": "PIN válido",
  "data": {
    "id": 1,
    "user_id": 408,
    "store_id": 404,
    "name": "Carlos Vidal",
    "email": "carlos@mitienda.pe",
    "role": "supervisor",
    "branch_id": null
  }
}
```

## Debugging

### Logs en Console del navegador

Cuando intentes eliminar un producto después de pagar, verás:

```
🗑️ [CART] removeItem called: {
  productId: 123,
  status: "PAGADO",
  canRemoveProducts: false,
  hasSupervisorAuth: false
}
❌ [CART] Cannot remove - requires supervisor authorization

🔐 [AUTH] Attempting authorization: { pin: "123456", action: "remove_item" }
🔐 [API] Validating PIN: 123456
🔐 [API] PIN validation response: { error: 0, data: {...} }
🔐 [AUTH] API response: { error: 0, message: "PIN válido", data: {...} }
✅ [AUTH] Authorization successful: {
  employeeId: 1,
  employeeName: "Carlos Vidal",
  role: "supervisor",
  action: "remove_item",
  timestamp: "2025-01-21T..."
}

✅ [POS] Supervisor authorized
🗑️ [POS] Removing item with supervisor authorization
🗑️ [CART] removeItem called: {
  productId: 123,
  status: "PAGADO",
  canRemoveProducts: false,
  hasSupervisorAuth: true,
  authData: { employeeId: 1, role: "supervisor", ... }
}
✅ [CART] Item removed successfully
```

### Si el PIN es incorrecto:

```
❌ [API] Error validating PIN: { error: 1, message: "PIN incorrecto..." }
⚠️ [AUTH] Invalid PIN or employee not found
```

### Si el rol es insuficiente (ej: cajero intenta eliminar):

```
✅ [AUTH] Authorization successful: { role: "cajero", ... }
⚠️ [AUTH] Employee found but insufficient permissions: cajero
❌ [CART] Invalid role for removal: cajero
Error: Solo supervisores y administradores pueden eliminar productos
```

## Próximos Pasos

### Fase 1 (Actual) ✅
- [x] Crear tabla tiendausuarios
- [x] API de validación de PIN
- [x] SupervisorAuthModal con API real
- [x] Validación de roles en cart store
- [x] Logs de debugging

### Fase 2 (Futuro)
- [ ] Vista de gestión de empleados en el POS
- [ ] Crear/editar/desactivar empleados desde el POS
- [ ] Cambio de PIN por el mismo empleado
- [ ] Reset de PIN por administrador
- [ ] Log de auditoría en base de datos (quién autorizó qué)
- [ ] Reportes de actividad por empleado
- [ ] Integración con sistema de asistencia

### Fase 3 (Notas de Crédito)
- [ ] Devoluciones con autorización de supervisor
- [ ] Generación de notas de crédito
- [ ] Uso de notas de crédito como método de pago
- [ ] Integración con SUNAT para anulaciones

## Notas Importantes

1. **Seguridad**: Los PINs se almacenan en texto plano por ahora. Considera hashearlos con bcrypt en producción.

2. **Rotación de empleados**: El campo `tiendausuario_sucursal_id` permite que un empleado trabaje en diferentes sucursales de la misma tienda.

3. **PIN único por tienda**: Un mismo empleado puede tener diferentes PINs en diferentes tiendas (constraint `idx_pin_tienda`).

4. **Desactivación vs Eliminación**: Se usa soft-delete (`tiendausuario_activo = 0`) para mantener historial.

5. **JWT Token**: El token actual contiene `store_id`, asegurando que solo se validen PINs de empleados de esa tienda.

## Troubleshooting

**Problema**: "Can't find a route for 'POST: api/v1/employees/validate-pin'"

**Solución**:
```bash
# Verificar que las rutas estén registradas
cd /var/www/api2.mitienda.pe
php spark routes | grep employees

# Si no aparecen, hacer git pull del API
git pull origin main
```

**Problema**: El modal no se muestra al intentar eliminar producto

**Solución**: Verificar en console que el estado del carrito sea 'BLOQUEADO' o 'PAGADO':
```javascript
console.log('Cart status:', cartStore.status);
console.log('Can remove:', cartStore.canRemoveProducts);
```

**Problema**: PIN válido pero dice "no tiene permisos"

**Solución**: Verificar el rol en la base de datos:
```sql
SELECT tiendausuario_pin, tiendausuario_rol
FROM tiendausuarios
WHERE tiendausuario_pin = '123456';
```
