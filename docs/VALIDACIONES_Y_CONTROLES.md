# Validaciones y Controles Internos - MiTienda POS

## Análisis del Flujo Actual

### 🔴 Problemas Identificados

#### 1. **Carrito sin bloqueo post-pago**
**Problema**: Una vez que se agrega un pago, el carrito sigue siendo editable
- ✅ Se pueden agregar productos
- ✅ Se pueden modificar cantidades
- ✅ Se pueden eliminar productos
- ✅ No hay restricciones

**Riesgo**:
- Descuadre de caja (total pagado ≠ total productos)
- Confusión del cajero
- Fraude interno

#### 2. **Eliminación de pagos sin autorización**
**Problema**: Cualquier cajero puede eliminar pagos ya registrados
- No requiere PIN de supervisor
- No queda registro de quién eliminó
- No hay auditoría

**Riesgo**:
- Robo interno (eliminar pago y embolsarse el dinero)
- Sin trazabilidad

#### 3. **No hay módulo de usuarios/empleados**
**Problema**: No existe gestión de:
- Roles (Cajero, Supervisor, Administrador)
- Permisos por rol
- PIN de supervisor para autorizaciones
- Auditoría de acciones

---

## Propuesta de Solución

### 📋 Fase 1: Estados del Carrito

Implementar máquina de estados para el carrito:

```
ESTADOS:
┌─────────────┐
│   ABIERTO   │ → Carrito editable, sin pagos
└─────────────┘
       ↓ (agregar primer pago)
┌─────────────┐
│  BLOQUEADO  │ → Carrito NO editable, con pagos parciales
└─────────────┘
       ↓ (pagar totalidad)
┌─────────────┐
│   PAGADO    │ → Carrito NO editable, pago completo
└─────────────┘
       ↓ (finalizar venta)
┌─────────────┐
│  FINALIZADO │ → Venta cerrada, genera ticket
└─────────────┘
```

### Reglas de negocio:

| Estado | Agregar productos | Editar cantidad | Eliminar productos | Agregar pagos | Eliminar pagos |
|--------|-------------------|-----------------|--------------------|--------------|-----------------|
| ABIERTO | ✅ Permitido | ✅ Permitido | ✅ Permitido | ✅ Permitido | ❌ No hay pagos |
| BLOQUEADO | ⚠️ Con PIN supervisor | ⚠️ Con PIN supervisor | ⚠️ Con PIN supervisor | ✅ Permitido | ⚠️ Con PIN supervisor |
| PAGADO | ❌ Bloqueado | ❌ Bloqueado | ❌ Bloqueado | ❌ Bloqueado | ⚠️ Con PIN supervisor |
| FINALIZADO | ❌ Bloqueado | ❌ Bloqueado | ❌ Bloqueado | ❌ Bloqueado | ❌ Bloqueado |

---

### 📋 Fase 2: Sistema de Autorizaciones

#### Modal de PIN de Supervisor

```vue
<SupervisorAuthModal
  v-model="showSupervisorAuth"
  :action="authAction"
  @authorized="onAuthorized"
  @cancelled="onAuthCancelled"
/>
```

**Flujo**:
1. Cajero intenta acción restringida (ej: eliminar pago)
2. Sistema muestra modal de PIN
3. Supervisor ingresa PIN de 4-6 dígitos
4. Sistema valida y registra en log de auditoría
5. Permite la acción

**Acciones que requieren PIN**:
- ✅ Editar carrito bloqueado (agregar/quitar/modificar productos)
- ✅ Eliminar pagos
- ✅ Aplicar descuentos mayores a X%
- ✅ Cancelar venta con pagos
- ✅ Cambiar precio de producto
- ✅ Abrir cajón sin venta

---

### 📋 Fase 3: Módulo de Usuarios/Empleados

#### Tabla de base de datos

