# Plan: Login Directo para Cajeros (RUC/ID Tienda + PIN)

## 📋 Objetivo

Permitir que cajeros se autentiquen **directamente** en el POS sin que primero un administrador deba hacer login, usando:
- **RUC o ID de la tienda** (para identificar el tenant)
- **PIN de 4 dígitos** (para identificar al cajero)

## 🎯 Requisitos

1. ✅ Solo se puede loguear si el usuario existe en la tienda
2. ✅ Solo se puede loguear si está dentro de su horario de trabajo
3. ✅ No debe afectar el flujo actual de login de administradores
4. ✅ Debe generar un token JWT válido para trabajar con el POS
5. ✅ Debe tener acceso limitado (solo permisos de cajero)

---

## 🏗️ Arquitectura Propuesta

### Flujo Actual (Admin)
```
Usuario Admin
   ↓
Login con Email/Password
   ↓
Obtiene access_token (JWT)
   ↓
Selecciona Tienda
   ↓
Nuevo token con store_id en payload
   ↓
Autentica Cajero con PIN (modal)
   ↓
Trabaja en POS
```

### Flujo Propuesto (Cajero Directo)
```
Usuario Cajero
   ↓
Login Cajero: RUC + PIN
   ↓
Backend:
  1. Busca tienda por RUC
  2. Valida PIN del cajero en esa tienda
  3. Valida horario de trabajo
  4. Genera JWT con:
     - user_type: 'cashier'
     - tienda_id: X
     - empleado_id: Y
     - permissions: ['read_products', 'create_orders', ...]
   ↓
Frontend recibe token
   ↓
Guarda en authStore Y cashierStore
   ↓
Redirige a /menu
   ↓
Trabaja en POS
```

---

## 🔐 Análisis de Tokens JWT

### Token Actual (Usuario Admin)
```javascript
{
  "iss": "https://api2.mitienda.pe/",
  "sub": "408",  // usuario_id
  "aud": "mobile",
  "iat": 1761010948,
  "exp": 1763602948,
  "user_id": 408,
  "email": "carlos@mitienda.pe",
  "store_id": 404,  // agregado al seleccionar tienda
  "permissions": ["read_products", "read_orders", "read_customers"]
}
```

### Token Propuesto (Usuario Cajero)
```javascript
{
  "iss": "https://api2.mitienda.pe/",
  "sub": "cashier_15",  // empleado_id prefijado
  "aud": "pos",  // audiencia específica para cajeros
  "iat": 1761010948,
  "exp": 1761097348,  // expiración más corta (24h en vez de 30 días)
  "user_type": "cashier",  // ← NUEVO: identifica tipo de usuario
  "empleado_id": 15,  // ← NUEVO: ID del empleado POS
  "tienda_id": 404,  // ← IMPORTANTE: tenant
  "store_id": 404,  // alias para compatibilidad
  "permissions": [
    "read_products",
    "create_orders",
    "read_orders_own",  // solo sus propias ventas
    "read_customers",
    "create_customers"
  ],
  // NO incluir: edit_prices, delete_orders, access_reports
}
```

**Diferencias clave:**
1. `user_type: "cashier"` vs `user_type: "admin"`
2. `sub` prefijado con "cashier_" para evitar colisiones con user_id
3. Permisos limitados (no puede ver reportes, cambiar precios, etc)
4. Expiración más corta (seguridad)

---

## 📊 Comparación: Compatibilidad con Sistema Actual

| Feature | Admin Actual | Cajero Directo | ¿Compatible? |
|---------|--------------|----------------|--------------|
| `access_token` | ✅ | ✅ | ✅ Mismo formato JWT |
| `tienda_id` / `store_id` | ✅ | ✅ | ✅ Ya está en token |
| `user_id` | ✅ (admin) | ❌ (null) | ⚠️ Requiere ajuste |
| `empleado_id` | ❌ (null) | ✅ (cajero) | ✅ Nuevo campo |
| `permissions` | ✅ | ✅ | ✅ Misma estructura |
| Axios interceptor | ✅ | ✅ | ✅ Sin cambios |
| authStore | ✅ | ⚠️ | ⚠️ Ajustar `user` object |
| cashierStore | ⚠️ Manual | ✅ Auto | ✅ Auto-poblar |

---

## 🛠️ Cambios Necesarios

### 1️⃣ Backend (API)

#### A) Nuevo Endpoint: `POST /api/v1/auth/cashier-login`

