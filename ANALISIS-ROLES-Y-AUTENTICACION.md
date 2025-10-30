# Análisis: Roles y Autenticación en MiTiendaPOS

**Fecha:** 2025-10-29
**Estado:** Análisis del sistema actual y propuestas de mejora

---

## 📊 Estado Actual del Sistema

### 1. Tipos de Usuarios

El sistema actualmente tiene **DOS sistemas de autenticación separados:**

#### A) **Usuarios Administradores** (Tabla: `usuarios`)
- **Autenticación:** Email + Password
- **Ubicación:** Base de datos principal
- **Login:** `/login` (pantalla de admin)
- **Características:**
  - Tienen acceso completo al sistema
  - Pueden gestionar múltiples tiendas
  - No tienen PIN
  - Token JWT con `user_type: 'admin'` (implícito)

#### B) **Empleados POS** (Tabla: `posempleados`)
- **Autenticación:** PIN de 4 dígitos
- **Ubicación:** Base de datos POS
- **Login:** `/cashier-login` (nuevo)
- **Características:**
  - Asignados a una tienda específica
  - Tienen 3 roles: cajero, supervisor, administrador
  - Solo PIN (no email/password)
  - Token JWT con `user_type: 'cashier'`

---

## 🎭 Roles de Empleados POS

### Configuración Actual (en `Users.vue`)

```vue
<select v-model="formData.empleado_rol">
  <option value="cajero">Cajero</option>
  <option value="supervisor">Supervisor</option>
  <option value="administrador">Administrador</option>
</select>
```

### Permisos por Rol (Backend: `AuthController::getCashierPermissions()`)

#### **Cajero** (Rol base)
```php
Permisos: [
  'read_products',        // Ver productos
  'read_customers',       // Ver clientes
  'create_customers',     // Crear clientes
  'create_orders',        // Crear ventas
  'read_orders_own'       // Ver solo sus propias ventas
]
```

**Capacidades:**
- ✅ Realizar ventas en POS
- ✅ Ver y crear clientes
- ✅ Ver productos
- ✅ Ver SOLO sus propias ventas
- ❌ No puede ver ventas de otros
- ❌ No puede cancelar ventas
- ❌ No puede ver reportes

#### **Supervisor** (Cajero + permisos extra)
```php
Permisos base + [
  'read_orders',          // Ver todas las ventas
  'cancel_orders',        // Cancelar ventas
  'read_reports'          // Ver reportes
]
```

**Capacidades:**
- ✅ Todo lo que puede hacer un cajero
- ✅ Ver TODAS las ventas (no solo las propias)
- ✅ Cancelar ventas
- ✅ Ver reportes

#### **Administrador POS** (Supervisor + permisos extra)
```php
Permisos base + [
  'read_orders',
  'cancel_orders',
  'read_reports'
]
```

**Nota:** Actualmente tiene los **mismos permisos** que Supervisor en el código.

---

## 🔑 Preguntas Clave y Respuestas

### ❓ ¿Los supervisores y administradores POS pueden usar `/cashier-login`?

**✅ SÍ**, todos los empleados POS (cajero, supervisor, administrador) pueden autenticarse con PIN en `/cashier-login`.

**Evidencia:**
```php
// AuthController::cashierLogin()
$empleado = $empleadoModel->validatePin($tienda['tienda_id'], $pin);
// Acepta cualquier empleado con PIN válido, sin importar el rol

$permissions = $this->getCashierPermissions($empleado['empleado_rol']);
// Los permisos se asignan según el rol
```

### ❓ ¿Cómo están vinculados los usuarios admin (email/password) con empleados POS (PIN)?

**❌ NO ESTÁN VINCULADOS** actualmente.

Son dos sistemas completamente separados:

| Característica | Usuario Admin | Empleado POS |
|----------------|---------------|--------------|
| Tabla | `usuarios` | `posempleados` |
| Autenticación | Email + Password | Store ID + PIN |
| ID | `usuario_id` | `empleado_id` |
| Vínculo | ❌ No existe | ❌ No existe |

**Problema:** Un administrador que quiere usar el POS debe:
1. Hacer logout de su cuenta admin
2. Autenticarse como empleado POS con PIN
3. O un administrador debe crear un empleado POS separado con el mismo nombre

### ❓ ¿Los usuarios administradores tienen PIN?

**❌ NO**, los usuarios de la tabla `usuarios` (email/password) **no tienen campo PIN**.

