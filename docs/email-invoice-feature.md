# Funcionalidad de Envío de Emails de Facturas - POS

## Descripción

Esta funcionalidad permite enviar la factura por email al cliente directamente desde la vista de detalle de venta en el POS.

## Ubicación

**Vista**: `/sales/:id` - Detalle de Venta

## Características Implementadas

### Botón "Enviar Email"

- **Color**: Verde (bg-green-600)
- **Ícono**: Sobre (envelope)
- **Ubicación**: Al lado del botón "Reimprimir" en el header
- **Estados**:
  - Normal: "Enviar Email"
  - Cargando: "Enviando..." con spinner animado
  - Deshabilitado durante el envío

### Condiciones de Visibilidad

El botón solo aparece si:
- ✅ La venta está aprobada (status = 1)
- ✅ El cliente tiene email válido (contiene @)

Si no cumple estas condiciones, el botón no se muestra.

### Notificaciones

**Éxito (verde)**:
```
✓ Factura enviada a cliente@ejemplo.com
```

**Errores (rojo)**:
- "Esta venta no tiene un email de cliente asociado"
- "El email del cliente no es válido"
- "No se pudo enviar el email. Verifica que la venta tenga factura emitida."

Las notificaciones desaparecen automáticamente después de 5 segundos.

## Archivos Modificados

### 1. [src/services/ordersApi.js](../src/services/ordersApi.js)

Agregada función `resendInvoiceEmail()`:

```javascript
async resendInvoiceEmail(orderId) {
  try {
    const response = await apiClient.post(`/orders/${orderId}/resend-invoice-email`);
    return response.data;
  } catch (error) {
    // Error handling
  }
}
```

### 2. [src/views/SaleDetail.vue](../src/views/SaleDetail.vue)

**Variables de estado agregadas**:
- `sendingEmail` - Indica si está enviando
- `emailSuccess` - Mensaje de éxito
- `emailError` - Mensaje de error

**Funciones agregadas**:
- `sendEmail()` - Envía el email al cliente
- `canSendEmail()` - Valida si puede enviar email

**UI agregada**:
- Botón "Enviar Email" con spinner
- Notificación de éxito (verde)
- Notificación de error (rojo)

## Flujo de Uso

### Caso Exitoso

1. Usuario entra a `/sales/:id` de una venta aprobada
2. Si la venta tiene email, ve el botón verde "Enviar Email"
3. Click en el botón
4. El botón muestra "Enviando..." con spinner
5. Aparece notificación verde: "Factura enviada a cliente@ejemplo.com"
6. Notificación desaparece después de 5 segundos

### Caso: Sin Email

1. Usuario entra a `/sales/:id` de una venta sin email
2. El botón "Enviar Email" NO aparece
3. Solo ve el botón "Reimprimir"

### Caso: Error

1. Usuario click en "Enviar Email"
2. Si la venta no tiene factura emitida o hay un error:
3. Aparece notificación roja con el mensaje de error
4. Notificación desaparece después de 5 segundos

## Validaciones

### Frontend
- ✅ Email debe existir
- ✅ Email debe contener @
- ✅ Venta debe estar aprobada (status = 1)
- ✅ No permite enviar mientras está en proceso

### Backend
- ✅ Orden debe existir
- ✅ Orden debe pertenecer a la tienda del usuario
- ✅ Orden debe tener factura emitida (`tiendaventa_swestadofacturacion = 1`)
- ✅ Email debe ser válido (validación con `filter_var`)

## Endpoint del API

```
POST /api/v1/orders/{id}/resend-invoice-email
```

**Headers**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Respuesta Exitosa**:
```json
{
  "error": 0,
  "message": "Email enviado exitosamente",
  "data": {
    "order_id": 801053,
    "email_sent_to": "cliente@ejemplo.com",
    "document": "F001-00123"
  }
}
```

**Errores Posibles**:
```json
{
  "error": 1,
  "message": "Esta orden no tiene factura emitida"
}
```

## Contenido del Email

El email enviado incluye:
- ✅ Saludo con nombre del cliente
- ✅ Código de referencia de la orden
- ✅ Fecha de compra
- ✅ Lista de productos con precios
- ✅ Total
- ✅ Serie y correlativo de factura
- ✅ Método de pago
- ✅ Tipo de envío
- ✅ Branding de la tienda

Plantilla: `confirmacion_compra` (mtservicios)

## Cómo Probar

### 1. Compilar el POS

```bash
cd /Users/carlosvidal/www/mitienda/mitienda-POS
npm run build
```

### 2. Probar con Venta Real

```bash
# 1. Crear una venta con email válido desde el POS
# 2. Ir a Ventas → Click en la venta
# 3. Verificar que aparece el botón verde "Enviar Email"
# 4. Click en el botón
# 5. Esperar notificación de éxito
```

### 3. Verificar Email Recibido

Revisar la bandeja del cliente para confirmar que llegó el email con:
- Asunto: "Confirmación de compra - [Nombre Tienda]"
- Productos
- Total
- Serie y correlativo de factura

### 4. Probar Casos de Error

**Sin Email**:
- Crear venta sin capturar email
- Verificar que el botón NO aparece

**Sin Factura**:
- Venta pendiente (sin confirmar pago)
- Click en "Enviar Email"
- Debe mostrar error: "No se pudo enviar el email. Verifica que la venta tenga factura emitida."

## Logs para Debugging

### Frontend (Consola del navegador)
```javascript
// Ver llamada al API
"🚀 [ordersApi] Calling apiClient.post(/orders/123/resend-invoice-email)"

// Ver respuesta
"✅ [ordersApi] Response received: {...}"

// Ver errores
"❌ [ordersApi] Error resending invoice email: ..."
```

### Backend (API)
```bash
tail -f /var/www/api2.mitienda.pe/writable/logs/*.log | grep EMAIL

# Buscar:
# [INFO] Manual invoice email resend requested for order 123
# [INFO] Invoice email resent successfully for order 123 to cliente@ejemplo.com
# [ERROR] Failed to resend invoice email for order 123: ...
```

## Diferencias con Backoffice

| Característica | POS | Backoffice |
|---|---|---|
| Framework | Vue 3 (Options API) | Vue 3 (Composition API) |
| Notificaciones | Componentes custom | PrimeVue Toast |
| Ubicación | Solo en detalle de venta | Detalle + Listado documentos |
| Estilo | TailwindCSS directo | PrimeVue + TailwindCSS |

## Próximas Mejoras

- [ ] Agregar historial de emails enviados
- [ ] Permitir editar email antes de enviar
- [ ] Opción de incluir/excluir adjunto PDF
- [ ] Envío desde el listado de ventas (Sales.vue)
- [ ] Preview del email antes de enviar
- [ ] Reenvío automático si falla

## Notas Importantes

1. **Envío Asíncrono**: Los emails se envían de forma asíncrona, el POS no espera a que llegue
2. **No Bloquea**: Si falla, no afecta la venta
3. **Reintentable**: Se puede reenviar múltiples veces
4. **Logs Completos**: Todos los envíos se registran en `email_logs` de mtservicios
5. **Validación Doble**: Frontend y backend validan antes de enviar

## Soporte

Para problemas:
1. Revisar consola del navegador (F12)
2. Revisar logs del API
3. Consultar tabla `email_logs` en mtservicios
4. Ver documentación del servicio de emails: [../../mtservicios/docs/email-service.md](../../mtservicios/docs/email-service.md)
