# Integración de Comprobantes de Pago en POS

## 📋 Descripción

Se ha implementado la emisión de comprobantes de pago electrónicos (boletas y facturas) directamente desde el POS, utilizando el proveedor Nubefact a través del API existente.

## 🎯 Funcionalidades Implementadas

### 1. Emisión de Comprobantes
- **Boleta de Venta**: Para clientes sin RUC
- **Factura**: Para clientes con RUC registrado
- **Formato de impresión**: TICKET (80mm) para impresoras térmicas o A4 estándar

### 2. Flujo de Emisión
1. El cajero completa una venta en el POS
2. Después de procesar el pago, se muestra automáticamente un prompt preguntando si desea emitir comprobante
3. Si acepta, se abre el modal de emisión de comprobantes
4. El cajero selecciona el tipo de comprobante (Boleta o Factura)
5. Selecciona el formato de impresión (TICKET o A4)
6. Emite el comprobante

## 🗂️ Archivos Creados

### Tipos TypeScript
- `src/types/billing.ts` - Definiciones de tipos para billing

### Servicios API
- `src/services/billingApi.js` - Cliente API para endpoints de facturación

### Stores Pinia
- `src/stores/billing.js` - Store para gestionar estado de facturación

### Componentes Vue
- `src/components/BillingDocumentModal.vue` - Modal para emitir comprobantes

### Modificaciones
- `src/views/POS.vue` - Integración del modal en el flujo de venta

## 🔧 Requisitos Previos

### Configuración de Nubefact
Antes de usar esta funcionalidad, el administrador debe configurar las credenciales de Nubefact en el backoffice:

1. Acceder al backoffice de administración
2. Ir a **Configuración > Facturación > Nubefact**
3. Ingresar:
   - URL de Nubefact
   - Token de API
   - Serie de factura (ej: F001)
   - Número inicial de factura
   - Serie de boleta (ej: B001)
   - Número inicial de boleta
   - Ambiente (Producción o Prueba)
   - Formato PDF predeterminado

## 📡 Endpoints Utilizados

### GET `/api/v1/billing/nubefact`
Obtiene la configuración de Nubefact para la tienda actual.

**Response:**
```json
{
  "success": true,
  "data": {
    "provider": {
      "id": 2,
      "name": "Nubefact",
      "description": "Proveedor de facturación electrónica",
      "logo": "..."
    },
    "configured": true,
    "credentials": {
      "nubefact_url": "https://...",
      "environment": "produccion",
      "serie_factura": "F001",
      "numero_factura": 15,
      "serie_boleta": "B001",
      "numero_boleta": 152,
      "pdf_format": "TICKET"
    }
  }
}
```

### POST `/api/v1/billing/documents/emit`
Emite un comprobante de pago para una orden específica.

**Request:**
```json
{
  "order_id": 1234,
  "document_type": 2,
  "pdf_format": "TICKET"
}
```

**Parámetros:**
- `order_id` (required): ID de la orden
- `document_type` (required): 1 = Factura, 2 = Boleta
- `pdf_format` (optional): "A4", "TICKET", "80MM" (default: valor configurado en Nubefact)

**Response:**
```json
{
  "success": true,
  "message": "Document emitted successfully",
  "data": {
    "order_id": 1234,
    "document_type": 2,
    "serie": "B001",
    "correlative": "152",
    "files": {
      "pdf": "https://...",
      "xml": "https://...",
      "cdr": "https://...",
      "qr": "https://..."
    }
  }
}
```

### GET `/api/v1/billing/documents`
Lista los comprobantes emitidos (para futuras implementaciones).

**Query params:**
- `limit`: Número de documentos a retornar (default: 20)
- `offset`: Offset para paginación (default: 0)

## 🎨 Componentes UI

### BillingDocumentModal
Modal principal para emisión de comprobantes.

**Props:**
- `modelValue` (Boolean): Control de visibilidad del modal
- `orderId` (Number): ID de la orden
- `orderLabel` (String): Etiqueta de la orden (ej: "Venta #1234")
- `orderTotal` (Number): Total de la orden
- `customer` (Object): Datos del cliente

**Events:**
- `update:modelValue`: Actualiza visibilidad
- `success`: Emitido cuando el comprobante se emite exitosamente
- `error`: Emitido cuando ocurre un error

## 🔄 Flujo de Integración en POS

```javascript
// 1. Completar venta
const response = await ordersApi.createOrder(orderData);

// 2. Guardar datos de la orden
const orderInfo = {
  order_id: response.data.order_id,
  order_code: response.data.order_code,
  total: total.value
};

// 3. Preguntar si desea emitir comprobante
setTimeout(() => {
  if (confirm('¿Desea emitir un comprobante de pago (Boleta o Factura)?')) {
    completedOrder.value = orderInfo;
    showBillingModal.value = true;
  }
}, 1000);
```

## 🔐 Validaciones

### Validaciones del Backend
- Orden debe existir y pertenecer a la tienda
- Orden no debe tener comprobante emitido previamente
- Credenciales de Nubefact deben estar configuradas
- Para facturas: Cliente debe tener RUC y datos fiscales completos

### Validaciones del Frontend
- Tipo de comprobante debe ser seleccionado
- Advertencia para facturas sobre requisitos de RUC

## 📝 Notas Importantes

1. **Ambiente de prueba vs Producción**:
   - Usar ambiente de prueba para tests
   - Cambiar a producción solo cuando esté listo

2. **Correlativo automático**:
   - El backend incrementa automáticamente el correlativo después de cada emisión

3. **Formato PDF**:
   - TICKET (80mm): Ideal para impresoras térmicas de punto de venta
   - A4: Formato estándar para impresoras de oficina

4. **IGV incluido**:
   - Todos los cálculos incluyen IGV (18%)
   - El backend calcula automáticamente base imponible e IGV

5. **Documentos sin RUC**:
   - Para boletas < S/ 700 no es obligatorio el DNI según SUNAT
   - El sistema maneja automáticamente tipo "Sin documento" cuando no hay DNI

## 🚀 Próximas Mejoras

- [ ] Vista de historial de comprobantes emitidos en el POS
- [ ] Reimpresión de comprobantes
- [ ] Envío automático por correo electrónico
- [ ] Anulación de comprobantes (notas de crédito)
- [ ] Soporte para múltiples proveedores de facturación
- [ ] Configuración de impresora térmica desde el POS

## 🐛 Solución de Problemas

### Error: "Nubefact credentials not configured"
**Solución**: Configurar credenciales de Nubefact en el backoffice.

### Error: "This order already has a billing document"
**Solución**: La orden ya tiene un comprobante emitido. No se puede emitir duplicado.

### Error al conectar con Nubefact
**Solución**:
1. Verificar URL y token de Nubefact
2. Verificar conexión a internet
3. Usar "Probar conexión" en configuración de Nubefact

### Comprobante no se imprime
**Solución**:
1. Verificar que el formato PDF sea el correcto para tu impresora
2. Descargar manualmente el PDF desde el enlace devuelto
3. Configurar impresora en el navegador

## 📞 Soporte

Para soporte técnico o consultas sobre esta funcionalidad, contactar al equipo de desarrollo.
