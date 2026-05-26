# Design Guidelines — MiTienda POS

Lineamientos de diseño y patrones UI utilizados en la aplicación.

---

## Paleta de Colores

### Color primario de marca

`#00b2a6` (turquesa/teal). Declarado en CLAUDE.md como el color principal, pero **no está configurado en `tailwind.config.js`** como extensión del tema. En la práctica, su uso es limitado.

### Colores en uso

| Rol semántico           | Clases Tailwind                                        |
|-------------------------|--------------------------------------------------------|
| Acción primaria         | `bg-blue-600 hover:bg-blue-700 text-white`            |
| Auth / PIN              | `bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500` |
| Éxito / Confirmar       | `bg-green-600 hover:bg-green-700 text-white`          |
| Peligro / Eliminar      | `bg-red-600 hover:bg-red-700 text-white`              |
| Secundario / Neutro     | `bg-gray-100 hover:bg-gray-200 text-gray-700`         |
| Inventario (sync)       | `bg-teal-600 hover:bg-teal-700`                       |
| Advertencia             | `bg-amber-600`, `bg-yellow-100 border-yellow-300`     |

### Banners informativos

| Tipo        | Clases                                                   |
|-------------|----------------------------------------------------------|
| Info        | `bg-blue-50 border border-blue-200 text-blue-800`       |
| Error       | `bg-red-50 border border-red-200 text-red-700`          |
| Éxito       | `bg-green-50 border border-green-200 text-green-700`    |
| Advertencia | `bg-yellow-50 border border-yellow-200 text-yellow-800` |

### Fondos de página

| Contexto                | Fondo                           |
|-------------------------|---------------------------------|
| Layout autenticado      | `bg-gray-100`                   |
| Login admin             | `bg-gray-100`                   |
| Login cajero            | `bg-gray-800` (oscuro)          |
| Contenido / cards       | `bg-white` sobre `bg-gray-50`   |

---

## Tipografía

**No se importa ninguna fuente personalizada.** Se usa el **system font stack** de Tailwind (Segoe UI, Roboto, Helvetica Neue, etc.).

### Escala tipográfica

| Uso               | Clases                                                          |
|-------------------|-----------------------------------------------------------------|
| Título de página  | `text-3xl font-bold text-gray-900` o `text-2xl font-semibold`  |
| Título de sección | `text-lg font-medium text-gray-900` o `text-xl font-semibold`  |
| Subtítulos        | `text-sm text-gray-500`                                        |
| Labels de form    | `block text-sm font-medium text-gray-700 mb-1`                 |
| Headers de tabla  | `text-xs font-medium text-gray-500 uppercase tracking-wider`   |
| Celdas de tabla   | `text-sm text-gray-900` / `text-sm text-gray-500`              |
| Texto de ayuda    | `text-xs text-gray-500`                                        |
| Error inline      | `text-red-600 text-xs mt-1`                                    |
| Badges            | `text-xs px-2 py-1 rounded`                                    |

---

## Iconos

**Librería:** `@heroicons/vue` (v2.2.0) esta instalada como dependencia, pero en la práctica la mayoría de iconos son **SVG inline**:

```html
<svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="..." />
</svg>
```

**Tamaños estándar:** `h-4 w-4`, `h-5 w-5`, `h-6 w-6`, `h-8 w-8`, `h-12 w-12`, `h-16 w-16`.

**Spinner de carga** (patrón reutilizado en toda la app):

```html
<svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0..."/>
</svg>
```

---

## Layout y Espaciado

### Contenedor principal

```html
<div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
```

### POS — Layout de dos columnas

```
h-[calc(100dvh-4rem)] flex flex-col
  └── flex-1 flex overflow-hidden
       ├── w-2/3 bg-white   (carrito / productos)
       └── w-1/3 bg-gray-50 (totales / acciones)
```

No tiene variante responsive — es fijo a dos columnas (diseñado para pantallas POS).

### Grids de cards

```html
<!-- Stats dashboard -->
<div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

<!-- Menú principal -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

<!-- Filtros -->
<div class="grid grid-cols-1 md:grid-cols-5 gap-4">
```

