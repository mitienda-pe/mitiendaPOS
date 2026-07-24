<template>
  <div class="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-3xl mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <img src="@/assets/logo-mitiendapos-wb.svg" alt="MiTiendaPOS" class="h-8" />
          <div>
            <h1 class="text-xl font-bold text-gray-900">Modo Super-Admin</h1>
            <p class="text-sm text-gray-500">Elige una tienda para acceder a su POS</p>
          </div>
        </div>
        <button
          @click="handleLogout"
          class="text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          Cerrar sesión
        </button>
      </div>

      <!-- Buscador -->
      <div class="mb-4">
        <input
          v-model="search"
          type="text"
          placeholder="Buscar por nombre, URL o correo del dueño…"
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
        />
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-12">
        <svg class="animate-spin h-10 w-10 mx-auto text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="text-gray-600 mt-2">Cargando tiendas…</p>
      </div>

      <!-- Error de carga -->
      <div v-else-if="loadError" class="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p class="text-sm text-red-700">{{ loadError }}</p>
        <button @click="fetchStores" class="mt-2 text-sm font-medium text-primary-600 hover:text-primary-500">
          Reintentar
        </button>
      </div>

      <!-- Sin resultados -->
      <div v-else-if="stores.length === 0" class="text-center py-12">
        <p class="text-gray-500">No se encontraron tiendas.</p>
      </div>

      <!-- Lista -->
      <div v-else class="space-y-3">
        <div
          v-for="store in stores"
          :key="store.id"
          class="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
        >
          <div class="flex items-center gap-4">
            <div class="flex-1 min-w-0">
              <h3 class="font-semibold text-gray-900 truncate">{{ store.name }}</h3>
              <p class="text-sm text-gray-500 truncate">{{ store.url || store.slug }}</p>
              <div class="flex flex-wrap gap-2 mt-1 items-center">
                <span v-if="planLabel(store)" class="text-xs px-2 py-1 bg-primary-100 text-primary-800 rounded">
                  {{ planLabel(store) }}
                </span>
                <span v-if="store.owner?.email" class="text-xs text-gray-400 truncate">
                  {{ store.owner.name || store.owner.email }}
                </span>
              </div>
              <!-- Error de impersonación por tienda (p.ej. sin POS) -->
              <p v-if="rowError[store.id]" class="text-xs text-red-600 mt-2">
                {{ rowError[store.id] }}
              </p>
            </div>
            <button
              @click="handleImpersonate(store)"
              :disabled="impersonatingId === store.id"
              class="flex-shrink-0 inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              <span v-if="impersonatingId === store.id">Entrando…</span>
              <span v-else>Acceder</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Paginación -->
      <div v-if="!loading && pagination.total_pages > 1" class="flex items-center justify-between mt-6">
        <button
          @click="changePage(pagination.page - 1)"
          :disabled="pagination.page <= 1"
          class="px-3 py-1 text-sm border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Anterior
        </button>
        <span class="text-sm text-gray-500">
          Página {{ pagination.page }} de {{ pagination.total_pages }}
        </span>
        <button
          @click="changePage(pagination.page + 1)"
          :disabled="pagination.page >= pagination.total_pages"
          class="px-3 py-1 text-sm border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { authApi } from '../services/authApi';

const router = useRouter();
const authStore = useAuthStore();

const stores = ref([]);
const pagination = reactive({ total: 0, page: 1, per_page: 20, total_pages: 1 });
const loading = ref(false);
const loadError = ref('');
const search = ref('');
const impersonatingId = ref(null);
const rowError = reactive({});

let searchDebounce = null;

const planLabel = (store) => store.plan?.name || (typeof store.plan === 'string' ? store.plan : null);

const fetchStores = async () => {
  loading.value = true;
  loadError.value = '';
  try {
    const res = await authApi.getSuperAdminStores({
      search: search.value || undefined,
      page: pagination.page,
    });
    const data = res?.data ?? {};
    stores.value = data.stores ?? [];
    Object.assign(pagination, {
      total: data.pagination?.total ?? stores.value.length,
      page: data.pagination?.page ?? 1,
      per_page: data.pagination?.per_page ?? 20,
      total_pages: data.pagination?.total_pages ?? 1,
    });
  } catch (error) {
    loadError.value = error?.response?.data?.message || 'No se pudieron cargar las tiendas.';
  } finally {
    loading.value = false;
  }
};

const changePage = (page) => {
  if (page < 1 || page > pagination.total_pages) return;
  pagination.page = page;
  fetchStores();
};

const handleImpersonate = async (store) => {
  rowError[store.id] = '';
  impersonatingId.value = store.id;
  try {
    await authStore.impersonateStore(store);
    router.push('/menu');
  } catch (error) {
    if (error?.posAccessDenied) {
      rowError[store.id] = error.message || 'Esta tienda no tiene el POS habilitado.';
    } else {
      rowError[store.id] = error?.response?.data?.message || error?.message || 'No se pudo acceder a la tienda.';
    }
  } finally {
    impersonatingId.value = null;
  }
};

const handleLogout = () => authStore.logout();

watch(search, () => {
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => {
    pagination.page = 1;
    fetchStores();
  }, 350);
});

onMounted(() => {
  if (!authStore.isSuperAdmin) {
    router.replace('/menu');
    return;
  }
  fetchStores();
});
</script>
