export const ROLES_ALL = ['cajero', 'supervisor', 'administrador'];
export const ROLES_ADMIN_ONLY = ['supervisor', 'administrador'];

export const MENU_ITEMS = [
  { to: '/dashboard',  label: 'Dashboard',                         description: 'Visualiza indicadores y gráficos',                roles: ROLES_ALL,        borderClass: 'border-orange-500',  iconClass: 'text-orange-500'  },
  { to: '/my-shift',   label: 'Mi Turno',                          description: 'Gestiona tu caja y turnos',                       roles: ROLES_ALL,        borderClass: 'border-green-500',   iconClass: 'text-green-500'   },
  { to: '/pos',        label: 'POS',                               description: 'Gestiona ventas y emite comprobantes',            roles: ROLES_ALL,        borderClass: 'border-primary-500', iconClass: 'text-primary-500' },
  { to: '/sales',      label: 'Ventas',                            description: 'Consulta el historial de ventas',                 roles: ROLES_ALL,        borderClass: 'border-pink-500',    iconClass: 'text-pink-500'    },
  { to: '/documents',  label: 'Documentos',                        description: 'Gestiona documentos y comprobantes',              roles: ROLES_ALL,        borderClass: 'border-yellow-500',  iconClass: 'text-yellow-500'  },
  { to: '/inventory',  label: 'Inventario',                        description: 'Gestiona productos, stock y categorías',          roles: ROLES_ALL,        borderClass: 'border-lime-500',    iconClass: 'text-lime-500'    },
  { to: '/customers',  label: 'Clientes',                          description: 'Administra tu cartera de clientes',               roles: ROLES_ALL,        borderClass: 'border-purple-500',  iconClass: 'text-purple-500'  },
  { to: '/promotions', label: 'Descuentos y Promociones',          description: 'Gestiona ofertas y promociones',                  roles: ROLES_ALL,        borderClass: 'border-rose-500',    iconClass: 'text-rose-500'    },
  { to: '/vouchers',   label: 'Vales y Tarjetas de Regalo',        description: 'Gestiona vales de consumo y tarjetas de regalo',  roles: ROLES_ALL,        borderClass: 'border-amber-500',   iconClass: 'text-amber-500'   },
  { to: '/returns',    label: 'Cambios y devoluciones',            description: 'Gestiona cambios y devoluciones de productos',    roles: ROLES_ALL,        borderClass: 'border-cyan-500',    iconClass: 'text-cyan-500'    },
  { to: '/settings',   label: 'Configuración',                     description: 'Preferencias, sucursales y usuarios',             roles: ROLES_ADMIN_ONLY, borderClass: 'border-gray-500',    iconClass: 'text-gray-500'    },
  { to: '/help',       label: 'Ayuda',                             description: 'Manuales de usuario y soporte',                   roles: ROLES_ALL,        borderClass: 'border-sky-500',     iconClass: 'text-sky-500'     },
];