### Cards del menú

```html
<div class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border-l-4 border-{color}-500">
```

### Tokens de espaciado comunes

| Contexto         | Clases                                  |
|------------------|-----------------------------------------|
| Gaps de sección  | `mb-4`, `mb-6`, `space-y-2`, `space-y-6` |
| Padding de cards | `p-4`, `p-5`, `p-6`, `p-8`             |
| Campos de form   | `mb-4` por campo                        |
| Grupos de botón  | `flex gap-2`, `flex gap-3`              |

---

## Formularios

### Input estándar

```html
<input class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
```

### Clases utilitarias en `index.css`

```css
.input-field { @apply block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
               focus:ring-blue-500 focus:border-blue-500 sm:text-sm; }
.form-label  { @apply block text-sm font-medium text-gray-700 mb-1; }
```

### Select

```html
<select class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
```

### Estados de input

| Estado      | Clases                                       |
|-------------|----------------------------------------------|
| Disabled    | `disabled:bg-gray-100 disabled:cursor-not-allowed` |
| Error       | `border-red-500 bg-red-50`                   |
| Focus       | `focus:ring-2 focus:ring-blue-500`           |

### Validación

No se usa librería de validación. Validación manual con `computed` y renderizado condicional:

```html
<div v-if="error" class="text-red-600 text-xs mt-1">{{ error }}</div>
```

### Entrada de PIN

Dos patrones:
1. **Input único:** `type="password" inputmode="numeric" maxlength="4" class="text-2xl text-center tracking-widest"`
2. **4 inputs separados:** cada uno `w-12 h-14` con auto-avance al siguiente dígito

### Entrada de moneda

`RightToLeftMoneyInput.vue` — entrada de derecha a izquierda (centavos primero), prefijado con `S/`.

---

## Modales

Todos los modales siguen la misma estructura (sin librería externa):

```html
<div v-if="modelValue" class="fixed inset-0 z-50 overflow-y-auto">
  <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
    <!-- Backdrop -->
    <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="close"></div>
    <!-- Truco de centrado vertical -->
    <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
    <!-- Panel -->
    <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl
                transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
      <!-- Cuerpo -->
      <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">...</div>
      <!-- Footer -->
      <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">...</div>
    </div>
  </div>
</div>
```

### Anchos de modal

| Variante    | Clase           | Uso                        |
|-------------|-----------------|----------------------------|
| Default     | `sm:max-w-lg`   | La mayoría de modales      |
| Ancho       | `sm:max-w-2xl`  | Cierre de turno, detalles  |
| Extra ancho | `sm:max-w-4xl`  | Listas de productos        |
| Compacto    | `max-w-md`      | Modales de autenticación   |

### Modales especiales

- **ProcessingOverlay:** `z-[9999]`, `bg-gray-900 bg-opacity-95` — overlay bloqueante de pantalla completa
- **LockScreenModal:** `z-[9999]`, `bg-gray-900 bg-opacity-95` — pantalla de bloqueo

---

## Tablas

```html
<div class="bg-white shadow overflow-hidden sm:rounded-lg">
  <div class="overflow-x-auto">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Columna
          </th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <tr class="hover:bg-gray-50">
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">...</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
```

### Estados de tabla

- **Cargando:** Spinner centrado (`animate-spin h-12 w-12 border-b-2 border-blue-600`) + mensaje
- **Vacío:** Icono SVG + título `text-sm font-medium text-gray-900` + subtexto `text-sm text-gray-500`
- **Error:** Icono SVG + mensaje + botón de reintentar

---

## Notificaciones

**No hay librería de toasts.** Los mecanismos actuales son:

1. **`window.alert()`** — el más común (limitación conocida)
2. **Banner global de error** en `App.vue` — `fixed bottom-4 right-4`, auto-dismiss a 5 segundos
3. **Banners inline** dentro de modales/vistas (ver sección de colores de banners)
4. **Banner de sesión cruzada** — barra `bg-red-600 text-white` sticky debajo del nav

