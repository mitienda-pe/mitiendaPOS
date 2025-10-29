# Flujo de Creación de Órdenes - POS MiTienda

## Estado del Proyecto

**Fecha:** 2025-10-29
**Estado:** Implementación parcial completada - Requiere integración con endpoint de confirmación de pago

### Lo que funciona ✅

1. **Creación de órdenes** - Las órdenes se crean correctamente en el legacy API
2. **Obtención de order_id real** - El backend busca y devuelve el ID correcto de la orden creada
3. **Emisión automática de comprobantes** - El legacy API emite boletas/facturas vía Nubefact
4. **Extracción de JSON contaminado** - Manejo correcto de respuestas con errores PHP/HTML
5. **Respuesta normalizada** - El backend devuelve formato consistente al frontend
6. **Registro de movimientos de caja** - Los pagos se registran en el turno activo

### Lo que falta ❌

1. **Confirmación de pago** - No se está llamando al segundo endpoint del legacy API
2. **Estado de la orden** - Las órdenes quedan en estado 9 (creada) en lugar de estado 1 (pagada/confirmada)
3. **Visibilidad en panel de ventas** - Las órdenes con estado 9 no aparecen porque el filtro busca estado 1

---

## Flujo Actual (Incompleto)

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (POS)                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ POST /api/v1/orders/legacy
                              │ payload: {source: 'pos', customer, items, payments}
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (API v2 - Proxy)                      │
│  /app/Controllers/V1/Order.php::legacyApiProxy()                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 1. Transforma payload a formato legacy
                              │ 2. Obtiene credenciales de la tienda
                              │ 3. Llama al legacy API
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     LEGACY API (api.mitienda.pe)                 │
│              POST /v1/order/order_pos                            │
│                                                                   │
│  Acciones:                                                        │
│  • Crea orden en BD con tiendaventa_pagado = 9 (creada)         │
│  • Genera codigoreferencia (ej: CE12097RKNT)                    │
│  • NO emite factura (se hace en confirmación)                    │
│  • NO envía notificaciones                                       │
│  • Devuelve: {codigoreferencia, sw_error, mensaje, ...}         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Response 200
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (API v2 - Proxy)                      │
│  /app/Controllers/V1/Order.php::legacyApiProxy()                 │
│                                                                   │
│  Acciones:                                                        │
│  • Extrae JSON del HTML contaminado                              │
│  • Obtiene codigoreferencia de la respuesta                      │
│  • Busca order_id en BD por codigoreferencia                     │
│  • ❌ ACTUALIZA origen='pos' y pagado=1 (INCORRECTO)            │
│  • Normaliza respuesta                                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ {order_id, order_number, legacy_response}
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (POS)                           │
│                                                                   │
│  • Muestra ticket de éxito                                       │
│  • Registra movimiento de caja                                   │
│  • ❌ NO confirma el pago                                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        PROBLEMA ACTUAL                           │
│                                                                   │
│  La orden queda con tiendaventa_pagado = 9                       │
│  Panel de ventas filtra por estado = 1                           │
│  ➜ La venta NO aparece en el panel                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## Flujo Correcto (A Implementar)

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (POS)                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ POST /api/v1/orders/legacy
                              │ payload: {source: 'pos', customer, items, payments}
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (API v2 - Proxy)                      │
│  /app/Controllers/V1/Order.php::legacyApiProxy()                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 1. Transforma payload a formato legacy
                              │ 2. Obtiene credenciales de la tienda
                              │ 3. Llama al legacy API
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     LEGACY API (api.mitienda.pe)                 │
│              POST /v1/order/order_pos                            │
│                                                                   │
│  Acciones:                                                        │
│  • Crea orden en BD con tiendaventa_pagado = 9 (creada)         │
│  • Genera codigoreferencia (ej: CE12097RKNT)                    │
│  • Devuelve: {codigoreferencia, sw_error, mensaje, ...}         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Response 200 (estado 9)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (API v2 - Proxy)                      │
│  /app/Controllers/V1/Order.php::legacyApiProxy()                 │
│                                                                   │
│  Acciones:                                                        │
│  • Extrae JSON del HTML contaminado                              │
│  • Obtiene codigoreferencia de la respuesta                      │
│  • Busca order_id en BD por codigoreferencia                     │
│  • ✅ NO modifica la orden (se mantiene estado 9)               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ ⚠️ NUEVO: Llamar endpoint de confirmación
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     LEGACY API (api.mitienda.pe)                 │
│              POST /v1/order/confirmar_pago (¿?)                  │
│                                                                   │
│  Parámetros requeridos:                                          │
│  • tiendaventa_id (obtenido en paso anterior)                    │
│  • estado_pago: 1 (confirmado) / 0 (rechazado) / 2 (pendiente)  │
│  • método_pago                                                   │
│  • ... (otros parámetros por confirmar)                          │
│                                                                   │
│  Acciones del legacy API:                                        │
│  • Actualiza tiendaventa_pagado = 1                              │
│  • Actualiza tiendaventa_origen = 'pos'                          │
│  • ✅ Emite comprobante vía Nubefact                            │
│  • ✅ Envía notificaciones por email                            │
│  • ✅ Dispara webhooks si los hay                               │
│  • ✅ Actualiza stock                                           │
│  • ✅ Registra en contabilidad                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Response 200 (confirmación exitosa)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (API v2 - Proxy)                      │
│  /app/Controllers/V1/Order.php::legacyApiProxy()                 │
│                                                                   │
│  • Normaliza respuesta con datos de confirmación                 │
│  • Devuelve al frontend                                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ {order_id, order_number, billing_document, ...}
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (POS)                           │
│                                                                   │
│  • Muestra ticket con enlace al PDF de la factura                │
│  • Registra movimiento de caja                                   │
│  • ✅ Orden confirmada con estado 1                             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         RESULTADO FINAL                          │
│                                                                   │
│  ✅ Orden con tiendaventa_pagado = 1                            │
│  ✅ Orden con tiendaventa_origen = 'pos'                        │
│  ✅ Comprobante emitido automáticamente                         │
│  ✅ Venta aparece en el panel de ventas                         │
│  ✅ Cliente recibe email con comprobante                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Detalles Técnicos

