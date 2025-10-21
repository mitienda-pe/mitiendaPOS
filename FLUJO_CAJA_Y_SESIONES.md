# Flujo de Caja y Sesiones del POS

## Problemática Actual

### Problemas identificados:
1. ✅ **RESUELTO**: Se puede cambiar de tienda desde el menú → puede causar inconsistencias
2. ⚠️ **PENDIENTE**: Se puede iniciar ventas sin abrir turno de caja
3. ⚠️ **PENDIENTE**: No hay validación de turno abierto antes de registrar pagos
4. ⚠️ **PENDIENTE**: ¿Qué pasa si olvidan cerrar la caja al final del día?

## Solución Implementada

### 1. Cambio de Tienda (✅ IMPLEMENTADO)

**Antes**:
- Botón "Cambiar Tienda" en menú principal
- Usuario podía cambiar de tienda en cualquier momento
- Riesgo de inconsistencias en turnos y ventas

**Ahora**:
- ✅ Botón "Cambiar Tienda" eliminado del menú
- ✅ Header muestra: **Nombre Tienda - Nombre Usuario**
- ✅ Para cambiar de tienda: **DEBE hacer logout**
- ✅ Al hacer login nuevamente, selecciona otra tienda

**Beneficios**:
- Evita cambios accidentales de tienda
- Mantiene consistencia de sesión
- Turno de caja asociado a sesión
- Menor riesgo de errores en reportes

---

## Propuesta: Relación Caja-Sesión-POS

### Modelo Recomendado

```
SESIÓN DE USUARIO
    ↓
    ├─ Tienda seleccionada (inmutable durante sesión)
    ├─ Usuario/empleado logueado
    └─ TURNO DE CAJA (obligatorio)
           ↓
           ├─ Monto inicial
           ├─ Dispositivo/caja registradora
           ├─ Fecha/hora apertura
           └─ VENTAS Y PAGOS
                  ↓
                  ├─ Venta 1 → Pagos
                  ├─ Venta 2 → Pagos
                  └─ Venta N → Pagos
```

### Estados de Turno de Caja

```
CERRADO → ABIERTO → CERRADO (día siguiente)
   ↓          ↓           ↓
No puede    Puede      Solo puede
   vender   vender     ver reportes
```

### Flujo Propuesto

#### 1. Login
```
Usuario ingresa → Selecciona tienda → Token con store_id
```

#### 2. Menú Principal
```
¿Tiene turno abierto?
  ├─ SÍ → Mostrar botón "Ir al POS" + "Cerrar Turno"
  └─ NO → Mostrar botón "Abrir Turno" (botón POS deshabilitado)
```

#### 3. Abrir Turno
```
Modal "Abrir Turno"
  ├─ Monto inicial en caja (opcional: S/ 0.00)
  ├─ Nombre de caja/dispositivo (opcional)
  ├─ Cajero (automático del usuario logueado)
  └─ [Botón: Abrir Turno]
       ↓
    Guardar en BD:
      - tienda_id
      - usuario_id (cajero)
      - monto_inicial
      - fecha_apertura
      - estado: "abierto"
```

#### 4. Durante el POS
```
Al entrar a POS:
  if (!shiftStore.hasActiveShift) {
    → Redirigir a Menú
    → Mostrar mensaje: "Debes abrir un turno primero"
  }

Al agregar pago:
  if (!shiftStore.hasActiveShift) {
    → Bloquear acción
    → Mostrar error: "No hay turno abierto"
  }
```

#### 5. Cerrar Turno
```
Modal "Cerrar Turno"
  ├─ Resumen del día:
  │    ├─ Monto inicial: S/ 100.00
  │    ├─ Ventas en efectivo: S/ 450.00
  │    ├─ Ventas con tarjeta: S/ 320.00
  │    ├─ Total ventas: S/ 770.00
  │    ├─ Total esperado en caja: S/ 550.00 (inicial + efectivo)
  │    └─ Total real en caja: [INPUT: S/ ___]
  │
  ├─ Diferencia: S/ 0.00 (verde) / S/ -10.00 (rojo)
  ├─ Observaciones: [TEXTAREA]
  └─ [Botón: Cerrar Turno]
       ↓
    Guardar en BD:
      - monto_final_sistema (esperado)
      - monto_final_real (contado físicamente)
      - diferencia
      - fecha_cierre
      - estado: "cerrado"
```

---

## Escenarios y Soluciones

### Escenario 1: Olvidan cerrar la caja al final del día

**Problema**:
```
Día 1 - 8:00pm: Cajero se va sin cerrar turno
Día 2 - 8:00am: Cajero nuevo quiere abrir turno
              → Ya hay turno abierto del día anterior
```

**Solución A: Cierre Automático (Recomendado para MVP)**

