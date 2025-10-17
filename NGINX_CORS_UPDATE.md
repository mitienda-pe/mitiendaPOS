# Actualización CORS en Nginx

## 📝 Configuración Actual

Tu configuración de Nginx tiene:

```nginx
if ($http_origin ~* ^(https://admin\.mitienda\.pe|http://localhost:300[0-2])$) {
    set $cors_origin $http_origin;
}
```

## ✅ Configuración Actualizada

Necesitas agregar los dominios del POS al regex:

```nginx
# Verificar si el origen está en la lista de permitidos
if ($http_origin ~* ^(https://admin\.mitienda\.pe|https://pos\.mitienda\.pe|https://mitiendapos\.netlify\.app|http://localhost:300[0-2]|http://localhost:5173)$) {
    set $cors_origin $http_origin;
}
```

## 🔧 Cambios Detallados

**Regex antes**:
```
^(https://admin\.mitienda\.pe|http://localhost:300[0-2])$
```

**Regex después**:
```
^(https://admin\.mitienda\.pe|https://pos\.mitienda\.pe|https://mitiendapos\.netlify\.app|http://localhost:300[0-2]|http://localhost:5173)$
```

**Nuevos dominios agregados**:
- `https://pos\.mitienda\.pe` - POS en producción
- `https://mitiendapos\.netlify\.app` - Deployment de Netlify
- `http://localhost:5173` - Vite dev server

## 📋 Pasos para Actualizar

### 1. Conectarse al servidor

```bash
ssh usuario@api2.mitienda.pe
```

### 2. Editar configuración de Nginx

```bash
sudo nano /etc/nginx/sites-available/api2.mitienda.pe
# o el archivo que corresponda
```

### 3. Buscar la línea con `if ($http_origin ~*`

Debería estar cerca de:
```nginx
location / {
    # ... otras configuraciones ...

    # Verificar si el origen está en la lista de permitidos
    if ($http_origin ~* ^(https://admin\.mitienda\.pe|http://localhost:300[0-2])$) {
        set $cors_origin $http_origin;
    }

    # ... resto de la configuración CORS ...
}
```

### 4. Reemplazar con la nueva configuración

```nginx
location / {
    # ... otras configuraciones ...

    # Verificar si el origen está en la lista de permitidos
    if ($http_origin ~* ^(https://admin\.mitienda\.pe|https://pos\.mitienda\.pe|https://mitiendapos\.netlify\.app|http://localhost:300[0-2]|http://localhost:5173)$) {
        set $cors_origin $http_origin;
    }

    # ... resto de la configuración CORS ...
}
```

### 5. Verificar sintaxis de Nginx

```bash
sudo nginx -t
```

**Salida esperada**:
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### 6. Recargar Nginx

```bash
sudo systemctl reload nginx
# o
sudo service nginx reload
```

## 🧪 Verificar que Funciona

### Test 1: Curl desde tu máquina local

```bash
curl -X OPTIONS https://api2.mitienda.pe/auth/login \
  -H "Origin: https://pos.mitienda.pe" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type, Authorization" \
  -v 2>&1 | grep -i "access-control"
```

**Debe mostrar**:
```
< Access-Control-Allow-Origin: https://pos.mitienda.pe
< Access-Control-Allow-Credentials: true
< Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH
< Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin
```

### Test 2: Desde el navegador

1. Abre https://pos.mitienda.pe
2. Abre DevTools (F12) → Network
3. Intenta hacer login
4. Verifica que **NO** haya errores de CORS

## 📝 Configuración Completa de Nginx (Referencia)

Tu configuración completa debería verse algo así:

```nginx
server {
    listen 443 ssl http2;
    server_name api2.mitienda.pe;

    # ... certificados SSL ...

    root /var/www/api2.mitienda.pe/public;
    index index.php;

    location / {
        # Verificar si el origen está en la lista de permitidos
        if ($http_origin ~* ^(https://admin\.mitienda\.pe|https://pos\.mitienda\.pe|https://mitiendapos\.netlify\.app|http://localhost:300[0-2]|http://localhost:5173)$) {
            set $cors_origin $http_origin;
        }

        # CORS headers
        add_header 'Access-Control-Allow-Origin' $cors_origin always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS, PATCH' always;
        add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, X-Requested-With, Accept, Origin' always;
        add_header 'Access-Control-Max-Age' '7200' always;

        # OPTIONS request (preflight)
        if ($request_method = 'OPTIONS') {
            return 204;
        }

        # Try to serve file directly, fallback to index.php
        try_files $uri $uri/ /index.php?$query_string;
    }

    # PHP handling
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;  # o la versión que uses
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }

    # ... resto de la configuración ...
}
```

## ⚠️ Importante

- **Siempre hacer backup** de la configuración antes de editar:
  ```bash
  sudo cp /etc/nginx/sites-available/api2.mitienda.pe /etc/nginx/sites-available/api2.mitienda.pe.backup
  ```

- **Siempre verificar** la sintaxis con `sudo nginx -t` antes de recargar

- Si algo sale mal, puedes restaurar el backup:
  ```bash
  sudo cp /etc/nginx/sites-available/api2.mitienda.pe.backup /etc/nginx/sites-available/api2.mitienda.pe
  sudo systemctl reload nginx
  ```

## 🎯 Resumen

1. ✅ Ya habilitamos CORS en CodeIgniter (`CorsFilter.php` y `Filters.php`)
2. ⏳ Ahora necesitas actualizar la configuración de Nginx
3. 🔄 Reload Nginx
4. ✅ CORS funcionará desde `pos.mitienda.pe` y `mitiendapos.netlify.app`

**Regex a actualizar**:
```nginx
# ANTES
if ($http_origin ~* ^(https://admin\.mitienda\.pe|http://localhost:300[0-2])$) {

# DESPUÉS
if ($http_origin ~* ^(https://admin\.mitienda\.pe|https://pos\.mitienda\.pe|https://mitiendapos\.netlify\.app|http://localhost:300[0-2]|http://localhost:5173)$) {
```