Solo los empleados POS (`posempleados`) tienen PIN.

---

## 💡 Propuesta: Unificar Autenticación

### Objetivo
Permitir que un administrador pueda:
1. Autenticarse con email/password para tareas administrativas
2. **También** autenticarse con PIN para tareas frecuentes en el POS
3. Vincular su cuenta de administrador con un empleado POS

### Solución Propuesta

#### Opción 1: **Agregar PIN a usuarios administradores**

**Cambios en Base de Datos:**
```sql
ALTER TABLE usuarios
ADD COLUMN usuario_pin VARCHAR(4) DEFAULT NULL COMMENT 'PIN opcional para acceso rápido al POS';

CREATE INDEX idx_usuarios_pin ON usuarios(usuario_pin);
```

**Cambios en Backend:**
```php
// AuthController::cashierLogin()
public function cashierLogin()
{
    $storeId = $data['store_id'];
    $pin = $data['pin'];

    // PRIMERO: Buscar en posempleados (sistema actual)
    $empleadoModel = new PosEmpleadoModel();
    $empleado = $empleadoModel->validatePin($storeId, $pin);

    if ($empleado) {
        // Flujo actual de empleado POS
        return $this->generateCashierToken($empleado, $tienda);
    }

    // SEGUNDO: Buscar en usuarios administradores
    $usuarioModel = new UsuarioModel();
    $usuario = $usuarioModel
        ->where('usuario_pin', $pin)
        ->where('usuario_activo', 1)
        ->first();

    if ($usuario) {
        // Verificar que el usuario tiene acceso a esta tienda
        if (!$this->usuarioHasAccessToStore($usuario['usuario_id'], $storeId)) {
            return $this->respond([
                'success' => false,
                'message' => 'No tienes acceso a esta tienda'
            ], 403);
        }

        // Generar token de administrador pero con contexto de POS
        return $this->generateAdminPosToken($usuario, $tienda);
    }

    return $this->respond([
        'success' => false,
        'message' => 'PIN inválido'
    ], 401);
}

private function generateAdminPosToken($usuario, $tienda)
{
    $tokenPayload = [
        'iss' => base_url(),
        'sub' => $usuario['usuario_id'],
        'aud' => 'pos',
        'user_type' => 'admin',  // ← Importante: sigue siendo admin
        'usuario_id' => $usuario['usuario_id'],
        'tienda_id' => $tienda['tienda_id'],
        'store_id' => $tienda['tienda_id'],
        'permissions' => [
            'read_products',
            'read_customers',
            'create_customers',
            'create_orders',
            'read_orders',      // Admin ve todas las ventas
            'cancel_orders',
            'read_reports',
            'edit_prices',      // Permisos extras de admin
            'manage_inventory'
        ]
    ];

    $jwt = JWT::encode($tokenPayload, $this->jwtSecret, $this->jwtAlg);

    return $this->respond([
        'success' => true,
        'data' => [
            'access_token' => $jwt,
            'user_type' => 'admin',
            'usuario' => [
                'id' => $usuario['usuario_id'],
                'nombres' => $usuario['usuario_nombre'],
                'email' => $usuario['usuario_email']
            ],
            'tienda' => [
                'id' => $tienda['tienda_id'],
                'nombre' => $tienda['tienda_nombre_comercial']
            ]
        ]
    ]);
}
```

**Ventajas:**
- ✅ Administradores pueden usar PIN para acceso rápido
- ✅ Mantienen todos sus permisos de admin
- ✅ No se necesita crear empleado POS duplicado
- ✅ Un solo usuario para todo

**Desventajas:**
- ⚠️ Duplicación de lógica de autenticación
- ⚠️ Complejidad en el código

---

#### Opción 2: **Vincular usuario admin con empleado POS**

**Cambios en Base de Datos:**
```sql
ALTER TABLE posempleados
ADD COLUMN usuario_id INT DEFAULT NULL COMMENT 'Vincula empleado POS con usuario admin',
ADD CONSTRAINT fk_empleado_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(usuario_id);

CREATE INDEX idx_posempleados_usuario ON posempleados(usuario_id);
```

**Flujo:**
1. Administrador crea su cuenta (email/password)
2. En Settings > Users, el admin puede "Vincular mi cuenta con empleado POS"
3. Se crea un empleado POS con el mismo nombre y se vincula (`usuario_id`)
4. El admin puede usar:
   - Email/password para `/login` (administración completa)
   - PIN para `/cashier-login` (acceso rápido al POS)

