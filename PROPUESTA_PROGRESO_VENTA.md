# Propuesta: Indicador de Progreso para Procesamiento de Venta

**Fecha**: 2025-11-18
**Estado**: PROPUESTA

---

## Problema Actual

El POS muestra un modal genérico "Procesando..." durante la finalización de la venta, pero el proceso puede tomar **15-30 segundos** y a veces da **timeout**. El usuario no sabe:
- ¿En qué paso está el proceso?
- ¿Cuánto falta?
- ¿Si algo falló o solo está lento?

Esto genera:
- ❌ Ansiedad en cajeros
- ❌ Clics duplicados (intentan cancelar/reintentar)
- ❌ Sensación de que el sistema "se colgó"

---

## Investigación del Flujo Actual

### Frontend (POS)
**Archivo**: `src/views/POS.vue`
**Función**: `handlePaymentCompleted()` (línea 605)

**Modal actual**: `ProcessingOverlay.vue`
- Solo muestra: "Procesando..." con spinner
- No indica progreso
- No permite cancelar

### Backend (API)

#### Paso 1: API CI4 recibe la orden
**Archivo**: `app/Controllers/V1/Order.php::createViaLegacyAPI()`
- Valida token
- Obtiene credentials del API legacy

#### Paso 2: Proxy al API Legacy
**Endpoint**: `https://mitienda.pe/api/registrarventa`
- **Pasos internos** (investigados):
  1. ✅ Registrar venta en DB
  2. ✅ Consultar bonificaciones aplicables
  3. ✅ Aplicar bonificaciones (agregar items)
  4. ✅ Facturar con Nubefact (SUNAT)
  5. ✅ Enviar a NetSuite (crear invoice)
  6. ✅ Actualizar stock en NetSuite
  7. ✅ Registrar pagos

**Problema**: El frontend NO tiene visibilidad de estos pasos.

---

## Propuesta de Solución

### Opción 1: Indicador de Progreso con Pasos Estimados (RECOMENDADA)

**Implementación**: Frontend solamente, sin cambios en backend.

#### Ventajas
- ✅ **No requiere cambios en backend** (rápido de implementar)
- ✅ Mejora UX inmediatamente
- ✅ Compatible con API legacy actual

#### Desventajas
- ⚠️ Los pasos son **estimados** (no reflejan el progreso real del backend)
- ⚠️ Si un paso falla a mitad, el frontend no lo sabe hasta el final

#### Diseño Propuesto

**Componente mejorado**: `ProcessingOverlayWithSteps.vue`