---

## Botones

### Patrones comunes

```html
<!-- Primario -->
<button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700
               disabled:opacity-50 disabled:cursor-not-allowed transition-colors">

<!-- Secundario -->
<button class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">

<!-- Peligro -->
<button class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">

<!-- Éxito -->
<button class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
```

### Clase utilitaria en `index.css`

```css
.btn-primary { @apply bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 ... }
```

### Con spinner de carga

```html
<button :disabled="loading">
  <svg v-if="loading" class="animate-spin h-5 w-5 text-white" ...></svg>
  <span v-else>Guardar</span>
</button>
```

---

## Responsive Design

La app esta diseñada **desktop-first** (hardware POS). Breakpoints usados:

| Breakpoint | Uso principal                                     |
|------------|---------------------------------------------------|
| `sm:`      | Modales (padding, ancho, layout de footer)         |
| `md:`      | Nav items (`hidden md:block`), grids a 2 columnas |
| `lg:`      | Grids a 4 columnas, padding horizontal             |

El layout POS (`w-2/3` / `w-1/3`) **no tiene variante responsive** — es fijo para pantallas de punto de venta.

---

## Modo Oscuro

**No hay soporte de modo oscuro.** No se usan clases `dark:` de Tailwind ni configuración `darkMode`. La pantalla de login de cajero (`bg-gray-800`) es una decisión de diseño, no un modo oscuro del sistema.

---

## Animaciones y Transiciones

No se usa librería de animaciones. Todo se maneja con utilidades Tailwind y CSS scoped:

| Animación          | Implementación                                          | Uso                       |
|--------------------|---------------------------------------------------------|---------------------------|
| Spinner            | `animate-spin`                                          | Indicadores de carga      |
| Bounce             | `animate-bounce`                                        | ProcessingOverlay dots    |
| Fade               | `<Transition name="fade">` con CSS (`opacity 0.2s`)    | ProcessingOverlay         |
| Shake              | `@keyframes shake` (scoped CSS)                         | Error en PIN / auth       |
| Hover shadow       | `hover:shadow-lg transition-shadow duration-300`        | Cards del menú            |
| Hover color        | `transition-colors` o `transition-colors duration-200`  | Botones, links            |
| Modal backdrop     | `transition-opacity`                                    | Backdrop de modales       |

---

## Componentes Reutilizables

### Componentes UI existentes (`src/components/`)

> Nota: `src/components/ui/` no existe aún. Los componentes `AppButton`, `AppInput`, `AppBadge`, `AppEmptyState`, `AppErrorState` mencionados en CLAUDE.md son aspiracionales y no han sido creados.

| Componente                 | Propósito                                               |
|----------------------------|---------------------------------------------------------|
| `QuantityStepperInput`     | Stepper +/- con input editable, confirma al llegar a 0  |
| `RightToLeftMoneyInput`    | Entrada de monto en soles (derecha a izquierda)         |
| `InlineEditField`          | Campo click-to-edit con guardado async                  |
| `CashBreakdownInput`       | Grid de desglose de billetes/monedas                    |
| `BarcodeScanner`           | Escáner de código de barras por cámara (Quagga2)        |
| `ProcessingOverlay`        | Overlay de pantalla completa con spinner                |

### Patrón de modales

Todos usan `v-model` / `modelValue: Boolean`:

```vue
<script setup>
const props = defineProps({ modelValue: Boolean, /* ... */ })
const emit = defineEmits(['update:modelValue', /* ... */])
const close = () => emit('update:modelValue', false)
</script>
```

---

## Convenciones Generales

- **Idioma de UI:** Español (es-PE)
- **Moneda:** Soles peruanos (S/), con lógica de redondeo para pagos en efectivo
- **Commits:** Conventional commits (`feat:`, `fix:`, etc.)
- **Nuevos servicios API:** En `src/services/` usando `apiClient` de `src/services/axios.js`
- **Framework CSS:** TailwindCSS (sin tema personalizado extendido)
- **Componentes:** Vue 3 `<script setup>` con stores Pinia (Options API)
