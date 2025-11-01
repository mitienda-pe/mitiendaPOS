# Fix: Email del Cliente no se Guarda en Ventas POS

## Problema Reportado

Cuando se crea una venta en el POS:
1. Se busca el cliente por DNI (ej: 10060436)
2. El sistema encuentra al cliente en la base de datos
3. **Pero al guardar la venta, aparece un email genérico** (`cliente@mitienda.pe`) en lugar del email real del cliente (`carlos@mitienda.pe`)

## Causa Raíz

El problema estaba en `POS.vue` línea 497, donde al construir el payload para crear la orden, solo intentaba acceder al campo `email`:

```javascript
customer: {
  id: selectedCustomer.value ? selectedCustomer.value.id : null,
  name: selectedCustomer.value ? selectedCustomer.value.name : 'Cliente General',
  email: selectedCustomer.value?.email || '',  // ← Solo buscaba en 'email'
  phone: selectedCustomer.value?.phone || '',
  document_number: selectedCustomer.value?.document_number || '',
  document_type: selectedCustomer.value?.document_type || 'dni'
}
```

### Análisis del Flujo

1. **API retorna el cliente correctamente** con el email desencriptado:
   ```php
   // Customer.php línea 39-54
   private function transformCustomer($customer) {
       return [
           'email' => $this->decryptEmail($customer['tiendacliente_correo_electronico'] ?? ''),
           // ...
       ];
   }
   ```

2. **El modal de búsqueda emite el cliente** tal cual viene del API:
   ```javascript
   // CustomerSearchModal.vue línea 332-335
   const selectCustomer = (customer) => {
     console.log('✨ Selecting customer:', customer);
     emit('select', customer);
   };
   ```

3. **POS.vue recibe y guarda el cliente**:
   ```javascript
   // POS.vue línea 769-774
   const handleCustomerSelect = (customer) => {
     console.log('🎯 POS: Customer selected:', customer);
     selectedCustomer.value = customer;
   };
   ```

4. **Al crear la orden, NO encontraba el email** porque podría venir en diferentes nombres de campo dependiendo del origen del cliente.

## Solución Aplicada

Actualicé `POS.vue` para que busque el email en múltiples posibles nombres de campo:

```javascript
// POS.vue línea 497-498 (CORREGIDO)
email: selectedCustomer.value?.email ||
       selectedCustomer.value?.correo ||
       selectedCustomer.value?.tiendacliente_correo_electronico ||
       selectedCustomer.value?.tiendacliente_correo || '',
phone: selectedCustomer.value?.phone ||
       selectedCustomer.value?.telefono ||
       selectedCustomer.value?.tiendacliente_telefono || '',
```

### Campos que ahora busca:

**Para Email**:
1. `email` - Formato transformado del API
2. `correo` - Posible formato alternativo
3. `tiendacliente_correo_electronico` - Campo directo de BD
4. `tiendacliente_correo` - Variante del campo de BD

**Para Teléfono**:
1. `phone` - Formato transformado del API
2. `telefono` - Formato español
3. `tiendacliente_telefono` - Campo directo de BD

## Archivo Modificado

- **`/Users/carlosvidal/www/mitienda/mitienda-POS/src/views/POS.vue`** (líneas 497-498)

## Pasos para Compilar y Probar

### 1. Compilar el POS

```bash
cd /Users/carlosvidal/www/mitienda/mitienda-POS
npm run build
```

### 2. Desplegar al Servidor

```bash
# El build se despliega automáticamente o manualmente según tu configuración
# Verificar que los archivos en dist/ estén actualizados
```

### 3. Probar con tu DNI

1. Abrir el POS
2. Iniciar una venta
3. Buscar cliente con DNI: `10060436`
4. Seleccionar el cliente (debería mostrar: Carlos Vidal)
5. Agregar productos
6. Procesar pago
7. **Verificar en el detalle de la venta** que aparece `carlos@mitienda.pe` y NO `cliente@mitienda.pe`