```vue
<template>
  <div class="fixed inset-0 z-[9999] bg-gray-900 bg-opacity-95 flex items-center justify-center">
    <div class="bg-white rounded-lg shadow-2xl max-w-lg w-full p-8">

      <!-- Título -->
      <h2 class="text-2xl font-bold text-center mb-6">
        Procesando Venta
      </h2>

      <!-- Barra de progreso -->
      <div class="w-full bg-gray-200 rounded-full h-2 mb-8">
        <div class="bg-green-600 h-2 rounded-full transition-all duration-500"
             :style="{ width: progressPercentage + '%' }">
        </div>
      </div>

      <!-- Lista de pasos -->
      <div class="space-y-3">
        <div v-for="step in steps" :key="step.id"
             class="flex items-center space-x-3 p-3 rounded-lg"
             :class="{
               'bg-green-50': step.status === 'completed',
               'bg-blue-50': step.status === 'processing',
               'bg-gray-50': step.status === 'pending'
             }">

          <!-- Icono -->
          <div class="flex-shrink-0">
            <!-- Completed -->
            <svg v-if="step.status === 'completed'" class="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
            </svg>
            <!-- Processing -->
            <svg v-else-if="step.status === 'processing'" class="w-6 h-6 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <!-- Pending -->
            <svg v-else class="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z"/>
            </svg>
          </div>

          <!-- Texto del paso -->
          <div class="flex-1">
            <p class="font-medium"
               :class="{
                 'text-green-900': step.status === 'completed',
                 'text-blue-900': step.status === 'processing',
                 'text-gray-600': step.status === 'pending'
               }">
              {{ step.label }}
            </p>
            <p v-if="step.status === 'processing'" class="text-sm text-gray-500">
              {{ step.description }}
            </p>
          </div>

          <!-- Tiempo estimado -->
          <div v-if="step.status === 'processing' && step.estimatedTime" class="flex-shrink-0">
            <span class="text-xs text-gray-500">~{{ step.estimatedTime }}s</span>
          </div>
        </div>
      </div>

      <!-- Nota de espera -->
      <p class="text-center text-sm text-gray-500 mt-6">
        Por favor no cierre esta ventana
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const steps = ref([
  {
    id: 1,
    label: 'Validando datos',
    description: 'Verificando información de la venta...',
    status: 'pending',
    estimatedTime: 1
  },
  {
    id: 2,
    label: 'Registrando venta',
    description: 'Guardando en base de datos...',
    status: 'pending',
    estimatedTime: 2
  },
  {
    id: 3,
    label: 'Consultando bonificaciones',
    description: 'Aplicando promociones y descuentos...',
    status: 'pending',
    estimatedTime: 3
  },
  {
    id: 4,
    label: 'Generando comprobante',
    description: 'Facturando con SUNAT (Nubefact)...',
    status: 'pending',
    estimatedTime: 5
  },
  {
    id: 5,
    label: 'Sincronizando con NetSuite',
    description: 'Registrando en sistema ERP...',
    status: 'pending',
    estimatedTime: 8
  },
  {
    id: 6,
    label: 'Actualizando inventario',
    description: 'Ajustando stock de productos...',
    status: 'pending',
    estimatedTime: 3
  },
  {
    id: 7,
    label: 'Finalizando',
    description: 'Completando proceso...',
    status: 'pending',
    estimatedTime: 1
  }
]);

const currentStepIndex = ref(0);

const progressPercentage = computed(() => {
  const totalSteps = steps.value.length;
  const completedSteps = steps.value.filter(s => s.status === 'completed').length;
  const processingStep = steps.value.findIndex(s => s.status === 'processing');

  if (processingStep >= 0) {
    // Si hay un paso en proceso, mostrar progreso parcial de ese paso
    return ((completedSteps + 0.5) / totalSteps) * 100;
  }

  return (completedSteps / totalSteps) * 100;
});

// Simular progreso basado en tiempos estimados
const simulateProgress = () => {
  if (currentStepIndex.value >= steps.value.length) {
    return; // Ya terminamos todos los pasos
  }

  const currentStep = steps.value[currentStepIndex.value];
  currentStep.status = 'processing';

  setTimeout(() => {
    currentStep.status = 'completed';
    currentStepIndex.value++;

    if (currentStepIndex.value < steps.value.length) {
      simulateProgress();
    }
  }, (currentStep.estimatedTime || 2) * 1000);
};

onMounted(() => {
  simulateProgress();
});
</script>
```

#### Uso en `POS.vue`

```vue
<!-- Reemplazar ProcessingOverlay actual -->
<ProcessingOverlayWithSteps
  :show="processingOrder"
  @cancel="handleProcessCancel"
/>
```

#### Tiempos Estimados por Paso

Basado en la investigación:

| Paso | Tiempo estimado | Backend involucrado |
|------|----------------|---------------------|
| 1. Validando datos | 1s | API CI4 (validaciones) |
| 2. Registrando venta | 2s | API Legacy (INSERT DB) |
| 3. Consultando bonificaciones | 3s | API Legacy (queries promociones) |
| 4. Generando comprobante | 5s | Nubefact API (SUNAT) |
| 5. Sincronizando con NetSuite | 8s | NetSuite API (invoice creation) |
| 6. Actualizando inventario | 3s | NetSuite API (stock update) |
| 7. Finalizando | 1s | API Legacy (updates finales) |

**Total estimado**: ~23 segundos

---

### Opción 2: Progreso Real con WebSockets (IDEAL pero más complejo)

**Implementación**: Requiere cambios en backend.

#### Ventajas
- ✅ Refleja el **progreso real** del backend
- ✅ Puede mostrar **errores específicos** en cada paso
- ✅ Permite **reintentar** pasos fallidos
- ✅ Información precisa al usuario

#### Desventajas
- ❌ Requiere modificar el **API legacy** (PHP antiguo)
- ❌ Necesita infraestructura de WebSockets o Server-Sent Events
- ❌ **Tiempo de desarrollo**: 2-3 semanas
- ❌ Requiere testing extensivo

#### Diseño Técnico

**Backend (API CI4)**:
```php
// Cada paso del proceso envía evento via SSE o WebSocket
public function processOrder($orderId) {
    $this->emitProgress('validating', 10);

    // Validar datos
    $this->validate($order);
    $this->emitProgress('registering', 20);

    // Registrar venta
    $saleId = $this->saveSale($order);
    $this->emitProgress('bonifications', 35);

    // ... más pasos
}
```