```javascript
// Al intentar abrir nuevo turno
if (shiftStore.hasActiveShift) {
  const activeShift = shiftStore.activeShift;
  const hoursOpen = calculateHoursDiff(activeShift.opened_at, new Date());

  if (hoursOpen > 24) {
    // Turno abierto más de 24 horas
    showAlert({
      title: "Turno anterior sin cerrar",
      message: `El turno del ${activeShift.opened_at} lleva ${hoursOpen}h abierto.`,
      actions: [
        {
          text: "Cerrar automáticamente",
          onClick: () => {
            shiftStore.autoClosePreviousShift({
              observation: "Cierre automático por exceder 24 horas"
            });
            openNewShift();
          }
        },
        {
          text: "Cerrar manualmente",
          onClick: () => showCloseShiftModal()
        }
      ]
    });
  }
}
```

**Solución B: Política de Turno (Largo Plazo)**

Configuración en preferencias:
```
Política de turnos:
  [x] Cerrar automáticamente turnos mayores a [ 24 ] horas
  [x] Permitir solo un turno abierto por tienda
  [x] Requiere supervisor para cierre con diferencia > S/[ 50 ]
  [ ] Permitir múltiples turnos simultáneos (multi-caja)
```

### Escenario 2: Múltiples cajas en una tienda

**Situación**:
```
Tienda con 3 cajas registradoras
  ├─ Caja 1: María (turno abierto)
  ├─ Caja 2: Juan (turno abierto)
  └─ Caja 3: Pedro (turno abierto)
```

**Solución para Fase 2**:

Agregar campo `dispositivo_id` o `caja_numero`:

```sql
ALTER TABLE turnos_caja
ADD COLUMN turno_dispositivo VARCHAR(50) NULL
COMMENT 'Identificador de la caja registradora';

-- Constraint: Solo un turno abierto por dispositivo/caja
CREATE UNIQUE INDEX idx_turno_abierto_dispositivo
ON turnos_caja (tienda_id, turno_dispositivo, turno_estado)
WHERE turno_estado = 'abierto';
```

Flujo:
```
Al abrir turno:
  → Seleccionar caja: [CAJA 1] [CAJA 2] [CAJA 3]
  → Validar que esa caja específica no tenga turno abierto
```

### Escenario 3: Supervisor cierra turno de cajero

**Situación**:
```
Cajero: Juan (se fue sin cerrar)
Supervisor: María (necesita cerrar el turno de Juan)
```

**Solución**:

```javascript
// En CloseShiftModal.vue
const closeShift = async () => {
  const shift = shiftStore.activeShift;

  // Si el supervisor está cerrando turno de otro empleado
  if (authStore.user.id !== shift.employee_id) {
    // Requiere autorización de supervisor
    showSupervisorAuth.value = true;
    pendingAction.value = {
      type: 'close_shift_other_employee',
      data: shift
    };
    return;
  }

  // Cerrar normalmente
  await shiftStore.closeShift({...});
};
```

---

## Validaciones Propuestas

### En Menú Principal

```javascript
// Menu.vue
const canAccessPOS = computed(() => {
  return shiftStore.hasActiveShift;
});

const posButtonClass = computed(() => {
  return canAccessPOS.value
    ? 'border-blue-500 cursor-pointer hover:shadow-lg'
    : 'border-gray-300 cursor-not-allowed opacity-50';
});

const handlePOSClick = () => {
  if (!canAccessPOS.value) {
    alert('Debes abrir un turno de caja primero');
    showOpenShiftModal.value = true;
    return;
  }
  router.push('/pos');
};
```

### En POS.vue

```javascript
// router/index.js - Agregar guard de navegación
router.beforeEach((to, from, next) => {
  if (to.path === '/pos') {
    const shiftStore = useShiftStore();
    if (!shiftStore.hasActiveShift) {
      // Redirigir al menú
      next('/menu');
      // Mostrar notificación
      alert('Debes abrir un turno de caja para acceder al POS');
      return;
    }
  }
  next();
});
```

```javascript
// POS.vue - Al agregar pago
const handlePaymentAdded = (paymentData) => {
  // Validar turno abierto
  if (!shiftStore.hasActiveShift) {
    alert('No hay turno de caja abierto. No se pueden registrar pagos.');
    return;
  }

  // Continuar con el flujo normal...
  try {
    cartStore.addPayment({...});
  } catch (error) {
    alert(error.message);
  }
};
```

### En shift.js Store

```javascript
// stores/shift.js
export const useShiftStore = defineStore('shift', {
  state: () => ({
    activeShift: null,
    loading: false
  }),

  getters: {
    hasActiveShift: (state) => state.activeShift !== null,

    canSell: (state) => {
      if (!state.activeShift) return false;
      if (state.activeShift.status !== 'abierto') return false;
      return true;
    },

    shiftDuration: (state) => {
      if (!state.activeShift) return 0;
      const opened = new Date(state.activeShift.opened_at);
      const now = new Date();
      return Math.floor((now - opened) / (1000 * 60 * 60)); // horas
    },

    needsAutoClose: (state) => {
      return state.shiftDuration > 24; // Más de 24 horas abierto
    }
  },

  actions: {
    async fetchActiveShift() {
      // Llamar al API para obtener turno activo
      // Si existe, guardar en state.activeShift
    },

    async autoClosePreviousShift(observation) {
      // Cerrar turno automáticamente con observación
      await this.closeShift({
        auto_closed: true,
        observation,
        closed_by: 'system'
      });
    }
  }
});
```