### Estados de tiendaventa_pagado

| Estado | Significado | Cuándo se usa |
|--------|-------------|---------------|
| **9** | Orden creada (inicial) | Al crear la orden en `/v1/order/order_pos` |
| **0** | Pago rechazado | Cuando la pasarela rechaza el pago |
| **1** | Pago confirmado | Cuando se confirma el pago (efectivo en POS, o pasarela aprueba) |
| **2** | Pago pendiente | Cuando se espera confirmación de pasarela (ej: Yape offsite) |

### Arquitectura del Legacy API

El legacy API fue diseñado para tienda virtual con pagos online:

1. **Primera llamada** (`/v1/order/order_pos`):
   - Reserva el pedido
   - Crea orden con estado 9
   - **NO** procesa pago
   - **NO** emite factura

2. **Segunda llamada** (endpoint por confirmar):
   - Confirma/rechaza el pago
   - Actualiza estado a 1/0/2
   - Emite factura si es aprobado
   - Envía notificaciones
   - Dispara procesos post-venta

### Diferencia POS vs Tienda Virtual

| Aspecto | Tienda Virtual | POS |
|---------|----------------|-----|
| **Pago** | Asíncrono (pasarela) | Síncrono (efectivo/tarjeta presente) |
| **Confirmación** | Webhook de pasarela | Inmediata después de crear orden |
| **Flujo** | 1. Crear orden<br>2. Redirigir a pasarela<br>3. Webhook confirma | 1. Crear orden<br>2. Confirmar pago inmediatamente |

---

## Cambios Realizados

### Backend: `/app/Controllers/V1/Order.php`

#### ✅ Implementado

