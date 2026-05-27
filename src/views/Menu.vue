<template>
  <div class="max-w-7xl mx-auto py-4 px-3 sm:px-6 lg:px-8">
    <h1 class="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6">Menú Principal</h1>

    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
      <router-link
        v-for="item in visibleItems"
        :key="item.to"
        :to="item.to"
        class="block"
      >
        <div
          class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-3 sm:p-6 h-full border-l-4"
          :class="`border-${item.color}-500`"
        >
          <div class="flex flex-col items-center justify-center h-full text-center">
            <component :is="item.icon" :class="`h-10 w-10 sm:h-16 sm:w-16 text-${item.color}-500 mb-2 sm:mb-4`" />
            <h2 class="text-sm sm:text-xl font-medium text-gray-900 mb-1 sm:mb-2">{{ item.label }}</h2>
            <p class="text-gray-600 text-center text-xs sm:text-base hidden sm:block">{{ item.description }}</p>
          </div>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { computed, h } from 'vue';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();

const svgIcon = (paths) => ({
  render() {
    return h('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      class: this.$attrs.class
    }, paths.map(d => {
      if (typeof d === 'string') return h('path', { d });
      return h(d.tag, d.attrs);
    }));
  }
});

const IconDashboard = svgIcon([
  'M21.21 15.89A10 10 0 1 1 8 2.83',
  'M22 12A10 10 0 0 0 12 2v10z'
]);
const IconShift = svgIcon([
  { tag: 'circle', attrs: { cx: '8', cy: '8', r: '6' } },
  'M18.09 10.37A6 6 0 1 1 10.34 18',
  'M7 6h1v4',
  'm16.71 13.88.7.71-2.82 2.82'
]);
const IconPOS = svgIcon([
  { tag: 'rect', attrs: { x: '2', y: '3', width: '20', height: '14', rx: '2', ry: '2' } },
  { tag: 'line', attrs: { x1: '8', y1: '21', x2: '16', y2: '21' } },
  { tag: 'line', attrs: { x1: '12', y1: '17', x2: '12', y2: '21' } }
]);
const IconSales = svgIcon([
  'M3 3v18h18',
  'M18.4 8.64L18.57 8.8a2 2 0 0 1 0 2.83l-8.49 8.48a2 2 0 0 1-2.83 0l-.17-.17a2 2 0 0 1 0-2.83l8.49-8.48a2 2 0 0 1 2.83 0Z',
  'M15 8h5v5',
  'M18 11l-7 7'
]);
const IconDocuments = svgIcon([
  'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z',
  { tag: 'polyline', attrs: { points: '14 2 14 8 20 8' } },
  { tag: 'line', attrs: { x1: '16', y1: '13', x2: '8', y2: '13' } },
  { tag: 'line', attrs: { x1: '16', y1: '17', x2: '8', y2: '17' } },
  { tag: 'polyline', attrs: { points: '10 9 9 9 8 9' } }
]);
const IconInventory = svgIcon([
  'M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z',
  'm7 16.5-4.74-2.85', 'm7 16.5 5-3', 'M7 16.5v5.17',
  'M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z',
  'm17 16.5-5-3', 'm17 16.5 4.74-2.85', 'M17 16.5v5.17',
  'M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z',
  'M12 8 7.26 5.15', 'm12 8 4.74-2.85', 'M12 13.5V8'
]);
const IconCustomers = svgIcon([
  'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2',
  { tag: 'circle', attrs: { cx: '12', cy: '7', r: '4' } }
]);
const IconPromotions = svgIcon([
  { tag: 'line', attrs: { x1: '19', y1: '5', x2: '5', y2: '19' } },
  { tag: 'circle', attrs: { cx: '6.5', cy: '6.5', r: '2.5' } },
  { tag: 'circle', attrs: { cx: '17.5', cy: '17.5', r: '2.5' } }
]);
const IconVouchers = svgIcon([
  { tag: 'rect', attrs: { x: '3', y: '8', width: '18', height: '4', rx: '1' } },
  'M12 8v13',
  'M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7',
  'M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5'
]);
const IconReturns = svgIcon([
  'M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8',
  'M3 3v5h5',
  'M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16',
  'M16 16h5v5'
]);
const IconSettings = svgIcon([
  { tag: 'circle', attrs: { cx: '12', cy: '12', r: '3' } },
  'M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z'
]);
const IconHelp = svgIcon([
  { tag: 'circle', attrs: { cx: '12', cy: '12', r: '10' } },
  'M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3',
  { tag: 'line', attrs: { x1: '12', y1: '17', x2: '12.01', y2: '17' } }
]);

const ALL = ['cajero', 'supervisor', 'administrador'];
const ADMIN_ONLY = ['supervisor', 'administrador'];

const menuItems = [
  { to: '/dashboard',  label: 'Dashboard',    icon: IconDashboard,  color: 'orange', description: 'Visualiza indicadores y gráficos', roles: ALL },
  { to: '/my-shift',   label: 'Mi Turno',     icon: IconShift,      color: 'green',  description: 'Gestiona tu caja y turnos',        roles: ALL },
  { to: '/pos',        label: 'POS',          icon: IconPOS,        color: 'primary',description: 'Gestiona ventas y emite comprobantes', roles: ALL },
  { to: '/sales',      label: 'Ventas',       icon: IconSales,      color: 'pink',   description: 'Consulta el historial de ventas',  roles: ALL },
  { to: '/documents',  label: 'Documentos',   icon: IconDocuments,  color: 'yellow', description: 'Gestiona documentos y comprobantes', roles: ALL },
  { to: '/inventory',  label: 'Inventario',   icon: IconInventory,  color: 'lime',   description: 'Gestiona productos, stock y categorías', roles: ALL },
  { to: '/customers',  label: 'Clientes',     icon: IconCustomers,  color: 'purple', description: 'Administra tu cartera de clientes', roles: ALL },
  { to: '/promotions', label: 'Descuentos y Promociones', icon: IconPromotions, color: 'rose', description: 'Gestiona ofertas y promociones', roles: ALL },
  { to: '/vouchers',   label: 'Vales y Tarjetas de Regalo', icon: IconVouchers, color: 'amber', description: 'Gestiona vales de consumo y tarjetas de regalo', roles: ALL },
  { to: '/returns',    label: 'Cambios y devoluciones', icon: IconReturns, color: 'cyan', description: 'Gestiona cambios y devoluciones de productos', roles: ALL },
  { to: '/settings',   label: 'Configuración',icon: IconSettings,   color: 'gray',   description: 'Preferencias, sucursales y usuarios', roles: ADMIN_ONLY },
  { to: '/help',       label: 'Ayuda',        icon: IconHelp,       color: 'sky',    description: 'Manuales de usuario y soporte',    roles: ALL },
];

const visibleItems = computed(() => {
  const role = authStore.userRole;
  if (!role) return menuItems;
  return menuItems.filter(item => item.roles.includes(role));
});
</script>
