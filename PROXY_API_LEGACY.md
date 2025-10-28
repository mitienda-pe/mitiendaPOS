# Proxy al API Legacy - Guía de Uso

## Contexto

Debido al cronograma ajustado del proyecto, se implementó un sistema de **proxy al API legacy** que permite usar temporalmente el endpoint de creación de órdenes del API antiguo mientras se finaliza el desarrollo del endpoint nativo.

## Arquitectura

```
POS (Vue.js)
    ↓ JWT Auth
API Nuevo (PHP 8.4 / CI4)
    ↓ Proxy con Token Legacy
API Legacy (PHP 7.x / CI3)
```

### Ventajas de este enfoque:

✅ **Seguridad**: El token del API legacy nunca se expone en el frontend
✅ **Transparencia**: El POS usa el mismo formato moderno
✅ **Migración suave**: Cuando el endpoint nativo esté listo, solo hay que cambiar una línea
✅ **Control**: Logging centralizado y manejo de errores

## Endpoints Implementados

### 1. GET `/api/v1/auth/legacy-token`

Obtiene el token del API legacy para la tienda autenticada.

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
```

**Respuesta:**
```json
{
  "error": 0,
  "data": {
    "legacy_token": "ciN6MhIr9MLpufJ1CegMWSAPiTAwAtX3",
    "api_base_url": "https://api.mitienda.pe/v1"
  }
}
```

⚠️ **Nota**: Este endpoint existe pero **NO debes usarlo directamente**. Usa el proxy completo.

---

### 2. POST `/api/v1/orders/legacy` ✅ (RECOMENDADO)

Crea una orden a través del proxy al API legacy.

**Endpoint Legacy**: `POST https://api.mitienda.pe/v1/order/order_pos`

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**Payload** (Formato POS Moderno - se transforma automáticamente):
```json
{
  "items": [
    {
      "product_id": 303492,
      "quantity": 2,
      "unit_price": 25.50,
      "name": "Producto A",
      "sku": "SKU-001"
    }
  ],
  "customer": {
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "phone": "999999999",
    "document_number": "12345678"
  },
  "document_type": "boleta",
  "payments": [
    {
      "method": "cash",
      "amount": 51.00
    }
  ],
  "notes": "Orden desde POS"
}
```

**O también acepta** (Formato Legacy Directo):
```json
{
  "tienda_id": "12965",
  "tiendacliente_id": "",
  "facturacionClienteNombre": "Juan",
  "facturacionClienteApellido": "Pérez",
  "cart": [
    {
      "id": "303492",
      "txtICantidad": "2",
      "tienda_id": "12965"
    }
  ],
  "pasarela_id": "4"
}
```

**Respuesta Exitosa:**
```json
{
  // Respuesta del API legacy (varía según su implementación)
  "error": 0,
  "message": "Orden creada exitosamente",
  "order_id": 12345
}
```

## Uso desde el POS

### Código Actual (Ya Implementado)

El servicio `ordersApi.js` ya está configurado para usar el proxy:

```javascript
import { ordersApi } from '@/services/ordersApi'

// Crear orden - usa automáticamente el proxy legacy
const result = await ordersApi.createOrder({
  items: [...],
  customer: {...},
  payments: [...]
})
```

### Cuando el Endpoint Nativo esté Listo

Solo cambiar en `ordersApi.js`:

```javascript
async createOrder(orderData) {
  // Cambiar de /orders/legacy a /orders/pos
  const response = await apiClient.post('/orders/pos', orderData);
  return response.data;
}
```

## Transformación Automática de Datos

El proxy incluye un **transformer inteligente** que detecta el formato del payload:

### Si envías formato POS moderno:
- ✅ Detecta automáticamente por la presencia de `items` (no `cart`)
- ✅ Transforma a formato legacy
- ✅ Mapea tipos de documento (dni → 1, ruc → 6)
- ✅ Mapea métodos de pago (cash → 4, yape → 12)
- ✅ Separa nombre y apellido
- ✅ Configura valores por defecto para campos requeridos

### Si envías formato legacy directo:
- ✅ Detecta automáticamente por la presencia de `cart` (no `items`)
- ✅ Envía sin modificar al API legacy

## Mapeos Importantes

### Tipos de Documento
```
dni      → 1
ruc      → 6
ce       → 4
passport → 7
```

### Métodos de Pago (pasarela_id)
```
cash     → 4  (Pago Contra Entrega)
card     → 2  (Culqi)
transfer → 5  (Depósito/Transferencia)
yape     → 12 (Yape)
plin     → 10 (Plin)
```

### Modo de Entrega
```
0 → Recojo en tienda (POS)
1 → Delivery a domicilio
```

## Estado del Desarrollo

### ✅ Completado (Proxy Legacy)
- Endpoint GET `/api/v1/auth/legacy-token`
- Endpoint POST `/api/v1/orders/legacy` con transformer
- Integración en `ordersApi.js`
- Logging y manejo de errores

### 🚧 En Desarrollo (Endpoint Nativo)
- Endpoint POST `/api/v1/orders/pos`
- Validación completa de inventario
- Integración con sistema de facturación
- Optimización de performance

## Migración Futura

Cuando el endpoint nativo esté listo:

1. **Fase 1**: Pruebas en paralelo
   ```javascript
   // Probar el nativo sin afectar producción
   const resultNative = await ordersApi.createOrderNative(orderData)
   ```

2. **Fase 2**: Switch gradual (feature flag)
   ```javascript
   const endpoint = useNativeAPI ? '/orders/pos' : '/orders/legacy'
   ```

3. **Fase 3**: Switch completo
   ```javascript
   // Simplemente cambiar la URL en createOrder()
   ```

4. **Fase 4**: Deprecar proxy
   - Eliminar `/orders/legacy`
   - Eliminar `/auth/legacy-token`
   - Actualizar documentación

## Logs y Debugging

Los logs del proxy se encuentran en:
```
/var/www/api2.mitienda.pe/writable/logs/
```

Buscar por:
```bash
grep "Legacy API proxy" log-*.log
```

Ejemplos de logs:
```
[INFO] Legacy API proxy - Payload already in legacy format
[INFO] Legacy API proxy - Transforming POS format to legacy format
[INFO] Legacy API proxy - Store: 404, Status: 200
[ERROR] Legacy API error - Status: 400, Body: {...}
```

## Soporte

Si hay problemas con el proxy:

1. Verificar que el token legacy existe en la BD
2. Revisar los logs del API nuevo
3. Verificar conectividad con `https://api.mitienda.pe`
4. Confirmar que el formato del payload es correcto

## Referencias

- **Código del Proxy**: `mitienda-api-ci4/app/Controllers/V1/Order.php:301`
- **Transformer**: `mitienda-api-ci4/app/Controllers/V1/Order.php:378`
- **Rutas**: `mitienda-api-ci4/app/Config/Routes.php:251`
- **Cliente POS**: `mitienda-POS/src/services/ordersApi.js`
- **Ejemplo Payload Legacy**: `mitienda-POS/json_prueba_convertido.json`

---

**Última actualización**: 2025-10-28
**Estado**: ✅ En producción (temporal)