**Ventajas:**
- ✅ Separación clara de roles
- ✅ Trazabilidad (sabemos qué empleado POS es qué admin)
- ✅ Código más limpio (usa el flujo existente)

**Desventajas:**
- ⚠️ Requiere crear empleado POS
- ⚠️ Duplicación de datos (nombre, etc)

---

#### Opción 3: **Autenticación multi-nivel contextual** (Recomendada)

Combinar ambas opciones con un sistema de **contextos de autenticación**.

**Concepto:**
- Usuario admin puede autenticarse con email/password → Modo ADMIN (todos los permisos)
- Usuario admin puede autenticarse con PIN → Modo POS (permisos limitados para POS)
- Empleado POS solo puede autenticarse con PIN → Modo POS (según su rol)

**Implementación:**

```php
// AuthController::cashierLogin()
public function cashierLogin()
{
    $storeId = $data['store_id'];
    $pin = $data['pin'];
    $tiendaModel = new TiendaModel();
    $tienda = $tiendaModel->find($storeId);

    // Buscar en AMBAS tablas
    $empleadoModel = new PosEmpleadoModel();
    $empleado = $empleadoModel->validatePin($storeId, $pin);

    $usuarioModel = new UsuarioModel();
    $usuario = $usuarioModel->where('usuario_pin', $pin)->first();

    if (!$empleado && !$usuario) {
        return $this->respond(['success' => false, 'message' => 'PIN inválido'], 401);
    }

    // Prioridad: Si hay empleado POS, usar ese (más específico)
    if ($empleado) {
        $userType = 'cashier';
        $permissions = $this->getCashierPermissions($empleado['empleado_rol']);
        $subject = 'cashier_' . $empleado['empleado_id'];
        $userData = [
            'empleado_id' => $empleado['empleado_id'],
            'nombres' => $empleado['empleado_nombres'],
            'apellidos' => $empleado['empleado_apellidos'],
            'rol' => $empleado['empleado_rol']
        ];
    } else {
        // Usuario admin con PIN
        $userType = 'admin_pos';  // ← Nuevo tipo
        $permissions = $this->getAdminPosPermissions();
        $subject = $usuario['usuario_id'];
        $userData = [
            'usuario_id' => $usuario['usuario_id'],
            'nombres' => $usuario['usuario_nombre'],
            'email' => $usuario['usuario_email']
        ];
    }

    $tokenPayload = [
        'iss' => base_url(),
        'sub' => $subject,
        'aud' => 'pos',
        'user_type' => $userType,
        'tienda_id' => $tienda['tienda_id'],
        'store_id' => $tienda['tienda_id'],
        'permissions' => $permissions
    ];

    // ... generar JWT
}

private function getAdminPosPermissions()
{
    return [
        'read_products',
        'read_customers',
        'create_customers',
        'create_orders',
        'read_orders',
        'cancel_orders',
        'read_reports',
        'edit_prices',       // Permisos adicionales de admin
        'manage_inventory',
        'access_settings'    // Solo admins
    ];
}
```

**Frontend: Actualizar authStore**
```javascript
// src/stores/auth.js
getters: {
  isAuthenticated: (state) => !!state.accessToken && !!state.user,
  isCashier: (state) => state.user?.user_type === 'cashier',
  isAdmin: (state) => state.user?.user_type === 'admin',
  isAdminPOS: (state) => state.user?.user_type === 'admin_pos',  // ← Nuevo
  isAdminAny: (state) => {
    const type = state.user?.user_type;
    return type === 'admin' || type === 'admin_pos';
  },
  canAccessSettings: (state) => {
    return state.user?.user_type === 'admin';  // Solo admin full
  }
}
```

---

## 🎯 Recomendación Final

### Implementar **Opción 3: Autenticación Multi-Nivel**

**Fases de implementación:**

### Fase 1: Agregar PIN a usuarios admin (2-3 horas)
```sql
ALTER TABLE usuarios
ADD COLUMN usuario_pin VARCHAR(4) DEFAULT NULL;
```

```vue
<!-- En Settings > Profile o Users -->
<div>
  <label>PIN de Acceso Rápido (opcional)</label>
  <input v-model="pin" type="password" maxlength="4" pattern="[0-9]{4}" />
  <p class="text-xs text-gray-500">
    Configura un PIN de 4 dígitos para acceso rápido al POS
  </p>
</div>
```

