# 🏪 Cambiar de Tienda para Testing

## 🎯 Opción 1: Variable de Entorno (Recomendado)

### Para desarrollo local:

1. **Edita el archivo `.env`**:
   ```bash
   nano .env
   ```

2. **Cambia el valor de `VITE_DEFAULT_STORE_ID`**:
   ```env
   # Tienda de producción
   VITE_DEFAULT_STORE_ID=10715

   # O cambia a tu tienda de testing
   VITE_DEFAULT_STORE_ID=12345
   ```

3. **Reinicia el servidor de desarrollo**:
   ```bash
   npm run dev
   ```

4. **Haz login nuevamente** para que se aplique la nueva tienda

---

### Para producción (Netlify):

1. Ve a **Netlify Dashboard** → Site settings → Environment variables
2. Edita `VITE_DEFAULT_STORE_ID` con el nuevo ID
3. Re-despliega: Deploys → Trigger deploy → Deploy site

---

## 🎯 Opción 2: No Configurar Tienda por Defecto

Si **comentas o eliminas** `VITE_DEFAULT_STORE_ID` del `.env`:

```env
# VITE_DEFAULT_STORE_ID=10715
```

**Comportamiento**:
- Si el usuario tiene **solo una tienda** → Se selecciona automáticamente
- Si el usuario tiene **múltiples tiendas** → No se selecciona ninguna automáticamente

Esto te permite probar el flujo cuando el usuario debe seleccionar una tienda manualmente.

---

## 🎯 Opción 3: Cambiar Manualmente en localStorage

Para cambiar de tienda sin reiniciar la app:

1. **Abre la consola del navegador** (F12)
2. **Ejecuta**:
   ```javascript
   // Ver tiendas disponibles
   console.log(JSON.parse(localStorage.getItem('user')))

   // Cambiar a otra tienda (reemplaza 12345 con el ID real)
   localStorage.setItem('selected_store', JSON.stringify({id: 12345, name: 'Mi Tienda Test'}))

   // Recargar la página
   location.reload()
   ```

---

## 🏪 Crear Tienda de Testing

Si necesitas crear una tienda de prueba en la base de datos:

```sql
-- Conectarse a la base de datos
mysql -u usuario -p nombre_db

-- Crear tienda de testing
INSERT INTO tiendas (
    tienda_nombre,
    tienda_descripcion,
    tienda_activo,
    tienda_fecha
) VALUES (
    'Tienda de Testing POS',
    'Tienda ficticia para pruebas del sistema POS',
    1,
    NOW()
);

-- Obtener el ID de la tienda creada
SELECT LAST_INSERT_ID();

-- Asignar la tienda al usuario
INSERT INTO tiendausuarios (
    tienda_id,
    usuario_id,
    tiendausuario_activo
) VALUES (
    LAST_INSERT_ID(),  -- ID de la tienda que acabas de crear
    123,                -- ID de tu usuario (carlos@mitienda.pe)
    1
);
```

Luego actualiza `.env`:
```env
VITE_DEFAULT_STORE_ID=[ID_DE_LA_TIENDA_DE_TESTING]
```

---

## 🔍 Verificar Tienda Activa

### En el navegador:

```javascript
// Ver tienda seleccionada
console.log(JSON.parse(localStorage.getItem('selected_store')))

// Ver todas las tiendas del usuario
// (Disponible después de login)
```

### En el código:

La tienda seleccionada está disponible en el store de Pinia:

```javascript
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
console.log(authStore.selectedStore)
// { id: 10715, name: "...", ... }
```

---

## 📝 Resumen

| Método | Cuándo usar | Requiere reinicio |
|--------|-------------|-------------------|
| **Variable de entorno** | Testing persistente con una tienda específica | ✅ Sí (dev server) |
| **Sin variable** | Testing de selección manual de tienda | ✅ Sí |
| **localStorage** | Cambio rápido temporal sin reiniciar | ❌ No (solo reload) |
| **SQL + variable** | Crear nueva tienda de testing | ✅ Sí |

---

## 🎯 Próximos Pasos

Ahora que puedes cambiar de tienda fácilmente:

1. **Crea una tienda de testing** (si no tienes una)
2. **Configura el .env** con el ID de esa tienda
3. **Reinicia el dev server**
4. **Haz login**
5. **Verifica que estés en la tienda correcta**
6. **Empieza a probar el flujo del POS** 🚀

---

## 💡 Tip: Ver ID de tus tiendas

```sql
SELECT
    t.tienda_id,
    t.tienda_nombre,
    t.tienda_activo
FROM tiendas t
JOIN tiendausuarios tu ON t.tienda_id = tu.tienda_id
JOIN usuarios u ON tu.usuario_id = u.usuario_id
WHERE u.usuario_correoelectronico = 'carlos@mitienda.pe'
AND t.tienda_activo = 1;
```