**Ubicación:** `app/Controllers/V1/Auth.php` (o `AuthController.php` existente)

**Request:**
```json
{
  "ruc": "20603317204",  // o "store_identifier"
  "pin": "1234"
}
```

**Lógica:**
```php
public function cashierLogin()
{
    $data = $this->request->getJSON(true);

    // 1. Validar campos requeridos
    if (!isset($data['ruc'], $data['pin'])) {
        return $this->failValidationErrors('ruc y pin son requeridos');
    }

    // 2. Buscar tienda por RUC
    $tiendaModel = new TiendaModel();
    $tienda = $tiendaModel->where('tienda_ruc', $data['ruc'])
                          ->where('tienda_activo', 1)
                          ->first();

    if (!$tienda) {
        return $this->respond([
            'success' => false,
            'message' => 'Tienda no encontrada o inactiva'
        ], 404);
    }

    // 3. Validar PIN del cajero en esa tienda
    $empleadoModel = new PosEmpleadoModel();
    $empleado = $empleadoModel->validatePin($tienda['tienda_id'], $data['pin']);

    if (!$empleado) {
        return $this->respond([
            'success' => false,
            'message' => 'PIN inválido o empleado inactivo'
        ], 401);
    }

    // 4. Verificar horario de trabajo
    if (!$empleadoModel->canWorkNow($empleado['empleado_id'])) {
        return $this->respond([
            'success' => false,
            'message' => 'Fuera del horario permitido',
            'empleado_horario_inicio' => $empleado['empleado_horario_inicio'],
            'empleado_horario_fin' => $empleado['empleado_horario_fin'],
            'hora_actual' => date('H:i:s')
        ], 403);
    }

    // 5. Obtener permisos según rol del cajero
    $permissions = $this->getCashierPermissions($empleado['empleado_rol']);

    // 6. Generar JWT
    $tokenPayload = [
        'iss' => base_url(),
        'sub' => 'cashier_' . $empleado['empleado_id'],
        'aud' => 'pos',
        'iat' => time(),
        'exp' => time() + (24 * 60 * 60), // 24 horas
        'user_type' => 'cashier',
        'empleado_id' => (int)$empleado['empleado_id'],
        'tienda_id' => (int)$tienda['tienda_id'],
        'store_id' => (int)$tienda['tienda_id'], // alias
        'permissions' => $permissions
    ];

    $jwt = JWT::encode($tokenPayload, getenv('JWT_SECRET_KEY'), 'HS256');

    // 7. Respuesta exitosa
    return $this->respond([
        'success' => true,
        'data' => [
            'access_token' => $jwt,
            'token_type' => 'Bearer',
            'expires_in' => 24 * 60 * 60,
            'user_type' => 'cashier',
            'empleado' => [
                'id' => $empleado['empleado_id'],
                'nombres' => $empleado['empleado_nombres'],
                'apellidos' => $empleado['empleado_apellidos'],
                'rol' => $empleado['empleado_rol']
            ],
            'tienda' => [
                'id' => $tienda['tienda_id'],
                'nombre' => $tienda['tienda_nombre_comercial'],
                'ruc' => $tienda['tienda_ruc']
            ]
        ]
    ]);
}

private function getCashierPermissions($rol)
{
    $basePermissions = [
        'read_products',
        'read_customers',
        'create_customers',
        'create_orders',
        'read_orders_own'
    ];

    if ($rol === 'supervisor' || $rol === 'administrador') {
        return array_merge($basePermissions, [
            'read_orders',  // ver todas las ventas
            'cancel_orders',
            'read_reports'
        ]);
    }

    return $basePermissions;
}
```

#### B) Modificar Middleware de Autenticación

**Ubicación:** `app/Filters/AuthFilter.php` (o similar)

**Cambio:** Detectar `user_type` en el token

```php
public function before(RequestInterface $request, $arguments = null)
{
    $token = $this->getTokenFromRequest($request);

    if (!$token) {
        return Services::response()
            ->setJSON(['error' => 'Token no proporcionado'])
            ->setStatusCode(401);
    }

    try {
        $decoded = JWT::decode($token, /* ... */);

        // Guardar en request para usar en controladores
        $request->user_type = $decoded->user_type ?? 'admin';
        $request->user_id = $decoded->user_id ?? null;
        $request->empleado_id = $decoded->empleado_id ?? null;
        $request->store_id = $decoded->store_id ?? $decoded->tienda_id ?? null;
        $request->permissions = $decoded->permissions ?? [];

    } catch (\Exception $e) {
        return Services::response()
            ->setJSON(['error' => 'Token inválido'])
            ->setStatusCode(401);
    }
}
```

