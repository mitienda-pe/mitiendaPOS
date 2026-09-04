# Despliegue del POS

- **Producción**: <https://pos.mitienda.pe>
- **Plataforma**: Cloudflare Pages, proyecto `mitienda-pos`

> Este documento describía un despliegue en Netlify que ya no existe. El POS se
> despliega en Cloudflare Pages desde `.github/workflows/deploy.yml`.

## Cómo se despliega

`git push origin main` dispara el workflow, que hace `pnpm run build` y luego
`wrangler pages deploy dist --project-name=mitienda-pos --branch=main`.

No hay despliegue manual: no editar en el servidor, no subir `dist/` a mano.

Antes de desplegar cambios relevantes, bumpear la versión — el número alimenta
el aviso de "hay versión nueva" (ver la sección de versionado en `CLAUDE.md`).
Cada despliegue muestra ese banner a todos los cajeros con sesión abierta, así
que conviene evitar las horas punta.

## Variables

Se inyectan en el build desde GitHub Actions (Settings → Secrets and variables →
Actions), no desde un panel de la plataforma de hosting:

| Variable | Dónde | Descripción |
|----------|-------|-------------|
| `VITE_API_BASE_URL` | Variables | API de producción (`apiClient`) |
| `VITE_API_URL` | Variables | Instancia axios heredada |
| `VITE_APISNET_TOKEN` | **Secrets** | Token de APIS.net.pe (consultas RUC/DNI) |
| `VITE_DEFAULT_STORE_ID` | Variables | Tienda por defecto (opcional) |
| `VITE_USE_MEILI_SEARCH` | Variables | Activa la búsqueda por MeiliSearch |

Ojo: son variables `VITE_*`, o sea que **quedan embebidas en el bundle público**.
`VITE_APISNET_TOKEN` va como secret de Actions para no tenerlo en el repo, pero
es visible para cualquiera que abra el JS en producción; tratarlo como token de
cliente, con las restricciones de uso puestas del lado de APIS.net.pe.

## Cabeceras y rutas

- `public/_headers` — CSP, HSTS y política de caché. Ampliar la CSP solo con
  motivo: es la app que procesa cobros.
- `public/_redirects` — fallback SPA (`/* /index.html 200`).
- `public/version.json` — lo genera el build (gitignored); es la sonda del aviso
  de versión nueva y se sirve con `no-store`.

## Verificación tras desplegar

1. `https://pos.mitienda.pe/` muestra la pantalla de bienvenida sin sesión.
2. Con sesión abierta, esa misma URL cae en `/menu`.
3. Login de cajero (ID de tienda + PIN) y login de administrador funcionan.
4. `https://pos.mitienda.pe/version.json` responde con el build recién subido.

## Problemas frecuentes

**CORS bloqueado.** El dominio debe estar en la allowlist del backend, y
`VITE_API_BASE_URL` bien puesta en el build.

**Un cambio no aparece.** `index.html` se sirve `no-cache` y los assets llevan
hash, así que no suele ser caché: revisar que el workflow haya terminado en
verde.

**401 al usar la app.** Token expirado; `src/services/axios.js` maneja el
refresh. Si persiste, revisar el refresh token en `localStorage`.