---

## Plan de Implementación

### ✅ Fase 0: Prevención de cambio de tienda (COMPLETADO)
- [x] Eliminar botón "Cambiar Tienda" del menú
- [x] Actualizar header con: Tienda - Usuario
- [x] Obligar logout para cambiar de tienda

### 📋 Fase 1: Validaciones básicas (PRÓXIMO)
- [ ] Agregar validación en POS: requiere turno abierto
- [ ] Agregar validación en pagos: requiere turno abierto
- [ ] Deshabilitar botón POS si no hay turno
- [ ] Mostrar mensaje claro al usuario

### 📋 Fase 2: Cierre automático de turnos
- [ ] Detectar turnos abiertos > 24 horas
- [ ] Modal de confirmación para cierre automático
- [ ] Observaciones automáticas en cierre

### 📋 Fase 3: Multi-caja (Opcional)
- [ ] Agregar campo `turno_dispositivo`
- [ ] Selector de caja al abrir turno
- [ ] Validación de turno por dispositivo

### 📋 Fase 4: Reportes y auditoría
- [ ] Reporte de diferencias de caja
- [ ] Historial de turnos cerrados
- [ ] Alertas de diferencias > umbral

---

## Estructura de BD Actual vs Propuesta

### Actual (turnos_caja)

```sql
CREATE TABLE turnos_caja (
  turno_id INT PRIMARY KEY AUTO_INCREMENT,
  tienda_id INT NOT NULL,
  usuario_id INT NOT NULL,
  turno_monto_inicial DECIMAL(10,2),
  turno_fecha_apertura DATETIME NOT NULL,
  turno_fecha_cierre DATETIME NULL,
  turno_monto_final DECIMAL(10,2) NULL,
  turno_estado ENUM('abierto', 'cerrado') DEFAULT 'abierto',

  KEY idx_tienda_estado (tienda_id, turno_estado)
);
```

### Propuesta Mejorada

```sql
ALTER TABLE turnos_caja
ADD COLUMN turno_monto_final_real DECIMAL(10,2) NULL
COMMENT 'Monto contado físicamente al cerrar'
AFTER turno_monto_final;

ALTER TABLE turnos_caja
ADD COLUMN turno_diferencia DECIMAL(10,2) NULL
COMMENT 'Diferencia entre esperado y real'
AFTER turno_monto_final_real;

ALTER TABLE turnos_caja
ADD COLUMN turno_observaciones TEXT NULL
COMMENT 'Observaciones del cierre'
AFTER turno_diferencia;

ALTER TABLE turnos_caja
ADD COLUMN turno_cerrado_por INT NULL
COMMENT 'Usuario que cerró (puede ser diferente al cajero)'
AFTER turno_observaciones;

ALTER TABLE turnos_caja
ADD COLUMN turno_cierre_automatico TINYINT(1) DEFAULT 0
COMMENT 'Si fue cerrado automáticamente por el sistema'
AFTER turno_cerrado_por;

ALTER TABLE turnos_caja
ADD COLUMN turno_dispositivo VARCHAR(50) NULL
COMMENT 'Identificador de caja/dispositivo (para multi-caja)'
AFTER usuario_id;

-- Constraint: Solo un turno abierto por tienda (MVP)
-- Comentar o eliminar si se implementa multi-caja
CREATE UNIQUE INDEX idx_un_turno_abierto_por_tienda
ON turnos_caja (tienda_id)
WHERE turno_estado = 'abierto';

-- Para multi-caja, usar este constraint en su lugar:
-- CREATE UNIQUE INDEX idx_un_turno_abierto_por_dispositivo
-- ON turnos_caja (tienda_id, turno_dispositivo)
-- WHERE turno_estado = 'abierto' AND turno_dispositivo IS NOT NULL;
```

---

## Recomendaciones Finales

### Para MVP (Implementar YA)
1. ✅ Eliminar cambio de tienda desde menú
2. ✅ Header con tienda + usuario
3. ⚠️ Validar turno abierto antes de vender
4. ⚠️ Validar turno abierto antes de pagar

### Para Producción (Corto Plazo)
5. Cierre automático de turnos > 24h
6. Reportes de diferencias de caja
7. Observaciones obligatorias en cierres con diferencia

### Para Escalabilidad (Mediano Plazo)
8. Soporte multi-caja por tienda
9. Historial completo de turnos
10. Auditoría de quién cerró qué turno

---

## Documentos Relacionados

- `MODULO_EMPLEADOS.md` - Sistema de roles y autorizaciones
- `VALIDACIONES_Y_CONTROLES.md` - Estados del carrito y validaciones
- `FLUJO_DEVOLUCIONES_Y_NOTAS.md` - Manejo de devoluciones
- `CAMPOS_PENDIENTES_BD.md` - Migraciones pendientes

---

**Última actualización**: 2025-01-21
**Estado**: Fase 0 completada, Fase 1 pendiente
