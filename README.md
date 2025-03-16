# Sistema MiTiendaPOS - Frontend Vue.js

Sistema de Punto de Venta (POS) moderno desarrollado con Vue.js 3, diseñado para ofrecer una experiencia fluida y eficiente en operaciones de venta minorista.


## Características

- 🔐 Autenticación JWT con roles (cajero, supervisor, administrador)
- 🛍️ Interfaz POS intuitiva y rápida
- 📱 Diseño responsivo con Tailwind CSS
- 💳 Múltiples métodos de pago (Efectivo, Tarjeta, Gift Card, Puntos)
- 🔄 Sincronización offline
- 🧾 Soporte para impresora térmica
- 📊 Reportes y estadísticas
- 👥 Gestión de clientes
- 📦 Control de inventario
- 🎁 Gestión de vales y tarjetas de regalo


## Requisitos Previos

- Node.js (v16 o superior)
- npm o yarn
- Navegador moderno con soporte para ES6+


## Instalación

1. Clonar el repositorio:
```bash
git clone <repository-url>
cd POS2
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
```bash
cp .env.example .env
```
Editar `.env` con las configuraciones necesarias.

4. Iniciar el servidor de desarrollo:
```bash
npm run dev
```


## Estructura del Proyecto

```
POS2/
├── src/
│   ├── api/          # Configuración y servicios de API
│   ├── assets/       # Recursos estáticos (logo, imágenes)
│   ├── components/   # Componentes Vue reutilizables
│   ├── router/       # Configuración de rutas
│   ├── stores/       # Stores Pinia
│   ├── views/        # Componentes de página
│   ├── App.vue       # Componente raíz
│   └── main.js       # Punto de entrada
├── public/           # Archivos públicos
└── package.json      # Dependencias y scripts


## Módulos del Sistema

El sistema cuenta con los siguientes módulos principales:


### Módulos Operativos

- **POS**: Interfaz principal de ventas
- **Clientes**: Gestión de cartera de clientes
- **Inventario**: Control de productos y stock
- **Cambios y Devoluciones**: Gestión de devoluciones


### Módulos Administrativos

- **Dashboard**: Visualización de indicadores y gráficos
- **Documentos**: Gestión de documentos fiscales
- **Ventas**: Historial y reportes de ventas
- **Promociones**: Configuración de ofertas y descuentos
- **Caja**: Control de apertura y cierre de caja
- **Sucursales**: Administración de múltiples locales
- **Preferencias**: Configuración del sistema
- **Vales y Tarjetas de Regalo**: Gestión de gift cards


## Métodos de Pago

El sistema soporta los siguientes métodos de pago:

- **Efectivo**: Pago tradicional con dinero en efectivo
- **Tarjeta**: Pago con tarjeta de crédito/débito
- **Gift Card**: Pago con tarjeta de regalo, requiere código de validación
- **Puntos**: Sistema de fidelización mediante puntos acumulados (en desarrollo)


## Características por Rol

### Cajero

- Acceso al módulo POS
- Gestión básica de clientes
- Emisión de comprobantes

### Supervisor

- Todo lo del Cajero
- Acceso a reportes
- Gestión de inventario
- Dashboard de ventas

### Administrador

- Acceso completo al sistema
- Configuración del sistema
- Gestión de usuarios


## Soporte de Hardware

### Impresora Térmica

El sistema está configurado para trabajar con impresoras térmicas que soporten comandos ESC/POS.

### Lector de Código de Barras

Compatible con cualquier lector de código de barras que funcione como dispositivo HID (emulación de teclado).


## Scripts Disponibles

- `npm run dev`: Inicia el servidor de desarrollo
- `npm run build`: Compila para producción
- `npm run preview`: Vista previa de la build de producción


## Tecnologías Principales

- Vue.js 3 (Composition API)
- Vite
- Pinia
- Vue Router
- Tailwind CSS
- Lucide Icons para iconografía moderna


## Diseño UI/UX

El sistema implementa las siguientes características de diseño:

- Botones con bordes redondeados para una interfaz consistente
- Botones de acción prominentes con colores distintivos
- Iconografía moderna con Lucide Icons
- Efectos de transición suaves para mejorar la experiencia de usuario
- Interfaz limpia y visualmente atractiva