#### C) Registrar Ruta

**Ubicación:** `app/Config/Routes.php`

```php
// Autenticación de cajeros
$routes->post('auth/cashier-login', 'V1\Auth::cashierLogin');
```

---

### 2️⃣ Frontend (Vue)

#### A) Nuevo Servicio API

**Ubicación:** `src/services/authApi.js`

```javascript
export const authApi = {
  // ... métodos existentes ...

  // Nuevo: Login de cajero directo
  async cashierLogin(ruc, pin) {
    const response = await apiClient.post('/auth/cashier-login', {
      ruc,
      pin
    });
    return response.data;
  }
};
```

#### B) Nueva Vista: `CashierLogin.vue`

**Ubicación:** `src/views/CashierLogin.vue`

**Características:**
- Input para RUC/ID de tienda (puede ser autocompletado en tablet)
- Input PIN de 4 dígitos (teclado numérico)
- Diseño simple, enfocado en velocidad
- Link para "Soy administrador" (redirige a `/login`)

**Template:**
```vue
<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4">
    <div class="max-w-md w-full space-y-8">
      <div>
        <img src="@/assets/logo-mitiendapos-wb.svg" alt="MiTiendaPOS" class="h-12 mx-auto" />
        <h2 class="mt-4 text-center text-2xl font-extrabold text-gray-900">
          Acceso Rápido para Cajeros
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Ingresa el RUC de tu tienda y tu PIN de cajero
        </p>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <!-- RUC/ID Tienda -->
        <div>
          <label for="ruc" class="block text-sm font-medium text-gray-700 mb-2">
            RUC de la Tienda
          </label>
          <input
            id="ruc"
            v-model="ruc"
            type="text"
            inputmode="numeric"
            pattern="[0-9]{11}"
            maxlength="11"
            required
            placeholder="20603317204"
            class="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg"
            :disabled="loading"
          />
          <p class="text-xs text-gray-500 mt-1">11 dígitos</p>
        </div>

        <!-- PIN -->
        <div>
          <label for="pin" class="block text-sm font-medium text-gray-700 mb-2">
            PIN de Cajero
          </label>
          <input
            id="pin"
            ref="pinInput"
            v-model="pin"
            type="password"
            inputmode="numeric"
            pattern="[0-9]{4}"
            maxlength="4"
            required
            placeholder="••••"
            autocomplete="off"
            class="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-2xl text-center tracking-widest"
            :disabled="loading"
          />
          <p class="text-xs text-gray-500 mt-1 text-center">4 dígitos</p>
        </div>

        <!-- Error -->
        <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-3">
          <p class="text-sm text-red-700 text-center">{{ error }}</p>
        </div>

        <!-- Submit -->
        <button
          type="submit"
          :disabled="loading || !isValid"
          class="w-full flex justify-center py-3 px-4 border border-transparent text-lg font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="loading" class="flex items-center">
            <svg class="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Ingresando...
          </span>
          <span v-else>🚀 Ingresar al POS</span>
        </button>
      </form>

      <!-- Link a login admin -->
      <div class="text-center">
        <router-link
          to="/login"
          class="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
        >
          ¿Eres administrador? Ingresa aquí
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useCashierStore } from '../stores/cashier';
import { authApi } from '../services/authApi';

const router = useRouter();
const authStore = useAuthStore();
const cashierStore = useCashierStore();

const ruc = ref('');
const pin = ref('');
const loading = ref(false);
const error = ref(null);
const pinInput = ref(null);

const isValid = computed(() => {
  return ruc.value.length === 11 && pin.value.length === 4;
});

const handleLogin = async () => {
  if (!isValid.value || loading.value) return;

  loading.value = true;
  error.value = null;

  try {
    console.log('🔐 [CASHIER LOGIN] Intentando login con RUC + PIN');

    const response = await authApi.cashierLogin(ruc.value, pin.value);

    if (!response.success) {
      throw new Error(response.message || 'Error de autenticación');
    }

    const { access_token, empleado, tienda } = response.data;

    console.log('✅ [CASHIER LOGIN] Login exitoso:', {
      empleado: empleado.nombres + ' ' + empleado.apellidos,
      tienda: tienda.nombre
    });

    // 1. Guardar token en authStore (como si fuera admin)
    authStore.accessToken = access_token;
    authStore.user = {
      id: null,  // cajeros no tienen user_id
      name: `${empleado.nombres} ${empleado.apellidos}`,
      email: null,
      role: empleado.rol,
      user_type: 'cashier'  // IMPORTANTE
    };
    authStore.selectedStore = {
      id: tienda.id,
      name: tienda.nombre,
      ruc: tienda.ruc
    };

    localStorage.setItem('access_token', access_token);
    localStorage.setItem('user', JSON.stringify(authStore.user));
    localStorage.setItem('selected_store', JSON.stringify(authStore.selectedStore));

    // 2. Guardar en cashierStore (auto-autenticado)
    cashierStore.cashier = empleado;
    cashierStore.authenticated = true;

    localStorage.setItem('cashier_session', JSON.stringify({
      cashier: empleado,
      authenticatedAt: new Date().toISOString()
    }));

    console.log('✅ [CASHIER LOGIN] Sesiones guardadas, redirigiendo a /menu');

    // 3. Redirigir al menú
    router.push('/menu');

  } catch (err) {
    console.error('❌ [CASHIER LOGIN] Error:', err);
    error.value = err.response?.data?.message || err.message || 'Error al iniciar sesión';
    pin.value = ''; // Limpiar PIN
    pinInput.value?.focus();
  } finally {
    loading.value = false;
  }
};

// Auto-focus en PIN cuando RUC está completo
watch(() => ruc.value, (value) => {
  if (value.length === 11) {
    pinInput.value?.focus();
  }
});
</script>
```