### Fase 2: Modificar endpoint cashierLogin (2 horas)
- Buscar en ambas tablas (`posempleados` y `usuarios`)
- Generar token con `user_type: 'admin_pos'` cuando es admin con PIN
- Permisos diferenciados

### Fase 3: Frontend - Manejar nuevo user_type (1 hora)
- Actualizar getters en authStore
- Ajustar UI según tipo de usuario

### Fase 4: Restricciones contextuales (1-2 horas)
Algunas acciones solo disponibles con email/password:
- Cambiar precios de productos
- Gestionar usuarios
- Configuración de tienda
- Reportes financieros sensibles

**Implementar modal "Requiere Autenticación Completa":**
```vue
<template>
  <div v-if="showUpgradeAuthModal" class="modal">
    <h3>Acción Restringida</h3>
    <p>Esta acción requiere autenticación completa con email y contraseña.</p>
    <button @click="router.push('/login')">Ir a Login Completo</button>
  </div>
</template>
```

---

## 📋 Matriz de Permisos Propuesta

| Acción | Cajero (PIN) | Supervisor (PIN) | Admin POS (PIN) | Admin Full (Email) |
|--------|--------------|------------------|-----------------|-------------------|
| Realizar ventas | ✅ | ✅ | ✅ | ✅ |
| Ver clientes | ✅ | ✅ | ✅ | ✅ |
| Crear clientes | ✅ | ✅ | ✅ | ✅ |
| Ver productos | ✅ | ✅ | ✅ | ✅ |
| Ver propias ventas | ✅ | ✅ | ✅ | ✅ |
| Ver todas las ventas | ❌ | ✅ | ✅ | ✅ |
| Cancelar ventas | ❌ | ✅ | ✅ | ✅ |
| Ver reportes | ❌ | ✅ | ✅ | ✅ |
| Editar precios | ❌ | ❌ | ⚠️ Con confirmación | ✅ |
| Gestionar inventario | ❌ | ❌ | ⚠️ Con confirmación | ✅ |
| Gestionar usuarios | ❌ | ❌ | ❌ | ✅ |
| Configuración tienda | ❌ | ❌ | ❌ | ✅ |
| Reportes financieros | ❌ | ❌ | ❌ | ✅ |

---

## ⏱️ Estimación de Tiempo

| Fase | Tarea | Tiempo | Total |
|------|-------|--------|-------|
| 1 | BD: Agregar campo `usuario_pin` | 30 min | |
| 1 | Frontend: UI para configurar PIN | 1.5 h | |
| 1 | Backend: Validación y guardado de PIN | 1 h | **3h** |
| 2 | Backend: Modificar `cashierLogin()` | 1.5 h | |
| 2 | Backend: Método `getAdminPosPermissions()` | 30 min | **2h** |
| 3 | Frontend: Actualizar authStore getters | 30 min | |
| 3 | Frontend: Ajustar UI según user_type | 30 min | **1h** |
| 4 | Frontend: Modal "Requiere Auth Completa" | 1 h | |
| 4 | Backend: Middleware para acciones sensibles | 1 h | **2h** |
| **TOTAL** | | | **8 horas** |

---

## ✅ Beneficios de la Implementación

1. **Flexibilidad:** Admins pueden usar PIN o Email según contexto
2. **Seguridad:** Acciones sensibles requieren email/password
3. **UX Mejorada:** Acceso rápido al POS sin sacrificar seguridad
4. **Trazabilidad:** Sistema sabe quién hizo qué y cómo se autenticó
5. **Escalabilidad:** Fácil agregar más niveles de autenticación en el futuro

---

## 🚧 Consideraciones de Seguridad

1. **PIN No Remplaza Password:** Email/password sigue siendo la autenticación principal
2. **Rate Limiting:** Aplicar a ambos tipos de login
3. **Logs de Auditoría:** Registrar tipo de autenticación usado
4. **Expiración de Token:**
   - Admin con email: 30 días
   - Admin con PIN: 24 horas (igual que cajero)
5. **Renovación de PIN:** Política de cambio cada 90 días (opcional)

---

## 📝 Próximos Pasos

¿Te gustaría que implemente esta solución? Puedo comenzar con:

1. **Fase 1:** Agregar campo PIN a usuarios
2. **UI:** Interfaz para que admins configuren su PIN
3. **Backend:** Modificar cashierLogin para aceptar ambos tipos

O prefieres una aproximación diferente?
