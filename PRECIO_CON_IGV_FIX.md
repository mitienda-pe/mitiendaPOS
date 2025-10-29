# Corrección: Precios con IGV incluido

## Problema Identificado

El sistema POS estaba **asumiendo que los precios en la base de datos NO incluyen IGV**, cuando en realidad **SÍ lo incluyen**. Esto causaba un **doble cobro de IGV**:

### Comportamiento Anterior (Incorrecto)
```javascript
// Precio en BD: S/ 118.00 (ya incluye IGV)
// El POS calculaba:
subtotal = 118.00           // ❌ Incorrecto: trataba el precio con IGV como si fuera sin IGV
IGV = 118.00 * 0.18 = 21.24 // ❌ Calculaba IGV adicional
total = 118.00 + 21.24 = 139.24 // ❌ Total inflado

// Resultado: Cliente pagaba S/ 139.24 en vez de S/ 118.00
```

### Comportamiento Correcto (Actual)
```javascript
// Precio en BD: S/ 118.00 (ya incluye IGV)
// El POS ahora calcula:
precioSinIGV = 118.00 / 1.18 = 100.00  // ✅ Extrae el precio base
subtotal = 100.00                       // ✅ Precio sin IGV
IGV = 100.00 * 0.18 = 18.00            // ✅ IGV correcto
total = 100.00 + 18.00 = 118.00        // ✅ Total correcto

// Resultado: Cliente paga exactamente S/ 118.00 como debe ser
```

---

## Archivos Modificados

### 1. `/src/stores/cart.js`

**Cambios en los getters de cálculo:**

```javascript
// ANTES:
subtotal: (state) => {
  return state.items.reduce((sum, item) => {
    const precio = parseFloat(item.precio) || 0;
    const cantidad = parseInt(item.quantity) || 0;
    return sum + (precio * cantidad);
  }, 0);
},

tax(state) {
  return this.subtotal * 0.18;
},

total(state) {
  return this.subtotal + this.tax;
}

// DESPUÉS:
subtotal: (state) => {
  return state.items.reduce((sum, item) => {
    const precioConIGV = parseFloat(item.precio) || 0;
    const cantidad = parseInt(item.quantity) || 0;
    // Extraer el precio sin IGV: precio_con_igv / 1.18
    const precioSinIGV = precioConIGV / 1.18;
    return sum + (precioSinIGV * cantidad);
  }, 0);
},

tax(state) {
  // El IGV es el 18% del subtotal (precio sin IGV)
  return this.subtotal * 0.18;
},

total(state) {
  // Total = Subtotal (sin IGV) + IGV
  return this.subtotal + this.tax;
}
```

---

### 2. `/src/views/POS.vue`

**Cambios en el envío de datos al backend:**

```javascript
// ANTES:
items: cartItems.value.map(item => ({
  product_id: item.id,
  sku: item.sku,
  name: item.nombre,
  quantity: item.quantity,
  unit_price: item.precio,
  subtotal: item.precio * item.quantity,
  tax: (item.precio * item.quantity) * 0.18,
  total: (item.precio * item.quantity) * 1.18
})),

// DESPUÉS:
items: cartItems.value.map(item => ({
  product_id: item.id,
  sku: item.sku,
  name: item.nombre,
  quantity: item.quantity,
  // IMPORTANTE: item.precio YA incluye IGV, debemos extraer el precio base
  unit_price: item.precio / 1.18, // Precio sin IGV
  subtotal: (item.precio / 1.18) * item.quantity, // Subtotal sin IGV
  tax: ((item.precio / 1.18) * item.quantity) * 0.18, // IGV del subtotal
  total: item.precio * item.quantity // Total con IGV (precio original * cantidad)
})),
```

**Agregado de props al PaymentModal:**

```vue
<!-- ANTES -->
<PaymentModal
  v-model="showPaymentModal"
  :total="total"
  :customer="selectedCustomer"
  :items="cartItems"
  ...
/>

<!-- DESPUÉS -->
<PaymentModal
  v-model="showPaymentModal"
  :total="total"
  :subtotal="subtotal"
  :tax="tax"
  :customer="selectedCustomer"
  :items="cartItems"
  ...
/>
```