1. **Extracción de JSON contaminado** (líneas 403-435):
   ```php
   // El legacy API puede devolver errores PHP HTML antes del JSON
   if (strpos($responseBody, '<div style="border:1px solid #990000') !== false) {
       $lastBracePos = strrpos($responseBody, '{"sw_error"');
       $jsonBody = substr($responseBody, $lastBracePos);
   }
   $responseData = json_decode($jsonBody, true);
   ```

2. **Normalización de respuesta** (líneas 460-487):
   ```php
   // Usar codigoreferencia en lugar de tiendaventa_codigoreferencia
   $orderNumber = $responseData['codigoreferencia'] ?? null;

   // Buscar order_id en BD si no viene en respuesta
   if (!$orderId && $orderNumber) {
       $builder->where('tiendaventa_codigoreferencia', $orderNumber);
       $order = $builder->get()->getRowArray();
       $orderId = $order['tiendaventa_id'];
   }
   ```

3. **Parámetros del legacy API** (líneas 540-668):
   ```php
   'modo_de_entrega' => '2',              // Recojo en tienda (POS)
   'tiendadireccion_id' => '1',
   'tiendaventa_origen' => 'pos',
   'tiendaventa_pagado' => '1',           // ❌ ESTO ES INCORRECTO
   ```

#### ❌ Por corregir

1. **Remover parámetro `tiendaventa_pagado`** del payload:
   ```php
   // ELIMINAR esta línea (664):
   'tiendaventa_pagado' => '1',
   ```

2. **Remover UPDATE forzado** (líneas 485-492):
   ```php
   // ELIMINAR este bloque:
   $updateBuilder = $db->table('tiendasventas');
   $updateBuilder->where('tiendaventa_id', $orderId);
   $updateBuilder->update([
       'tiendaventa_origen' => 'pos',
       'tiendaventa_pagado' => 1
   ]);
   ```

#### ⚠️ Por implementar

1. **Agregar llamada al endpoint de confirmación** (después de línea 487):
   ```php
   if ($orderId) {
       // Confirmar el pago inmediatamente (POS siempre es pago confirmado)
       $confirmationResult = $this->confirmPayment($orderId, $tienda_id, $legacyToken, $data);

       if ($confirmationResult['success']) {
           log_message('info', "Payment confirmed for order {$orderId}");
           // Agregar datos de facturación a la respuesta
           $responseData['billing_document'] = $confirmationResult['billing_data'];
       } else {
           log_message('error', "Failed to confirm payment for order {$orderId}");
           // ¿Qué hacer si falla? ¿Revertir la orden?
       }
   }
   ```

2. **Crear método `confirmPayment()`**:
   ```php
   private function confirmPayment(int $orderId, int $tiendaId, string $legacyToken, array $orderData): array
   {
       // Llamar al endpoint de confirmación del legacy API
       // URL: ??? (por confirmar con equipo legacy)
       // Payload: ??? (por confirmar)
       // Response: ??? (por confirmar)
   }
   ```

### Frontend: `/src/views/POS.vue`

#### ✅ Implementado

1. **Envío de campo `source`** (línea 491):
   ```javascript
   const orderData = {
       source: 'pos',  // Identificar origen
       customer: { ... },
       items: [ ... ],
       payments: [ ... ]
   };
   ```

2. **Flujo simplificado** (líneas 593-604):
   ```javascript
   showTicket.value = true;
   setTimeout(() => {
       resetSale();
   }, 2000);
   ```

#### ⚠️ Por mejorar

1. **Mostrar datos reales de facturación en el ticket**:
   - Serie y correlativo de la boleta/factura
   - Enlace al PDF del comprobante
   - Botón "Imprimir" que abra el PDF

---

## Próximos Pasos

### 1. Información Requerida del Equipo Legacy API ⚠️

**URGENTE: Necesitamos esta información antes de continuar**

- [ ] **URL del endpoint de confirmación de pago**
  - Ejemplo: `POST /v1/order/confirmar_pago`
  - ¿O es `/v1/order/update_status`?

