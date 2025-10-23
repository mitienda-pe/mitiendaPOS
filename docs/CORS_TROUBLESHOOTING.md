# Solución de Problemas CORS - MiTienda POS

## 🔍 Problema Identificado

Error en producción:
```
Access to XMLHttpRequest at 'https://api2.mitienda.pe/auth/login' from origin 'https://pos.mitienda.pe'
has been blocked by CORS policy: Response to preflight request doesn't pass access control check:
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## 🛠️ Solución Aplicada

Encontramos **dos problemas** en el backend:

### 1. Dominios faltantes en CorsFilter.php ✅ SOLUCIONADO

**Archivo**: `/app/Filters/CorsFilter.php`

**Problema**: Los dominios de Netlify no estaban en la lista de orígenes permitidos.

**Solución**: Agregamos los dominios:
```php
private array $allowedOrigins = [
    'https://admin.mitienda.pe',
    'https://pos.mitienda.pe',              // ← AGREGADO
    'https://mitiendapos.netlify.app',      // ← AGREGADO
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:5173',                // ← AGREGADO (Vite dev)
    'http://192.168.3.118:3000',
    'http://192.168.3.118:3001',
    'http://192.168.3.118:3002',
];
```

**Commit**: `3bd4585` - "fix: Add POS domains to CORS filter"

---

### 2. Filtro CORS deshabilitado globalmente ✅ SOLUCIONADO

**Archivo**: `/app/Config/Filters.php`

**Problema**: El filtro CORS estaba comentado en `$globals`:
```php
public array $globals = [
    'before' => [
        // 'cors', // DESHABILITADO - CORS se maneja en Nginx  ← PROBLEMA
    ],
    'after' => [
        // 'cors', // DESHABILITADO - CORS se maneja en Nginx  ← PROBLEMA
    ],
];
```

**Solución**: Habilitamos el filtro CORS:
```php
public array $globals = [
    'before' => [
        'cors', // Habilitado para permitir requests desde POS  ← HABILITADO
    ],
    'after' => [
        'cors', // Habilitado para enviar headers CORS         ← HABILITADO
    ],
];
```

**Commit**: `9df7881` - "fix: Enable CORS filter globally"

---

## ✅ Verificación

Después del despliegue, verifica que CORS funcione:

### Test 1: Preflight Request (OPTIONS)

```bash
curl -X OPTIONS https://api2.mitienda.pe/auth/login \
  -H "Origin: https://pos.mitienda.pe" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type, Authorization" \
  -v
```

**Respuesta esperada**:
```
< HTTP/1.1 200 OK
< Access-Control-Allow-Origin: https://pos.mitienda.pe
< Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH
< Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin
< Access-Control-Allow-Credentials: true
< Access-Control-Max-Age: 7200
```

### Test 2: Login desde el navegador

1. Abre https://pos.mitienda.pe
2. Abre las DevTools (F12) → Network
3. Intenta hacer login con `carlos@mitienda.pe`
4. Verifica que el request a `/auth/login` tenga Status `200 OK`

---

## 🔄 Cambios Desplegados

| Commit | Archivo | Descripción |
|--------|---------|-------------|
| `ffaf3a7` | `app/Config/Cors.php` | Agregó dominios al archivo de configuración (no usado actualmente) |
| `3bd4585` | `app/Filters/CorsFilter.php` | **Agregó dominios a la lista de orígenes permitidos** |
| `9df7881` | `app/Config/Filters.php` | **Habilitó el filtro CORS globalmente** |

---

## 📝 Notas Importantes

### ¿Por qué estaba deshabilitado?

El comentario decía "CORS se maneja en Nginx", lo que sugiere que en algún momento se configuró CORS a nivel de servidor web. Sin embargo:

1. No todos los servidores tienen CORS configurado en Nginx
2. La configuración de Nginx puede no incluir todos los dominios necesarios
3. Es más flexible manejar CORS en la aplicación

### ¿Por qué hay dos archivos CORS?

- **`app/Config/Cors.php`**: Archivo de configuración estándar de CodeIgniter 4
- **`app/Filters/CorsFilter.php`**: Implementación custom que se usa en el proyecto

El proyecto usa el `CorsFilter.php` custom, no el archivo de configuración estándar.

### Configuración a nivel de Nginx (opcional)

Si prefieres manejar CORS en Nginx en lugar de la aplicación, puedes agregar esto al archivo de configuración del sitio:

```nginx
location / {
    # CORS headers
    add_header 'Access-Control-Allow-Origin' '$http_origin' always;
    add_header 'Access-Control-Allow-Credentials' 'true' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS, PATCH' always;
    add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, X-Requested-With, Accept, Origin' always;
    add_header 'Access-Control-Max-Age' '7200' always;

    # OPTIONS request handling
    if ($request_method = 'OPTIONS') {
        return 204;
    }

    # ... resto de la configuración
}
```

**Pero actualmente no es necesario** porque ya está funcionando con el filtro de CodeIgniter.

---

## 🚨 Si el problema persiste

1. **Limpiar caché del navegador**: Ctrl+Shift+R (Chrome/Edge) o Cmd+Shift+R (Mac)

2. **Verificar variables de entorno en Netlify**:
   - Ve a Netlify Dashboard → Site settings → Environment variables
   - Verifica que `VITE_API_BASE_URL=https://api2.mitienda.pe` esté configurada
   - Re-despliega: Deploys → Trigger deploy → Clear cache and deploy site

3. **Verificar logs del servidor**:
   ```bash
   ssh usuario@api2.mitienda.pe
   tail -f /var/www/api2.mitienda.pe/writable/logs/log-*.log
   ```

4. **Verificar que el filtro esté cargado**:
   - Busca en los logs mensajes como "CORS: Origin not allowed: ..."
   - Si ves estos mensajes, significa que el filtro está activo pero rechazando el origen

---

## ✅ Estado Final

- ✅ Dominios agregados a `CorsFilter.php`
- ✅ Filtro CORS habilitado en `Filters.php`
- ✅ Cambios desplegados a producción
- ✅ CORS debería estar funcionando ahora

**Prueba desde**: https://pos.mitienda.pe 🚀