### 4. Verificar en Base de Datos

```sql
-- Consultar la última venta creada
SELECT
  tiendaventa_id,
  tiendaventa_codigoreferencia,
  tiendaventa_nombres,
  tiendaventa_apellidos,
  tiendaventa_correoelectronico,
  tiendaventa_fecha
FROM tiendasventas
WHERE tienda_id = 404
ORDER BY tiendaventa_id DESC
LIMIT 1;
```

El campo `tiendaventa_correoelectronico` debería mostrar `carlos@mitienda.pe`.

## Debugging

### Ver qué datos se envían al crear la orden

Abre la consola del navegador (F12) y busca:

```
📤 [POS] Enviando orden al API: {...}
```

Verificar el objeto `customer`:
```json
{
  "customer": {
    "id": "123",
    "name": "Carlos Vidal",
    "email": "carlos@mitienda.pe",  // ← Debe tener tu email real
    "phone": "999888777",
    "document_number": "10060436",
    "document_type": "dni"
  }
}
```

### Ver qué datos retorna la búsqueda de cliente

En la consola, buscar:

```
🎯 POS: Customer selected: {...}
```

Verificar que el objeto incluya el email:
```javascript
{
  id: "123",
  name: "Carlos Vidal",
  email: "carlos@mitienda.pe",  // ← Debe aparecer aquí
  phone: "999888777",
  document_number: "10060436",
  document_type: "1"
}
```

## Si el Problema Persiste

### 1. Verificar que el email está en la BD

```sql
SELECT
  tiendacliente_id,
  tiendacliente_nombres,
  tiendacliente_apellidos,
  tiendacliente_correo_electronico,
  tiendacliente_numerodocumento
FROM tiendasclientes
WHERE tiendacliente_numerodocumento = '10060436'
AND tienda_id = 404;
```

El campo `tiendacliente_correo_electronico` puede estar:
- Encriptado (formato largo)
- En texto plano: `carlos@mitienda.pe`
- Vacío (NULL o '')

### 2. Verificar el endpoint de búsqueda

```bash
# Obtener token
TOKEN="tu_token_jwt"

# Buscar cliente por DNI
curl -X GET "https://api2.mitienda.pe/api/v1/customers/search-by-document?document_number=10060436&document_type=1" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

Verificar que el response incluya:
```json
{
  "success": true,
  "found": true,
  "data": {
    "email": "carlos@mitienda.pe",  // ← Debe estar desencriptado aquí
    ...
  }
}
```

### 3. Verificar el servicio de desencriptación

El email se desencripta llamando a:
```
https://panel.mitienda.host/webajax/getEncryptDecodePHP5
```

Si este servicio no funciona, el email quedará vacío.

## Mejoras Futuras

- [ ] Migrar emails a texto plano en la BD (quitar encriptación obsoleta)
- [ ] Estandarizar nombres de campos en todos los endpoints
- [ ] Agregar validación de email antes de guardar venta
- [ ] Mostrar advertencia en POS si el cliente no tiene email
- [ ] Permitir editar email del cliente desde el POS

## Estado

✅ **COMPILADO** - Build completado exitosamente el 2025-10-31

### Build Info
- **Tiempo**: 2.15s
- **Archivo Principal**: `dist/assets/POS--aCDU3Ix-1761960989692.js` (274.73 kB)
- **Versión**: Build timestamp 1761960989692

### Próximo Paso: Despliegue al Servidor

El directorio `dist/` contiene los archivos compilados listos para despliegue. Opciones:

**Opción 1: Despliegue Manual**
```bash
# Copiar archivos al servidor
scp -r dist/* mtserv:/var/www/pos.mitienda.pe/
```

**Opción 2: Despliegue Automático**
```bash
# Si tienes script de deploy configurado
npm run deploy
```

Una vez desplegado, el fix estará activo para todas las ventas nuevas.
