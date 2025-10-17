# Integración con API MiTienda

Este documento describe la integración del sistema MiTiendaPOS con el API de MiTienda (https://api2.mitienda.pe).

## Configuración

### Variables de Entorno

Asegúrate de configurar la variable de entorno en el archivo `.env`:

```env
VITE_API_BASE_URL=https://api2.mitienda.pe
```

## Estructura de Servicios

### 1. Axios Client (`src/services/axios.js`)

Cliente HTTP configurado con:
- **Base URL**: `https://api2.mitienda.pe`
- **Timeout**: 30 segundos
- **Headers por defecto**: `Content-Type: application/json`

#### Interceptores

**Request Interceptor:**
- Agrega automáticamente el token JWT (`Bearer ${access_token}`) a todas las peticiones

**Response Interceptor:**
- Normaliza las respuestas del API de `{ error: 0, message, data }` a `{ success: true, message, data }`
- Maneja renovación automática de tokens cuando expiran (error 401)
- Redirige a login si la renovación falla

### 2. Auth API (`src/services/authApi.js`)

Endpoints de autenticación:

#### `login(credentials)`
- **Endpoint**: `POST /auth/login`
- **Payload**: `{ email, password }`
- **Response**: `{ access_token, refresh_token, user }`

#### `refresh(refreshToken)`
- **Endpoint**: `POST /auth/refresh`
- **Payload**: `{ refresh_token }`
- **Response**: `{ access_token, refresh_token }`

#### `logout()`
- **Endpoint**: `POST /auth/logout`
- Invalida el token actual

#### `getProfile()`
- **Endpoint**: `GET /api/v1/user/profile`
- **Response**: Datos del usuario autenticado

#### `getStores()`
- **Endpoint**: `GET /api/v1/user/stores`
- **Response**: Lista de tiendas del usuario
- Normaliza el formato de respuesta a:
  ```js
  {
    id, name, slug, logo, url, plan, status
  }
  ```

#### `selectStore(storeId)`
- **Endpoint**: `POST /api/v1/user/store/select`
- **Payload**: `{ store_id }`
- **Response**: `{ access_token }` - Nuevo token con permisos de tienda

### 3. Products API (`src/services/productsApi.js`)

Endpoints de productos para el módulo POS:

#### `getProducts(filters)`
- **Endpoint**: `GET /api/v1/products`
- **Filtros disponibles**:
  - `page`: Número de página
  - `limit`: Productos por página
  - `search`: Búsqueda por nombre/SKU
  - `category_id`: Filtrar por categoría
  - `brand_id`: Filtrar por marca
  - `published`: Filtrar por estado de publicación
  - `stock_status`: `all`, `in_stock`, `limited`, `out_of_stock`
- **Response**: Array de productos normalizado con metadata de paginación

#### `getProduct(id)`
- **Endpoint**: `GET /api/v1/products/{id}`
- **Response**: Detalle completo del producto

#### `updateStock(id, newStock)`
- **Endpoint**: `PUT /api/v1/products/{id}`
- **Payload**: `{ stock: newStock }`
- Actualiza el stock de un producto (usado al realizar ventas)

#### `searchByCode(code)`
- **Endpoint**: `GET /api/v1/products?search={code}`
- Busca productos por código de barras o SKU
- Retorna el primer resultado encontrado

## Store de Autenticación (`src/stores/auth.js`)

### State
```js
{
  user: Object,           // Datos del usuario
  accessToken: String,    // Token JWT de acceso
  refreshToken: String,   // Token para renovación
  selectedStore: Object,  // Tienda actualmente seleccionada
  stores: Array,          // Lista de tiendas del usuario
  loading: Boolean,
  error: String
}
```

### Getters
- `isAuthenticated`: Verifica si el usuario está autenticado
- `userRole`: Retorna el rol del usuario
- `hasSelectedStore`: Verifica si hay una tienda seleccionada

### Actions

#### `login(email, password)`
1. Autentica al usuario
2. Guarda tokens en localStorage
3. Obtiene las tiendas del usuario
4. Si solo tiene 1 tienda, la selecciona automáticamente
5. Redirige al menú principal

#### `selectStore(storeId)`
- Selecciona una tienda y obtiene un nuevo token con permisos
- Guarda la tienda seleccionada en localStorage

#### `logout()`
- Cierra sesión en el servidor
- Limpia todos los datos de localStorage
- Redirige a login

#### `checkSession()`
- Verifica si hay una sesión activa
- Restaura los datos del usuario y tiendas
- Usado al recargar la página

## Flujo de Autenticación

### Login
```
1. Usuario ingresa email y password
2. Login → POST /auth/login
3. Guardar access_token, refresh_token
4. Obtener tiendas → GET /api/v1/user/stores
5. Si solo hay 1 tienda → selectStore()
6. Redirigir a /menu
```

### Selección de Tienda
```
1. Usuario selecciona tienda (si tiene múltiples)
2. selectStore(storeId) → POST /api/v1/user/store/select
3. Actualizar access_token con permisos de tienda
4. Guardar selected_store en localStorage
```

### Renovación de Token
```
1. Petición falla con 401 Unauthorized
2. Interceptor detecta error
3. POST /auth/refresh con refresh_token
4. Actualizar access_token
5. Reintentar petición original
6. Si falla → Logout y redirigir a login
```

## Cambios en el Componente Login

### Antes (Mock)
```js
<input type="text" placeholder="Usuario" v-model="username" />
await authStore.login(username, password)
```

### Después (API Real)
```js
<input type="email" placeholder="Email" v-model="email" />
await authStore.login(email, password)
```

## Próximos Pasos

### Implementaciones Pendientes

1. **Integrar productos en el módulo POS**
   - Reemplazar productos mock por `productsApi.getProducts()`
   - Implementar búsqueda por código de barras con `searchByCode()`
   - Actualizar stock al realizar ventas con `updateStock()`

2. **Crear servicio de ventas (Orders API)**
   - Endpoint para crear órdenes/ventas
   - Historial de ventas
   - Detalles de venta

3. **Crear servicio de clientes**
   - CRUD de clientes
   - Búsqueda de clientes para el POS

4. **Manejo de errores mejorado**
   - Toast notifications para errores
   - Validaciones específicas por campo

5. **Selector de tienda**
   - Modal para seleccionar tienda si el usuario tiene múltiples
   - Cambiar de tienda sin cerrar sesión

## Notas Importantes

- **Tokens**: Se almacenan en `localStorage` como `access_token` y `refresh_token`
- **Renovación automática**: El interceptor maneja la renovación sin intervención del usuario
- **Formato de respuesta**: El API usa `{ error: 0 }` para éxito, normalizado a `{ success: true }`
- **Permisos por tienda**: Después de login, se debe seleccionar una tienda para obtener permisos específicos

## Testing

Para probar la integración:

1. Asegúrate de tener credenciales válidas en https://api2.mitienda.pe
2. Configura el `.env` con `VITE_API_BASE_URL=https://api2.mitienda.pe`
3. Ejecuta `npm run dev`
4. Intenta hacer login con email y password reales
5. Verifica en las DevTools → Network que las peticiones se hacen correctamente
