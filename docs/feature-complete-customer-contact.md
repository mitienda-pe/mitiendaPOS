# Formulario para Completar Email/Teléfono de Cliente Existente

## Problema Identificado

Cuando un usuario buscaba un cliente existente por DNI/RUC en el modal "Iniciar Nueva Venta", el sistema mostraba:
- Nombre del cliente ✅
- Documento del cliente ✅
- Email (si existe) ✅
- Teléfono (si existe) ✅

**Pero si el cliente NO tenía email o teléfono**, no había forma de agregarlos en ese momento. El usuario tenía que:
1. Cancelar el inicio de venta
2. Ir al módulo de Clientes
3. Editar el cliente
4. Volver al POS
5. Iniciar la venta nuevamente

## Solución Implementada

Se agregó un **formulario inline** en el modal de "Iniciar Nueva Venta" que aparece automáticamente cuando:
- El cliente existe en la base de datos
- **Y** le falta el email **O** el teléfono

### Comportamiento

```
┌─────────────────────────────────────────┐
│ CARLOS MARTIN VIDAL SALCEDO             │
│ DNI: 10060436                           │
│ ─────────────────────────────────────── │
│ Complete la información de contacto:    │
│ ┌─────────────────────────────────────┐ │
│ │ Correo electrónico (opcional)       │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ Teléfono (opcional)                 │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### Campos Mostrados

El formulario muestra **solo los campos faltantes**:
- Si **NO tiene email**: muestra input de email
- Si **NO tiene teléfono**: muestra input de teléfono
- Si **tiene ambos**: NO muestra el formulario

## Flujo de Actualización

1. Usuario ingresa DNI/RUC → busca cliente
2. Sistema encuentra cliente existente sin email/teléfono
3. Aparece formulario inline
4. Usuario completa email y/o teléfono (opcional)
5. Usuario hace clic en "Iniciar Venta"
6. **Antes de iniciar la venta**, el sistema:
   - Llama a `PUT /api/v1/customers/:id` con los nuevos datos
   - Actualiza el cliente en la base de datos
   - Usa los datos actualizados para la venta
7. La venta se inicia con el email/teléfono correcto

## Archivos Modificados

### Frontend: StartSaleModal.vue

**Líneas 121-141**: Nuevo formulario inline
```vue
<!-- Form to complete missing data -->
<div v-if="!hasCompleteContactInfo" class="mt-3 pt-3 border-t border-green-200">
  <p class="text-xs text-gray-700 mb-2 font-medium">Complete la información de contacto:</p>
  <div class="space-y-2">
    <input
      v-if="!customerFound.email && !customerFound.correoElectronico"
      v-model="updateCustomer.email"
      type="email"
      placeholder="Correo electrónico (opcional)"
      class="p-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 w-full text-sm"
    />
    <input
      v-if="!customerFound.phone && !customerFound.telefono"
      v-model="updateCustomer.phone"
      type="tel"
      placeholder="Teléfono (opcional)"
      class="p-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 w-full text-sm"
    />
  </div>
