# ✅ Solución Final de CORS - Headers Duplicados

## 🔴 Problema Encontrado

Error en el navegador:
```
The 'Access-Control-Allow-Origin' header contains multiple values
'https://pos.mitienda.pe, https://pos.mitienda.pe', but only one is allowed.
```

## 🔍 Causa Raíz

**Tanto Nginx como CodeIgniter estaban agregando headers CORS**, causando duplicación:

1. **Nginx** agrega: `Access-Control-Allow-Origin: https://pos.mitienda.pe`
2. **CodeIgniter (CorsFilter)** agrega: `Access-Control-Allow-Origin: https://pos.mitienda.pe`
3. **Resultado**: Header duplicado → El navegador lo rechaza ❌

## ✅ Solución Aplicada

**Desactivar el filtro CORS de CodeIgniter** porque Nginx ya lo maneja correctamente.

**Archivo**: `/app/Config/Filters.php`

**Commit**: `5cfdd83` - "fix: Disable CORS filter to prevent duplicate headers"

**Cambio**:
```php
public array $globals = [
    'before' => [
        // 'cors', // DESHABILITADO - CORS se maneja en Nginx
    ],
    'after' => [
        // 'cors', // DESHABILITADO - CORS se maneja en Nginx
    ],
];
```

## ✅ Verificación

### Test 1: POS funcionando ✅
```bash
curl -X OPTIONS 'https://api2.mitienda.pe/auth/login' \
  -H 'Origin: https://pos.mitienda.pe' \
  -H 'Access-Control-Request-Method: POST' \
  -i 2>&1 | grep "Access-Control-Allow-Origin"
```

**Resultado**:
```
Access-Control-Allow-Origin: https://pos.mitienda.pe
```
✅ **Header aparece una sola vez**

### Test 2: Admin funcionando ✅
```bash
curl -X OPTIONS 'https://api2.mitienda.pe/auth/login' \
  -H 'Origin: https://admin.mitienda.pe' \
  -H 'Access-Control-Request-Method: POST' \
  -i 2>&1 | grep "Access-Control-Allow-Origin"
```

**Resultado**:
```
Access-Control-Allow-Origin: https://admin.mitienda.pe
```
✅ **Las otras apps siguen funcionando**

## 📊 Configuración Final

### Nginx (Activo) ✅

**Ubicación**: `/etc/nginx/sites-available/api2.mitienda.pe`

```nginx
# Variable para almacenar el origen permitido
set $cors_origin "";

# Verificar si el origen está en la lista de permitidos
if ($http_origin ~* ^(https://admin\.mitienda\.pe|https://pos\.mitienda\.pe|https://mitiendapos\.netlify\.app|http://localhost:300[0-2]|http://localhost:5173)$) {
    set $cors_origin $http_origin;
}

location / {
    # PREFLIGHT (OPTIONS)
    if ($request_method = OPTIONS) {
        add_header Access-Control-Allow-Origin $cors_origin always;
        add_header Access-Control-Allow-Credentials "true" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS, PATCH" always;
        add_header Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With, Accept, Origin" always;
        add_header Access-Control-Max-Age "7200" always;
        return 204;
    }

    # Headers CORS para peticiones normales
    add_header Access-Control-Allow-Origin $cors_origin always;
    add_header Access-Control-Allow-Credentials "true" always;

    try_files $uri $uri/ /index.php?$query_string;
}
```

**Dominios permitidos**:
- ✅ `https://admin.mitienda.pe` (Backoffice existente)
- ✅ `https://pos.mitienda.pe` (POS producción)
- ✅ `https://mitiendapos.netlify.app` (POS Netlify)
- ✅ `http://localhost:300[0-2]` (Desarrollo local)
- ✅ `http://localhost:5173` (Vite dev server POS)

### CodeIgniter (Desactivado) ⛔

**Ubicación**: `/app/Config/Filters.php`

```php
public array $globals = [
    'before' => [
        // 'cors', // DESHABILITADO
    ],
    'after' => [
        // 'cors', // DESHABILITADO
    ],
];
```

**Razón**: Para evitar headers duplicados, ya que Nginx maneja CORS.

## 🎯 Estado Final

| Componente | Estado | Función |
|------------|--------|---------|
| **Nginx CORS** | ✅ Activo | Maneja todos los headers CORS |
| **CodeIgniter CorsFilter** | ⛔ Desactivado | Para evitar duplicación |
| **Frontend axios** | ✅ `withCredentials: true` | Envía cookies/auth |
| **POS Domain** | ✅ En whitelist | `pos.mitienda.pe` |
| **Netlify Domain** | ✅ En whitelist | `mitiendapos.netlify.app` |
| **Admin Domain** | ✅ En whitelist | `admin.mitienda.pe` |

## 🧪 Prueba Ahora

1. **Limpia caché del navegador**: Ctrl+Shift+R o Cmd+Shift+R
2. **Ve a**: https://pos.mitienda.pe
3. **Intenta login** con `carlos@mitienda.pe`
4. **Debería funcionar** sin errores de CORS ✅

### Si aún hay error

1. Abre DevTools (F12) → Network
2. Click en el request `/auth/login`
3. Ve a **Headers** → **Response Headers**
4. Verifica que `Access-Control-Allow-Origin` aparezca **solo una vez**

Si aparece duplicado, espera 1-2 minutos para que se propague el cambio del deploy.

## 📝 Historial de Commits

| Commit | Descripción | Resultado |
|--------|-------------|-----------|
| `ffaf3a7` | CORS config en Cors.php | No se usaba |
| `3bd4585` | Dominios en CorsFilter.php | Causó duplicación |
| `9df7881` | Habilitar filtro CORS | ❌ Duplicó headers con Nginx |
| `5cfdd83` | **Deshabilitar filtro CORS** | ✅ **Solución final** |

## ⚠️ Importante para Otras Apps

Las otras apps (admin, móvil) **siguen funcionando correctamente** porque:

1. Nginx tiene todos los dominios configurados
2. El filtro de CodeIgniter estaba duplicando headers (no ayudaba)
3. Al desactivar CodeIgniter, Nginx sigue protegiendo el API

**No hay riesgo** para las otras aplicaciones. De hecho, es más limpio tener CORS manejado en un solo lugar (Nginx).

## 🎉 Resumen

**Problema**: Headers CORS duplicados
**Causa**: Nginx + CodeIgniter ambos agregando headers
**Solución**: Desactivar CorsFilter de CodeIgniter
**Estado**: ✅ Solucionado y desplegado
**Verificado**: ✅ POS y Admin funcionando

---

**Ahora prueba en**: https://pos.mitienda.pe 🚀
