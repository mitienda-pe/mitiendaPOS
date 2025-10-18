# 🔍 Testing del Selector de Tienda

## Script para Consola del Navegador

Después de hacer login en el POS, abre la consola (F12) y ejecuta:

### 1. Ver tiendas disponibles

```javascript
// Usando el store de Pinia
const authStore = window.$pinia?.state?.value?.auth
console.table(authStore?.stores)
```

### 2. Cambiar de tienda manualmente

```javascript
// Opción 1: Usando fetch directo
const cambiarTienda = async (storeId) => {
  const token = localStorage.getItem('access_token')

  const response = await fetch('/api/user/store/select', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ store_id: storeId })
  })

  const data = await response.json()

  if (data.success) {
    console.log('✅ Tienda cambiada:', data.data)
    localStorage.setItem('access_token', data.data.access_token)

    // Actualizar tienda seleccionada en localStorage
    const stores = JSON.parse(localStorage.getItem('stores') || '[]')
    const store = stores.find(s => s.id === storeId)
    if (store) {
      localStorage.setItem('selected_store', JSON.stringify(store))
    }

    console.log('🔄 Recargando página...')
    setTimeout(() => location.reload(), 1000)
  } else {
    console.error('❌ Error:', data)
  }
}

// Usar así:
cambiarTienda(265)  // Reemplaza 265 con el ID de tu tienda
```

### 3. Ver el token actual (decodificado)

```javascript
// Función para decodificar JWT
const decodeJWT = (token) => {
  const base64Url = token.split('.')[1]
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
  const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
  }).join(''))

  return JSON.parse(jsonPayload)
}

// Ver el token actual
const token = localStorage.getItem('access_token')
if (token) {
  const payload = decodeJWT(token)
  console.log('🎫 Token actual:', payload)
  console.log('📍 Tienda en el token:', payload.tienda_id || payload.store_id)
} else {
  console.log('❌ No hay token')
}
```

## 📝 Solución Permanente: Selector de Tiendas UI

Vamos a crear un componente para seleccionar tiendas visualmente, como en el admin.

### Pasos necesarios:

1. **Crear StoreSelector component**
2. **Agregar ruta `/stores` para selección**
3. **Redireccionar después del login si hay múltiples tiendas**
4. **Permitir cambiar de tienda desde el menú**

¿Quieres que implemente el selector visual ahora?