- [ ] **Parámetros requeridos**:
  ```json
  {
    "tiendaventa_id": 801341,
    "tienda_id": 12097,
    "estado_pago": 1,  // 1=confirmado, 0=rechazado, 2=pendiente
    "metodo_pago": "efectivo",  // ¿Es necesario?
    "monto_pagado": 7.08,       // ¿Es necesario?
    // ¿Qué otros parámetros?
  }
  ```

- [ ] **Estructura de la respuesta exitosa**:
  ```json
  {
    "success": true,
    "message": "...",
    "factura": {
      "serie": "B001",
      "correlativo": "00015",
      "pdf_url": "https://s3.amazonaws.com/...",
      "xml_url": "https://s3.amazonaws.com/...",
      "qr_url": "https://s3.amazonaws.com/..."
    }
  }
  ```

- [ ] **¿Requiere el token del legacy API?**
  - ¿Mismo header `Authorization` que `/v1/order/order_pos`?

- [ ] **¿Qué hacer si falla la confirmación?**
  - ¿Revertir/cancelar la orden?
  - ¿Dejar en estado 9 para procesamiento manual?
  - ¿Reintentar automáticamente?

### 2. Implementación Backend

- [ ] **Remover código incorrecto**:
  - Eliminar `'tiendaventa_pagado' => '1'` del payload (línea 664)
  - Eliminar UPDATE forzado de estado (líneas 485-492)

- [ ] **Implementar método `confirmPayment()`**:
  ```php
  private function confirmPayment(int $orderId, int $tiendaId, string $legacyToken, array $orderData): array
  {
      $client = \Config\Services::curlrequest();

      $payload = [
          'tiendaventa_id' => $orderId,
          'tienda_id' => $tiendaId,
          'estado_pago' => 1, // Confirmado (POS siempre es confirmado)
          // ... otros campos según documentación
      ];

      try {
          $response = $client->post(
              'https://api.mitienda.pe/v1/order/ENDPOINT_POR_CONFIRMAR',
              [
                  'headers' => [
                      'Authorization' => 'Bearer ' . $legacyToken,
                      'Content-Type' => 'application/json'
                  ],
                  'json' => $payload,
                  'timeout' => 30
              ]
          );

          $statusCode = $response->getStatusCode();
          $responseBody = $response->getBody();

          if ($statusCode === 200) {
              $data = json_decode($responseBody, true);
              return [
                  'success' => true,
                  'billing_data' => $data['factura'] ?? null
              ];
          } else {
              return [
                  'success' => false,
                  'error' => $responseBody
              ];
          }

      } catch (\Exception $e) {
          log_message('error', "Error confirming payment: " . $e->getMessage());
          return [
              'success' => false,
              'error' => $e->getMessage()
          ];
      }
  }
  ```

- [ ] **Integrar llamada en `legacyApiProxy()`**:
  ```php
  // Después de obtener $orderId (línea 487)
  if ($orderId) {
      $confirmationResult = $this->confirmPayment($orderId, $tienda_id, $legacyToken, $data);

      if ($confirmationResult['success']) {
          // Agregar datos de facturación a la respuesta
          if (isset($confirmationResult['billing_data'])) {
              $responseData['billing_document'] = $confirmationResult['billing_data'];
          }
      } else {
          // Log del error pero NO fallar la creación
          log_message('error', "Payment confirmation failed but order was created: {$orderId}");
          // La orden queda en estado 9 para procesamiento manual
      }
  }
  ```

- [ ] **Manejo de errores**:
  - Si falla la confirmación, ¿revertir la orden?
  - O ¿dejar en estado 9 y notificar al administrador?
  - Definir estrategia con el equipo

### 3. Implementación Frontend