#### C) Actualizar Router

**Ubicación:** `src/router/index.js`

```javascript
const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,  // Login de administradores
    meta: { requiresAuth: false }
  },
  {
    path: '/cashier-login',  // ← NUEVO
    name: 'CashierLogin',
    component: () => import('../views/CashierLogin.vue'),
    meta: { requiresAuth: false }
  },
  // ... otras rutas ...
  {
    path: '/',
    redirect: '/cashier-login'  // ← Cambiar default
  }
];
```

#### D) Actualizar AuthStore

**Ubicación:** `src/stores/auth.js`

**Cambio:** Detectar `user_type` para manejar cajeros

```javascript
getters: {
  isAuthenticated: (state) => !!state.accessToken && !!state.user,
  userRole: (state) => state.user?.role || null,
  isCashier: (state) => state.user?.user_type === 'cashier',  // ← NUEVO
  isAdmin: (state) => state.user?.user_type !== 'cashier',     // ← NUEVO
  hasSelectedStore: (state) => !!state.selectedStore,
},

actions: {
  async logout() {
    // ... lógica actual de logout ...

    // Redirigir según tipo de usuario
    if (this.isCashier) {
      router.push('/cashier-login');
    } else {
      router.push('/login');
    }
  }
}
```

#### E) Ajustar Guards del Router

**Ubicación:** `src/router/index.js`

```javascript
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  // Check authentication
  if (requiresAuth && !authStore.isAuthenticated) {
    // Redirigir a la pantalla correcta según la ruta
    if (authStore.isCashier || to.path.includes('cashier')) {
      next('/cashier-login');
    } else {
      next('/login');
    }
    return;
  }

  // ... resto de la lógica ...
});
```

---

## 🔒 Seguridad y Permisos

### Control de Acceso por Ruta

Algunas vistas deben estar bloqueadas para cajeros:

```javascript
// src/router/index.js
{
  path: '/settings',
  component: Settings,
  meta: {
    requiresAuth: true,
    roles: ['supervisor', 'administrador'],
    adminOnly: true  // ← NUEVO: bloquea cajeros directos
  }
}

// En el guard:
if (to.meta.adminOnly && authStore.isCashier) {
  alert('⚠️ No tienes permisos para acceder a esta sección');
  next('/menu');
  return;
}
```

### Rutas Permitidas para Cajeros Directos

| Ruta | Cajero | Supervisor | Admin |
|------|--------|------------|-------|
| `/menu` | ✅ | ✅ | ✅ |
| `/pos` | ✅ | ✅ | ✅ |
| `/my-shift` | ✅ | ✅ | ✅ |
| `/sales` | ⚠️ Solo propias | ✅ | ✅ |
| `/customers` | ✅ | ✅ | ✅ |
| `/inventory` | ❌ | ✅ | ✅ |
| `/settings` | ❌ | ❌ | ✅ |
| `/dashboard` | ❌ | ✅ | ✅ |

---

## ✅ Ventajas de esta Solución

