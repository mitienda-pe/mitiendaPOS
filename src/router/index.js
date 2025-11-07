import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useShiftStore } from '../stores/shift';

// Lazy-loaded components
const Login = () => import('../views/Login.vue');
const CashierLogin = () => import('../views/CashierLogin.vue');
const POS = () => import('../views/POS.vue');
const Dashboard = () => import('../views/Dashboard.vue');
const Inventory = () => import('../views/Inventory.vue');
const Customers = () => import('../views/Customers.vue');
const Vouchers = () => import('../views/Vouchers.vue');
const Menu = () => import('../views/Menu.vue');
const Returns = () => import('../views/Returns.vue');
const Documents = () => import('../views/Documents.vue');
const Sales = () => import('../views/Sales.vue');
const Promotions = () => import('../views/Promotions.vue');
const Cashier = () => import('../views/Cashier.vue');
const Branches = () => import('../views/Branches.vue');
const Preferences = () => import('../views/Preferences.vue');
const Settings = () => import('../views/Settings.vue');

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/cashier-login',
    name: 'CashierLogin',
    component: CashierLogin,
    meta: { requiresAuth: false }
  },
  {
    path: '/menu',
    name: 'Menu',
    component: Menu,
    meta: { requiresAuth: true, roles: ['cajero', 'supervisor', 'administrador'] }
  },
  {
    path: '/pos',
    name: 'POS',
    component: POS,
    meta: { requiresAuth: true, requiresActiveShift: true, roles: ['cajero', 'supervisor', 'administrador'] }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true, roles: ['supervisor', 'administrador'] }
  },
  {
    path: '/inventory',
    name: 'Inventory',
    component: Inventory,
    meta: { requiresAuth: true, roles: ['cajero', 'supervisor', 'administrador'] }
  },
  {
    path: '/customers',
    name: 'Customers',
    component: Customers,
    meta: { requiresAuth: true, roles: ['cajero', 'supervisor', 'administrador'] }
  },
  {
    path: '/vouchers',
    name: 'Vouchers',
    component: Vouchers,
    meta: { requiresAuth: true, roles: ['cajero', 'supervisor', 'administrador'] }
  },
  {
    path: '/returns',
    name: 'Returns',
    component: Returns,
    meta: { requiresAuth: true, roles: ['cajero', 'supervisor', 'administrador'] }
  },
  {
    path: '/documents',
    name: 'Documents',
    component: Documents,
    meta: { requiresAuth: true, roles: ['cajero', 'supervisor', 'administrador'] }
  },
  {
    path: '/sales',
    name: 'Sales',
    component: Sales,
    meta: { requiresAuth: true, roles: ['cajero', 'supervisor', 'administrador'] }
  },
  {
    path: '/sales/:id',
    name: 'SaleDetail',
    component: () => import('../views/SaleDetail.vue'),
    meta: { requiresAuth: true, roles: ['cajero', 'supervisor', 'administrador'] }
  },
  {
    path: '/promotions',
    name: 'Promotions',
    component: Promotions,
    meta: { requiresAuth: true, roles: ['cajero', 'supervisor', 'administrador'] }
  },
  {
    path: '/promotions/:id',
    name: 'PromotionDetail',
    component: () => import('../views/PromotionDetail.vue'),
    meta: { requiresAuth: true, roles: ['cajero', 'supervisor', 'administrador'] }
  },
  {
    path: '/cashier',
    name: 'Cashier',
    component: Cashier,
    meta: { requiresAuth: true, roles: ['cajero', 'supervisor', 'administrador'] }
  },
  {
    path: '/my-shift',
    name: 'MyShift',
    component: () => import('../views/MyShift.vue'),
    meta: { requiresAuth: true, roles: ['cajero', 'supervisor', 'administrador'] }
  },
  {
    path: '/shifts',
    name: 'Shifts',
    component: () => import('../views/Shifts.vue'),
    meta: { requiresAuth: true, roles: ['cajero', 'supervisor', 'administrador'] }
  },
  {
    path: '/settings',
    component: Settings,
    meta: { requiresAuth: true, roles: ['supervisor', 'administrador'] },
    children: [
      {
        path: '',
        redirect: '/settings/preferences'
      },
      {
        path: 'preferences',
        name: 'Preferences',
        component: Preferences
      },
      {
        path: 'branches',
        name: 'Branches',
        component: Branches
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('../views/Users.vue')
      }
    ]
  },
  {
    path: '/',
    redirect: '/menu'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Navigation guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  const shiftStore = useShiftStore();
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresActiveShift = to.meta.requiresActiveShift;
  const requiredRoles = to.meta.roles;

  // Allow access to login pages without authentication
  const isLoginPage = to.path === '/login' || to.path === '/cashier-login';

  // Check authentication
  if (requiresAuth && !authStore.isAuthenticated) {
    // Redirigir a login de cajeros por defecto (más común en POS)
    // El usuario puede cambiar manualmente a /login si es admin
    next('/cashier-login');
    return;
  }

  // Check role permissions
  if (requiresAuth && requiredRoles && !requiredRoles.includes(authStore.userRole)) {
    next('/unauthorized');
    return;
  }

  // Check active shift for POS
  if (requiresActiveShift) {
    // Ensure shift store is loaded
    if (!shiftStore.activeShift) {
      await shiftStore.fetchActiveShift();
    }

    if (!shiftStore.hasActiveShift) {
      console.warn('🚫 [ROUTER] Access to POS denied - No active shift');
      alert('⚠️ Debes abrir un turno de caja para acceder al POS');
      next('/menu');
      return;
    }
  }

  // Redirect to menu if already authenticated and trying to access login pages
  if (isLoginPage && authStore.isAuthenticated) {
    next('/menu');
    return;
  }

  next();
});

export default router;