```sql
CREATE TABLE empleados (
    empleado_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tienda_id INT UNSIGNED NOT NULL,
    empleado_nombres VARCHAR(100) NOT NULL,
    empleado_apellidos VARCHAR(100) NOT NULL,
    empleado_email VARCHAR(255),
    empleado_telefono VARCHAR(20),
    empleado_documento VARCHAR(20),
    empleado_pin VARCHAR(255) NOT NULL COMMENT 'Hash del PIN de 4-6 dígitos',
    empleado_rol ENUM('cajero', 'supervisor', 'administrador') DEFAULT 'cajero',
    empleado_activo TINYINT(1) DEFAULT 1,
    empleado_fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    empleado_fecha_modificacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tienda_id (tienda_id),
    INDEX idx_email (empleado_email),
    INDEX idx_activo (empleado_activo),
    UNIQUE KEY unique_email_tienda (tienda_id, empleado_email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### Roles y Permisos

| Permiso | Cajero | Supervisor | Administrador |
|---------|--------|------------|---------------|
| Ver productos | ✅ | ✅ | ✅ |
| Crear venta | ✅ | ✅ | ✅ |
| Editar carrito abierto | ✅ | ✅ | ✅ |
| Editar carrito bloqueado | ❌ | ✅ | ✅ |
| Agregar pagos | ✅ | ✅ | ✅ |
| Eliminar pagos | ❌ | ✅ | ✅ |
| Aplicar descuentos >10% | ❌ | ✅ | ✅ |
| Cancelar venta | ❌ | ✅ | ✅ |
| Abrir/cerrar caja | ❌ | ✅ | ✅ |
| Ver reportes | ❌ | ✅ | ✅ |
| Gestionar empleados | ❌ | ❌ | ✅ |
| Gestionar productos | ❌ | ❌ | ✅ |

---

## Implementación Técnica

### 1. Store de Cart (Pinia)

```javascript
// stores/cart.js
export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
    payments: [],
    customer: null,
    status: 'ABIERTO', // ABIERTO, BLOQUEADO, PAGADO, FINALIZADO
    currentSaleId: null
  }),

  getters: {
    isEditable: (state) => state.status === 'ABIERTO',
    isBlocked: (state) => state.status === 'BLOQUEADO' || state.status === 'PAGADO',
    hasPayments: (state) => state.payments.length > 0,
    canAddProducts: (state) => state.status === 'ABIERTO',
    canEditProducts: (state) => state.status === 'ABIERTO',
    canRemoveProducts: (state) => state.status === 'ABIERTO',
    canAddPayments: (state) => ['ABIERTO', 'BLOQUEADO'].includes(state.status),
    canRemovePayments: (state) => false, // Siempre requiere autorización

    total: (state) => {
      return state.items.reduce((sum, item) => sum + (item.precio * item.quantity), 0);
    },

    totalPaid: (state) => {
      return state.payments.reduce((sum, p) => sum + p.amount, 0);
    },

    remainingAmount(state) {
      return this.total - this.totalPaid;
    },

    isFullyPaid(state) {
      return this.remainingAmount <= 0;
    }
  },

  actions: {
    addItem(product) {
      if (!this.canAddProducts) {
        throw new Error('No se pueden agregar productos en este estado');
      }

      const existing = this.items.find(i => i.id === product.id);
      if (existing) {
        existing.quantity++;
      } else {
        this.items.push({ ...product, quantity: 1 });
      }
    },

    removeItem(productId, supervisorAuth = null) {
      if (!this.canRemoveProducts && !supervisorAuth) {
        throw new Error('Requiere autorización de supervisor');
      }

      this.items = this.items.filter(i => i.id !== productId);

      // Registrar en auditoría si fue con supervisor
      if (supervisorAuth) {
        this.logAudit('REMOVE_ITEM', supervisorAuth);
      }
    },

    updateQuantity(productId, newQuantity, supervisorAuth = null) {
      if (!this.canEditProducts && !supervisorAuth) {
        throw new Error('Requiere autorización de supervisor');
      }

      const item = this.items.find(i => i.id === productId);
      if (item) {
        item.quantity = newQuantity;
      }

      if (supervisorAuth) {
        this.logAudit('UPDATE_QUANTITY', supervisorAuth);
      }
    },

    addPayment(payment) {
      if (!this.canAddPayments) {
        throw new Error('No se pueden agregar pagos en este estado');
      }

      this.payments.push(payment);

      // Cambiar estado a BLOQUEADO al agregar primer pago
      if (this.payments.length === 1 && this.status === 'ABIERTO') {
        this.status = 'BLOQUEADO';
      }

      // Cambiar a PAGADO si se completó el pago
      if (this.isFullyPaid) {
        this.status = 'PAGADO';
      }
    },

    removePayment(paymentIndex, supervisorAuth) {
      if (!supervisorAuth) {
        throw new Error('Requiere autorización de supervisor');
      }

      this.payments.splice(paymentIndex, 1);
      this.logAudit('REMOVE_PAYMENT', supervisorAuth);

      // Volver a BLOQUEADO o ABIERTO si ya no hay pagos
      if (this.payments.length === 0) {
        this.status = 'ABIERTO';
      } else if (!this.isFullyPaid) {
        this.status = 'BLOQUEADO';
      }
    },

    async completeSale() {
      if (this.status !== 'PAGADO') {
        throw new Error('La venta debe estar pagada completamente');
      }

      // Llamar al API para registrar venta
      // ...

      this.status = 'FINALIZADO';
    },

    reset() {
      this.items = [];
      this.payments = [];
      this.customer = null;
      this.status = 'ABIERTO';
      this.currentSaleId = null;
    },

    logAudit(action, supervisorAuth) {
      // Registrar en tabla de auditoría
      console.log('AUDIT:', {
        action,
        supervisor_id: supervisorAuth.employeeId,
        timestamp: new Date(),
        cart_state: this.status,
        total: this.total
      });
    }
  }
});
```

---

### 2. Componente SupervisorAuthModal

```vue
<template>
  <div v-if="modelValue" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen px-4">
      <div class="fixed inset-0 bg-gray-500 opacity-75"></div>

      <div class="relative bg-white rounded-lg max-w-md w-full p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">
          Autorización de Supervisor Requerida
        </h3>

        <p class="text-sm text-gray-500 mb-4">
          {{ actionMessage }}
        </p>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            PIN de Supervisor
          </label>
          <input
            v-model="pin"
            type="password"
            maxlength="6"
            inputmode="numeric"
            pattern="[0-9]*"
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-center text-2xl tracking-widest"
            placeholder="••••"
            @keyup.enter="authorize"
            autofocus
          />
        </div>

        <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p class="text-sm text-red-700">{{ error }}</p>
        </div>

        <div class="flex gap-3">
          <button
            @click="authorize"
            :disabled="!pin || pin.length < 4"
            class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-300"
          >
            Autorizar
          </button>
          <button
            @click="cancel"
            class="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { employeesApi } from '../services/employeesApi';