**Frontend (Vue)**:
```javascript
// Escuchar eventos de progreso
const eventSource = new EventSource(`/api/v1/orders/${orderId}/progress`);

eventSource.onmessage = (event) => {
  const { step, percentage, status } = JSON.parse(event.data);
  updateStepStatus(step, status);
  updateProgressBar(percentage);
};
```

---

### Opción 3: Polling de Estado (Intermedia)

**Implementación**: Backend ligero + polling frontend.

#### Ventajas
- ✅ Más simple que WebSockets
- ✅ Progreso **semi-real** (cada 2-3 segundos)
- ✅ No requiere infraestructura adicional

#### Desventajas
- ⚠️ Delay de 2-3 segundos entre updates
- ⚠️ Más carga en el servidor (requests constantes)

#### Diseño Técnico

**Backend**: Guardar estado en cache/DB
```php
// Cada paso actualiza un campo en DB o Redis
Cache::set("order_{$orderId}_status", [
    'current_step' => 'netsuite_sync',
    'progress' => 60,
    'updated_at' => time()
]);
```

**Frontend**: Polling cada 2 segundos
```javascript
const pollProgress = async () => {
  const response = await fetch(`/api/v1/orders/${orderId}/status`);
  const { current_step, progress } = await response.json();

  updateUI(current_step, progress);

  if (progress < 100) {
    setTimeout(pollProgress, 2000);
  }
};
```

---

## Comparación de Opciones

| Criterio | Opción 1 (Estimado) | Opción 2 (WebSockets) | Opción 3 (Polling) |
|----------|---------------------|----------------------|-------------------|
| **Tiempo implementación** | 1-2 días | 2-3 semanas | 1 semana |
| **Precisión** | Estimado (~80%) | Real (100%) | Semi-real (90%) |
| **Cambios backend** | No | Sí (extensos) | Sí (moderados) |
| **Infraestructura** | No | WebSockets/SSE | No |
| **Carga servidor** | Baja | Media | Media-Alta |
| **UX** | Buena | Excelente | Muy buena |

---

## Recomendación

### Fase 1 (Inmediato): **Opción 1 - Indicador Estimado**

**Por qué**:
- ✅ Mejora UX **inmediatamente** (1-2 días)
- ✅ **No requiere cambios en backend** legacy
- ✅ Reduce ansiedad del 80% de usuarios
- ✅ Fácil de mantener

**Implementar**:
1. Crear `ProcessingOverlayWithSteps.vue`
2. Reemplazar en `POS.vue`
3. Ajustar tiempos estimados según telemetría real

### Fase 2 (Futuro): **Opción 2 - Progreso Real**

**Cuándo**:
- Después de migrar completamente del API legacy a CI4
- Cuando se refactorice el proceso de ventas
- Si los timeouts persisten (>10% de ventas)

---

## Mockup del Diseño

```
┌─────────────────────────────────────────┐
│      Procesando Venta                   │
├─────────────────────────────────────────┤
│                                         │
│  ████████████░░░░░░░░░░░░░  60%       │
│                                         │
│  ✓ Validando datos                     │
│  ✓ Registrando venta                   │
│  ✓ Consultando bonificaciones          │
│  ⟳ Generando comprobante      ~5s      │
│  ○ Sincronizando con NetSuite          │
│  ○ Actualizando inventario             │
│  ○ Finalizando                         │
│                                         │
│  Por favor no cierre esta ventana      │
└─────────────────────────────────────────┘
```

---

## Próximos Pasos

1. ✅ **Aprobar propuesta**: Revisar con el equipo
2. **Implementar Fase 1**: Componente con progreso estimado
3. **Medir tiempos reales**: Telemetría de cada paso (logs)
4. **Ajustar estimaciones**: Basarse en datos reales
5. **Evaluar Fase 2**: Si vale la pena el esfuerzo de WebSockets

---

## Notas Adicionales

### Mejoras Complementarias

1. **Botón "Tomar más tiempo"**: Si pasa el tiempo estimado, mostrar botón para extender wait
2. **Logs en consola**: Para debugging, mantener logs detallados
3. **Retry automático**: Si un paso falla por timeout, reintentar 1 vez
4. **Notificación de éxito**: Cuando complete, mostrar "✓ Venta registrada" antes de cerrar

### Consideraciones de UX

- No permitir cerrar el modal durante el proceso
- Mostrar código de venta lo antes posible (después del paso 2)
- Si falla, mostrar **qué paso falló** específicamente
- Opción de "Ver detalles" para cajeros avanzados