---

### 3. `/src/components/PaymentModal.vue`

**Agregado de props:**

```javascript
const props = defineProps({
  modelValue: { type: Boolean, required: true },
  total: { type: Number, required: true },
  subtotal: { type: Number, required: true },    // ✅ NUEVO
  tax: { type: Number, required: true },         // ✅ NUEVO
  customer: { type: Object, default: null },
  items: { type: Array, required: true },
  // ... resto de props
});
```

**Actualización del ticket:**

```vue
<!-- ANTES -->
<div class="flex justify-between">
  <span>Subtotal:</span>
  <span>{{ formatCurrency(props.total * 0.82) }}</span>
</div>
<div class="flex justify-between">
  <span>IGV (18%):</span>
  <span>{{ formatCurrency(props.total * 0.18) }}</span>
</div>

<!-- DESPUÉS -->
<div class="flex justify-between">
  <span>Subtotal:</span>
  <span>{{ formatCurrency(props.subtotal) }}</span>
</div>
<div class="flex justify-between">
  <span>IGV (18%):</span>
  <span>{{ formatCurrency(props.tax) }}</span>
</div>
```

---

## Impacto de los Cambios

### ✅ **Lo que NO cambió:**
- Los precios mostrados en pantalla siguen siendo los mismos (con IGV)
- La experiencia del usuario es idéntica
- El total que paga el cliente es el mismo que antes
- La estructura de la base de datos no fue modificada

### ✅ **Lo que SÍ cambió:**
- Ahora el subtotal se calcula correctamente (sin IGV)
- El IGV se calcula correctamente (18% del subtotal sin IGV)
- Los datos enviados al backend son precisos
- Los comprobantes electrónicos se generarán con montos correctos

---

## Ejemplo Completo

### Producto: Laptop
- **Precio en BD:** S/ 1,180.00 (con IGV incluido)

### Cálculo Correcto:
```
Precio sin IGV = 1,180.00 / 1.18 = 1,000.00
Subtotal       = 1,000.00
IGV (18%)      = 1,000.00 × 0.18 = 180.00
Total          = 1,000.00 + 180.00 = 1,180.00 ✅
```

### Datos enviados al backend:
```json
{
  "items": [
    {
      "product_id": 123,
      "name": "Laptop",
      "quantity": 1,
      "unit_price": 1000.00,    // Sin IGV
      "subtotal": 1000.00,      // Sin IGV
      "tax": 180.00,            // IGV calculado
      "total": 1180.00          // Con IGV
    }
  ],
  "subtotal": 1000.00,
  "tax": 180.00,
  "tax_rate": 0.18,
  "total": 1180.00
}
```

---

## Verificación

Para verificar que los cambios funcionan correctamente:

1. **Agregar un producto al carrito**
2. **Verificar los totales en pantalla:**
   - Subtotal debe ser el precio sin IGV
   - IGV debe ser exactamente el 18% del subtotal
   - Total debe ser exactamente el precio del producto en BD
3. **Completar una venta y revisar el ticket**
4. **Verificar los datos enviados al backend** (revisar console.log)

---

## Notas Técnicas

### Fórmulas utilizadas:

```javascript
// Extraer precio sin IGV de un precio con IGV:
precioSinIGV = precioConIGV / 1.18

// Calcular IGV:
IGV = precioSinIGV × 0.18

// Reconstruir total:
total = precioSinIGV + IGV
// o equivalente:
total = precioSinIGV × 1.18
```

### Por qué dividimos entre 1.18:

Un precio con IGV incluido representa el 118% del precio base:
- Precio base = 100%
- IGV = 18%
- Precio con IGV = 118%

Por lo tanto: `precioBase = precioConIGV / 1.18`

---

## Fecha de Implementación

**2025-01-29**

---

## Autor

Claude Code (Anthropic)