1. **✅ Compatible con arquitectura actual**
   - Usa el mismo sistema de tokens JWT
   - No requiere cambios mayores en el frontend
   - Middleware existente funciona sin cambios

2. **✅ Seguro**
   - Token con expiración corta (24h vs 30 días)
   - Permisos limitados en el token
   - Validación de horario en backend

3. **✅ Multi-tenant funciona**
   - RUC identifica el tenant
   - Token incluye `tienda_id`
   - Cajero solo accede a su tienda

4. **✅ No rompe flujo actual**
   - Administradores siguen usando `/login`
   - Cajeros pueden usar `/cashier-login`
   - Ambos flujos conviven

5. **✅ Fácil de implementar**
   - Backend: 1 endpoint nuevo + pequeño ajuste en middleware
   - Frontend: 1 vista nueva + ajuste en authStore
   - Estimado: 4-6 horas de desarrollo

---

## 🚀 Plan de Implementación

### Fase 1: Backend (2-3 horas)
1. ✅ Crear endpoint `POST /auth/cashier-login`
2. ✅ Implementar lógica de búsqueda por RUC
3. ✅ Implementar generación de JWT para cajeros
4. ✅ Ajustar middleware para detectar `user_type`
5. ✅ Probar con Postman/curl

### Fase 2: Frontend (2-3 horas)
1. ✅ Crear vista `CashierLogin.vue`
2. ✅ Agregar método `cashierLogin()` en `authApi.js`
3. ✅ Actualizar authStore con getter `isCashier`
4. ✅ Ajustar router guards
5. ✅ Bloquear rutas admin-only
6. ✅ Ajustar logout para redirigir correctamente

### Fase 3: Testing (1 hora)
1. ✅ Probar login de cajero completo
2. ✅ Verificar que token funciona en todas las APIs
3. ✅ Verificar que permisos se respetan
4. ✅ Probar flujo de logout y re-login
5. ✅ Verificar multi-tenant (cajeros de diferentes tiendas)

---

## ⚠️ Consideraciones

### 1. ¿Qué pasa con el `refresh_token`?

**Opción A (Recomendada):** No dar refresh token a cajeros
- Token expira en 24h
- Deben re-loguearse cada día
- Más seguro (terminal compartida)

**Opción B:** Dar refresh token pero con TTL corto
- Expira en 7 días máximo
- Permite renovación sin re-login

### 2. ¿Cómo manejar múltiples RUCs (tiendas con varias empresas)?

Si una tienda tiene varios RUCs, agregar campo alternativo:

```json
{
  "store_identifier": "MITIENDA001",  // código único
  "pin": "1234"
}
```

O permitir ambos:
```javascript
// Backend
$tienda = $tiendaModel
  ->where('tienda_ruc', $data['ruc'])
  ->orWhere('tienda_codigo', $data['ruc'])  // código corto
  ->first();
```

### 3. ¿Limitar intentos fallidos de PIN?

**Sí, muy recomendable:**

```php
// Backend: agregar tabla pos_login_attempts
// Bloquear por 15 min después de 5 intentos fallidos
```

### 4. ¿Permitir recordar RUC en dispositivo?

**Sí, en localStorage:**

```javascript
// Guardar último RUC usado
localStorage.setItem('last_store_ruc', ruc);

// Pre-cargar en próximo login
onMounted(() => {
  ruc.value = localStorage.getItem('last_store_ruc') || '';
});
```

---

## 📝 Resumen

### ¿Es viable?
✅ **Sí, totalmente viable** y no rompe la arquitectura actual.

### ¿Cuánto tiempo toma?
⏱️ **4-6 horas** de desarrollo + 1 hora de testing = **1 día laboral**

### ¿Qué riesgos hay?
- ⚠️ Seguridad: mitigar con rate limiting y bloqueo por intentos
- ⚠️ UX: si el cajero olvida el RUC, necesita ayuda del admin
  - **Solución:** Guardar último RUC en localStorage

### ¿Vale la pena?
✅ **Sí**, porque:
- Mejora significativamente la experiencia del cajero
- Reduce fricción (no depende del admin)
- Mantiene seguridad (validación de horario, permisos limitados)
- Compatible con arquitectura actual

---

## 🎯 Próximos Pasos

1. **Aprobar el plan** ✅
2. **Implementar Fase 1 (Backend)** - 2-3 horas
3. **Implementar Fase 2 (Frontend)** - 2-3 horas
4. **Testing completo** - 1 hora
5. **Deploy a producción** 🚀

¿Procedemos con la implementación?