- [ ] **Actualizar TicketModal.vue**:
  ```vue
  <script setup>
  const props = defineProps({
    orderInfo: Object,  // Contiene billing_document del backend
    // ...
  });

  const billingDocument = computed(() => {
    return props.orderInfo?.billingDocument || null;
  });

  const pdfUrl = computed(() => {
    return billingDocument.value?.pdf_url || null;
  });
  </script>

  <template>
    <div v-if="billingDocument">
      <p>Comprobante: {{ billingDocument.serie }}-{{ billingDocument.correlativo }}</p>
      <button v-if="pdfUrl" @click="window.open(pdfUrl, '_blank')">
        📄 Imprimir Comprobante
      </button>
    </div>
  </template>
  ```

- [ ] **Pasar datos de facturación desde POS.vue**:
  ```javascript
  // En el response handler (línea 533)
  const orderInfo = {
    order_id: response.data.order_id,
    order_code: response.data.order_number,
    total: total.value,
    customer: selectedCustomer.value,
    billingDocument: response.data.legacy_response?.billing_document || null
  };
  ```

### 4. Testing

- [ ] **Test 1: Venta simple con efectivo**
  - Crear orden
  - Verificar que se confirma automáticamente
  - Verificar estado = 1 en BD
  - Verificar que aparece en panel de ventas
  - Verificar que se puede descargar PDF

- [ ] **Test 2: Venta con cliente DNI**
  - Boleta con DNI
  - Verificar datos en comprobante

- [ ] **Test 3: Venta con cliente RUC**
  - Factura con RUC
  - Verificar datos en comprobante

- [ ] **Test 4: Manejo de errores**
  - Simular falla en confirmación
  - Verificar que orden queda en estado 9
  - Verificar que se puede procesar manualmente

### 5. Documentación

- [ ] **Actualizar README del proyecto**
- [ ] **Documentar flujo completo de creación de órdenes**
- [ ] **Documentar manejo de errores y recuperación**
- [ ] **Crear guía de troubleshooting**

---

## Preguntas Pendientes

1. **¿El endpoint de confirmación emite el comprobante automáticamente?**
   - O ¿necesitamos llamar a un tercer endpoint para emisión?

2. **¿Qué pasa si hay un error de Nubefact al emitir?**
   - ¿La orden queda en qué estado?
   - ¿Se puede reintentar la emisión?

3. **¿Las ventas del POS deben verse en el admin de la tienda virtual?**
   - ¿Hay algún reporte consolidado?

4. **¿Hay webhooks o notificaciones que se disparan?**
   - ¿Email al cliente?
   - ¿Notificación al administrador?

5. **¿El filtro del panel de ventas debe incluir estado 9?**
   - Para ver órdenes pendientes de confirmación
   - O ¿es mejor mantener el filtro en estado 1?

---

## Notas Importantes

### Errores PHP en Respuesta del Legacy API

El legacy API devuelve errores/warnings de PHP como HTML **antes** del JSON válido:

```
<div style="border:1px solid #990000;...">
<h4>A PHP Error was encountered</h4>
...
</div>
{"sw_error":"0","mensaje":"..."}
```

**Solución implementada:** Extraer el último objeto JSON de la respuesta (líneas 403-435 de Order.php)

### Modo de Entrega

El parámetro `modo_de_entrega` es crítico:
- `"0"` → Error: "No seleccionó como desea recibir su pedido"
- `"1"` → Error: Requiere datos de ubigeo
- `"2"` → ✅ Recojo en tienda (correcto para POS)

### Multi-tenant

- Un usuario puede gestionar 10+ tiendas
- Requiere dos tokens: usuario + tienda
- El `tienda_id` se obtiene del JWT después de seleccionar tienda
- Store en prueba: **12097** (sanjorgeprueba)

---

## Referencias

- **Backend API:** `/Users/carlosvidal/www/mitienda/mitienda-api-ci4/app/Controllers/V1/Order.php`
- **Frontend POS:** `/Users/carlosvidal/www/mitienda/mitienda-POS/src/views/POS.vue`
- **Panel Ventas:** `/Users/carlosvidal/www/mitienda/mitienda-POS/src/views/Sales.vue`
- **Legacy API:** `https://api.mitienda.pe/v1/order/order_pos`
- **API v2:** `https://api2.mitienda.pe/api/v1/orders/legacy`
