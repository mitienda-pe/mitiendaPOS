export const ROLES_ALL = ['cajero', 'supervisor', 'administrador'];
export const ROLES_ADMIN_ONLY = ['supervisor', 'administrador'];

// Fuente única de módulos del POS.
// `hidden: true` oculta el módulo del menú (grid principal + menú lateral) sin
// borrar su definición ni su ruta, para reactivarlo fácil cuando esté listo.
const ALL_MENU_ITEMS = [
  { to: '/dashboard',  label: 'Dashboard',                         description: 'Visualiza indicadores y gráficos',                roles: ROLES_ALL,        borderClass: 'border-orange-500',  iconClass: 'text-orange-500'  },
  { to: '/my-shift',   label: 'Mi Turno',                          description: 'Gestiona tu caja y turnos',                       roles: ROLES_ALL,        borderClass: 'border-green-500',   iconClass: 'text-green-500'   },
  { to: '/pos',        label: 'POS',                               description: 'Gestiona ventas y emite comprobantes',            roles: ROLES_ALL,        borderClass: 'border-primary-500', iconClass: 'text-primary-500' },
  // Ventas ahora incluye el historial de ventas y los comprobantes emitidos (pestañas dentro del módulo).
  { to: '/sales',      label: 'Ventas',                            description: 'Historial de ventas y comprobantes',              roles: ROLES_ALL,        borderClass: 'border-pink-500',    iconClass: 'text-pink-500'    },
  { to: '/inventory',  label: 'Inventario',                        description: 'Gestiona productos, stock y categorías',          roles: ROLES_ALL,        borderClass: 'border-lime-500',    iconClass: 'text-lime-500'    },
  // Oculto: módulo de poco valor para la operación diaria del POS.
  { to: '/customers',  label: 'Clientes',                          description: 'Administra tu cartera de clientes',               roles: ROLES_ALL,        borderClass: 'border-purple-500',  iconClass: 'text-purple-500', hidden: true },
  { to: '/promotions', label: 'Descuentos y Promociones',          description: 'Gestiona ofertas y promociones',                  roles: ROLES_ALL,        borderClass: 'border-rose-500',    iconClass: 'text-rose-500'    },
  // Ocultos: módulos aún no desarrollados.
  { to: '/vouchers',   label: 'Vales y Tarjetas de Regalo',        description: 'Gestiona vales de consumo y tarjetas de regalo',  roles: ROLES_ALL,        borderClass: 'border-amber-500',   iconClass: 'text-amber-500',  hidden: true },
  { to: '/returns',    label: 'Cambios y devoluciones',            description: 'Gestiona cambios y devoluciones de productos',    roles: ROLES_ALL,        borderClass: 'border-cyan-500',    iconClass: 'text-cyan-500',   hidden: true },
  { to: '/settings',   label: 'Configuración',                     description: 'Preferencias, sucursales y usuarios',             roles: ROLES_ADMIN_ONLY, borderClass: 'border-gray-500',    iconClass: 'text-gray-500'    },
  { to: '/help',       label: 'Ayuda',                             description: 'Manuales de usuario y soporte',                   roles: ROLES_ALL,        borderClass: 'border-sky-500',     iconClass: 'text-sky-500'     },
];

export const MENU_ITEMS = ALL_MENU_ITEMS.filter(item => !item.hidden);
