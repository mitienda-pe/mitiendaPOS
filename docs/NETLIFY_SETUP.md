# Configuración de Netlify para MiTienda POS

## 🌐 Dominios Configurados
- **Producción**: https://pos.mitienda.pe
- **Netlify**: https://mitiendapos.netlify.app

---

## ⚙️ Variables de Entorno en Netlify

Para que el POS funcione correctamente en producción, debes configurar estas variables de entorno en Netlify:

### Paso 1: Ir a configuración del sitio

1. Accede a tu sitio en Netlify Dashboard
2. Ve a **Site settings** → **Environment variables**

### Paso 2: Agregar variables

Agrega las siguientes variables de entorno:

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `VITE_API_BASE_URL` | `https://api2.mitienda.pe` | URL del API de producción |
| `VITE_API_URL` | `https://api.apis.net.pe/` | API de APIS.net.pe (consultas RUC/DNI) |
| `VITE_APISNET_TOKEN` | `apis-token-5053.eYOF6IPjZ03SX34x8mfm0oJCtKG2d04a` | Token de APIS.net.pe |
| `VITE_DEFAULT_STORE_ID` | `10715` | ID de la tienda por defecto (opcional) |

### Paso 3: Re-desplegar

Después de agregar las variables de entorno, re-despliega el sitio para que los cambios surtan efecto:

1. Ve a **Deploys**
2. Click en **Trigger deploy** → **Deploy site**

---

## ✅ Verificación

Después del despliegue, verifica que:

1. **CORS está configurado**: Ya agregamos los dominios al backend
   - ✅ `https://pos.mitienda.pe`
   - ✅ `https://mitiendapos.netlify.app`

2. **Variables de entorno cargadas**: Abre la consola del navegador en producción y verifica:
   ```javascript
   // En la consola de https://pos.mitienda.pe
   console.log(import.meta.env.VITE_API_BASE_URL)
   // Debe mostrar: "https://api2.mitienda.pe"
   ```

3. **Login funciona**: Intenta hacer login con `carlos@mitienda.pe`

---

## 🔧 Build Settings en Netlify

Asegúrate de que la configuración de build sea:

- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node version**: 18 o superior

---

## 🚨 Troubleshooting

### Error: CORS bloqueado
- **Causa**: Las variables de entorno no están configuradas
- **Solución**: Verifica que `VITE_API_BASE_URL` esté configurada y re-despliega

### Error: Cannot read properties of undefined
- **Causa**: Variables de entorno no se cargaron en el build
- **Solución**:
  1. Limpia el caché de Netlify
  2. Re-despliega con "Clear cache and deploy site"

### Error 401 Unauthorized
- **Causa**: Token expirado o inválido
- **Solución**:
  1. Limpia localStorage del navegador
  2. Intenta hacer login nuevamente

---

## 📝 Notas Adicionales

- Las variables `VITE_*` solo se aplican en **build time**, no en runtime
- Cada vez que cambies una variable de entorno, debes re-desplegar
- El archivo `.env` es para desarrollo local, Netlify usa las variables configuradas en el dashboard