const props = defineProps({
  modelValue: Boolean,
  action: String // 'remove_payment', 'edit_cart', 'apply_discount', etc.
});

const emit = defineEmits(['update:modelValue', 'authorized', 'cancelled']);

const pin = ref('');
const error = ref('');

const actionMessage = computed(() => {
  const messages = {
    'remove_payment': 'Esta acción eliminará un pago registrado.',
    'edit_cart': 'Esta acción modificará un carrito con pagos.',
    'apply_discount': 'Esta acción aplicará un descuento mayor al permitido.',
    'cancel_sale': 'Esta acción cancelará una venta con pagos.',
    'open_drawer': 'Esta acción abrirá el cajón sin venta.'
  };
  return messages[props.action] || 'Esta acción requiere autorización.';
});

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    pin.value = '';
    error.value = '';
  }
});

const authorize = async () => {
  if (!pin.value || pin.value.length < 4) {
    error.value = 'PIN inválido';
    return;
  }

  try {
    // Validar PIN con el backend
    const response = await employeesApi.validateSupervisorPin(pin.value);

    if (response.success && response.data.role in ['supervisor', 'administrador']) {
      emit('authorized', {
        employeeId: response.data.id,
        employeeName: response.data.name,
        role: response.data.role
      });
      emit('update:modelValue', false);
    } else {
      error.value = 'PIN incorrecto o sin permisos de supervisor';
    }
  } catch (err) {
    error.value = 'Error al validar PIN';
  }
};

const cancel = () => {
  emit('cancelled');
  emit('update:modelValue', false);
};
</script>
```

---

### 3. Uso en POS.vue

```vue
<template>
  <!-- Botones del carrito -->
  <button
    @click="requestRemoveItem(item)"
    class="text-red-600 hover:text-red-900"
    :disabled="!canRemoveItems"
  >
    Eliminar
  </button>

  <!-- Modal de autorización -->
  <SupervisorAuthModal
    v-model="showSupervisorAuth"
    :action="pendingAction.type"
    @authorized="onSupervisorAuthorized"
    @cancelled="onSupervisorCancelled"
  />
</template>

<script setup>
const showSupervisorAuth = ref(false);
const pendingAction = ref({ type: null, data: null });

const canRemoveItems = computed(() => {
  return cartStore.canRemoveProducts;
});