</div>
```

**Líneas 274-277**: Nueva variable reactiva
```javascript
const updateCustomer = ref({
  email: '',
  phone: ''
});
```

**Líneas 317-322**: Computed property para verificar datos completos
```javascript
const hasCompleteContactInfo = computed(() => {
  if (!customerFound.value) return true;
  const hasEmail = customerFound.value.email || customerFound.value.correoElectronico;
  const hasPhone = customerFound.value.phone || customerFound.value.telefono;
  return hasEmail && hasPhone;
});
```

**Líneas 454-493**: Función `startWithCustomer` actualizada
```javascript
const startWithCustomer = async () => {
  // ... validaciones ...

  let customerToSend = customerFound.value;

  // Si se completó información de contacto, actualizar el cliente
  if (!hasCompleteContactInfo.value && (updateCustomer.value.email || updateCustomer.value.phone)) {
    try {
      const updateData = {};
      if (updateCustomer.value.email) updateData.email = updateCustomer.value.email;
      if (updateCustomer.value.phone) updateData.telefono = updateCustomer.value.phone;

      const response = await customersApi.updateCustomer(customerFound.value.id, updateData);

      if (response.success) {
        customerToSend = response.data;
      }
    } catch (error) {
      console.error('Error updating customer:', error);
      // Fallback: agregar datos manualmente
      if (updateCustomer.value.email) {
        customerToSend = { ...customerToSend, email: updateCustomer.value.email };
      }
      if (updateCustomer.value.phone) {
        customerToSend = { ...customerToSend, phone: updateCustomer.value.phone };
      }
    }
  }

  emit('start', {
    customer: customerToSend,
    billingDocumentType: selectedDocumentType.value
  });
  closeModal();
};
```

### API: Endpoint Existente

El endpoint ya existía:
- **Ruta**: `PUT /api/v1/customers/:id`
- **Controller**: `Customer::update()`
- **Ubicación**: `/Users/carlosvidal/www/mitienda/mitienda-api-ci4/app/Controllers/V1/Customer.php:261`

Acepta campos:
```json
{
  "email": "carlos@mitienda.pe",
  "telefono": "987654321"
}
```

### Service: customersApi.js

El método `updateCustomer` ya existía (líneas 185-200):
```javascript
async updateCustomer(id, customerData) {
  try {
    const response = await apiClient.put(`/customers/${id}`, customerData);

    return {
      success: true,
      data: response.data.data || response.data
    };
  } catch (error) {
    console.error('Error updating customer:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Error updating customer'
    };
  }
}
```

## Testing

### Caso 1: Cliente sin email ni teléfono
1. Abrir POS
2. Clic en "Iniciar Nueva Venta"
3. Buscar DNI: 10060436 (si no tiene datos)
4. **Resultado esperado**:
   - Aparece nombre del cliente
   - Aparece formulario con 2 campos: email y teléfono
5. Completar email: `carlos@mitienda.pe`
6. Completar teléfono: `987654321`
7. Clic en "Iniciar Venta"
8. **Verificar**:
   - La venta se inicia
   - En detalle de venta aparece el email correcto
   - En base de datos el cliente tiene email/teléfono actualizados

### Caso 2: Cliente solo sin email
1. Cliente tiene teléfono pero no email
2. **Resultado esperado**:
   - Solo aparece campo de email
   - NO aparece campo de teléfono

### Caso 3: Cliente solo sin teléfono
1. Cliente tiene email pero no teléfono
2. **Resultado esperado**:
   - Solo aparece campo de teléfono
   - NO aparece campo de email

### Caso 4: Cliente con ambos datos
1. Cliente tiene email Y teléfono
2. **Resultado esperado**:
   - NO aparece el formulario de completar datos
   - Solo muestra la información del cliente

## Manejo de Errores

Si la actualización del cliente falla:
1. Se registra el error en consola
2. **Fallback**: Se agregan los datos al objeto del cliente localmente
3. La venta continúa con los datos proporcionados
4. El usuario puede ver el email en el detalle de venta
5. El email se enviará si se confirma el pago

## Build Info

- **Compilado**: 2025-10-31
- **Tiempo**: 2.07s
- **Archivo principal**: `dist/assets/POS-Bx_Y5KHf-1761961299861.js` (276.16 kB)

## Beneficios

1. **UX mejorada**: No necesita salir del flujo de venta
2. **Datos más completos**: Incentiva capturar email/teléfono
3. **Email automático**: Si se captura email, se enviará la factura
4. **Opcional**: No es obligatorio completar, respeta la decisión del usuario
5. **Progressive disclosure**: Solo muestra campos necesarios

## Relación con Feature de Email

Este feature complementa la funcionalidad de envío de emails de facturas:
- Si el cliente no tiene email → aparece formulario para agregarlo
- Si se agrega email → se guarda en base de datos
- Cuando se confirma el pago → se envía email automáticamente
- Desde detalle de venta → botón "Enviar Email" funcionará

Ver documentación relacionada:
- [Email Service Implementation](email-invoice-implementation.md)
- [Fix Customer Email Issue](fix-customer-email-issue.md)
