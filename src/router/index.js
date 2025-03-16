import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

// Lazy-loaded components
const Login = () => import('../views/Login.vue');
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

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
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
    meta: { requiresAuth: true, roles: ['cajero', 'supervisor', 'administrador'] }
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
    meta: { requiresAuth: true, roles: ['supervisor', 'administrador'] }
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
    path: '/promotions',
    name: 'Promotions',
    component: Promotions,
    meta: { requiresAuth: true, roles: ['cajero', 'supervisor', 'administrador'] }
  },
  {
    path: '/cashier',
    name: 'Cashier',
    component: Cashier,
    meta: { requiresAuth: true, roles: ['cajero', 'supervisor', 'administrador'] }
  },
  {
    path: '/branches',
    name: 'Branches',
    component: Branches,
    meta: { requiresAuth: true, roles: ['supervisor', 'administrador'] }
  },
  {
    path: '/preferences',
    name: 'Preferences',
    component: Preferences,
    meta: { requiresAuth: true, roles: ['supervisor', 'administrador'] }
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
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiredRoles = to.meta.roles;

  if (requiresAuth && !authStore.isAuthenticated) {
    next('/login');
  } else if (requiresAuth && requiredRoles && !requiredRoles.includes(authStore.userRole)) {
    next('/unauthorized');
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    next('/');
  } else {
    next();
  }
});

export default router;