const requestRemoveItem = (item) => {
  if (cartStore.canRemoveProducts) {
    // Remover directamente si está permitido
    cartStore.removeItem(item.id);
  } else {
    // Solicitar autorización de supervisor
    pendingAction.value = { type: 'remove_item', data: item };
    showSupervisorAuth.value = true;
  }
};

const onSupervisorAuthorized = (supervisorAuth) => {
  const { type, data } = pendingAction.value;

  switch (type) {
    case 'remove_item':
      cartStore.removeItem(data.id, supervisorAuth);
      break;
    case 'remove_payment':
      cartStore.removePayment(data.index, supervisorAuth);
      break;
    case 'edit_quantity':
      cartStore.updateQuantity(data.id, data.quantity, supervisorAuth);
      break;
  }

  pendingAction.value = { type: null, data: null };
};

const onSupervisorCancelled = () => {
  pendingAction.value = { type: null, data: null };
};
</script>
```

---

### 4. Tabla de Auditoría

```sql
CREATE TABLE auditoria_pos (
    auditoria_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tienda_id INT UNSIGNED NOT NULL,
    cajero_id INT UNSIGNED NOT NULL COMMENT 'Empleado que realizó la acción',
    supervisor_id INT UNSIGNED NULL COMMENT 'Supervisor que autorizó (si aplica)',
    accion VARCHAR(50) NOT NULL COMMENT 'REMOVE_ITEM, REMOVE_PAYMENT, APPLY_DISCOUNT, etc.',
    tabla_afectada VARCHAR(50) NULL,
    registro_id BIGINT NULL,
    datos_antes JSON NULL COMMENT 'Estado anterior',
    datos_despues JSON NULL COMMENT 'Estado nuevo',
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_tienda_id (tienda_id),
    INDEX idx_cajero_id (cajero_id),
    INDEX idx_supervisor_id (supervisor_id),
    INDEX idx_accion (accion),
    INDEX idx_fecha (fecha_creacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## Plan de Implementación

### Sprint 1: Estados del Carrito (1-2 días)
- [ ] Crear `stores/cart.js` con estados
- [ ] Migrar lógica de POS.vue al store
- [ ] Implementar validaciones de estado
- [ ] Actualizar UI para deshabilitar botones según estado

### Sprint 2: Sistema de Autorizaciones (2-3 días)
- [ ] Crear componente `SupervisorAuthModal.vue`
- [ ] Crear API `employeesApi.js`
- [ ] Implementar validación de PIN
- [ ] Integrar autorizaciones en acciones restringidas

### Sprint 3: Módulo de Empleados (3-4 días)
- [ ] Crear migración de tabla `empleados`
- [ ] Crear backend: `EmployeeController.php`, `EmployeeModel.php`
- [ ] Crear vista de gestión de empleados
- [ ] Implementar CRUD de empleados
- [ ] Sistema de roles y permisos

### Sprint 4: Auditoría (1-2 días)
- [ ] Crear migración de tabla `auditoria_pos`
- [ ] Implementar logging automático
- [ ] Crear vista de logs de auditoría
- [ ] Reportes de acciones por empleado

---

## Preguntas para Definir

1. **PIN de supervisor**:
   - ¿Cuántos dígitos? (4 o 6)
   - ¿Debe expirar después de X minutos?
   - ¿Permitir reintentos ilimitados o bloquear después de 3 fallos?

2. **Roles**:
   - ¿Solo 3 roles (Cajero, Supervisor, Admin)?
   - ¿O necesitas más granularidad?

3. **Autorizaciones**:
   - ¿Qué otras acciones requieren PIN de supervisor?
   - Aplicar descuentos mayores a: ¿10%? ¿20%?
   - Cambiar precio de producto: ¿Siempre? ¿O solo si difiere más de X%?

4. **Carrito bloqueado**:
   - ¿Permitir agregar productos con PIN o totalmente bloqueado?
   - ¿Permitir eliminar productos con PIN?

5. **Gestión de empleados**:
   - ¿Cada tienda gestiona sus propios empleados?
   - ¿O hay empleados globales (multi-tienda)?

---

## Siguiente Paso

¿Por dónde quieres empezar?

**Opción A**: Implementar estados del carrito (más rápido, 1-2 días)
**Opción B**: Crear módulo completo de empleados primero (más completo, 3-4 días)
**Opción C**: Hacer un prototipo rápido del modal de PIN (demo funcional, 4 horas)
