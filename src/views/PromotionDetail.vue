<template>
  <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    <div class="px-4 py-6 sm:px-0">
      <!-- Loading State -->
      <div v-if="loading" class="bg-white shadow overflow-hidden sm:rounded-lg p-6">
        <div class="flex flex-col items-center justify-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p class="text-gray-600">Cargando bonificación...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-white shadow overflow-hidden sm:rounded-lg p-6">
        <div class="flex flex-col items-center justify-center py-12">
          <svg class="h-24 w-24 text-red-500 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <h2 class="text-xl font-medium text-gray-900 mb-2">Error al cargar la bonificación</h2>
          <p class="text-gray-600 text-center max-w-md mb-4">{{ error }}</p>
          <button
            @click="fetchPromotion"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>

      <!-- Content -->
      <div v-else-if="promotion">
        <!-- Header -->
        <div class="mb-6">
          <div class="flex items-center justify-between">
            <div>
              <router-link to="/promotions" class="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
                Volver a bonificaciones
              </router-link>
              <h1 class="mt-2 text-2xl font-semibold text-gray-900">{{ promotion.tiendapromocion_nombre }}</h1>
              <p class="mt-1 text-sm text-gray-500">{{ promotion.promocion_nombre }}</p>
            </div>
            <div class="flex items-center gap-3">
              <button
                @click="toggleStatus"
                :disabled="updatingStatus"
                :class="[
                  'px-4 py-2 rounded-lg font-medium transition-colors',
                  Number(promotion.tiendapromocion_estado) === 1
                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                ]"
              >
                {{ Number(promotion.tiendapromocion_estado) === 1 ? 'Activo' : 'Inactivo' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Grid Layout -->
        <div class="grid grid-cols-1 gap-6">
          <!-- Basic Info Card -->
          <div class="bg-white shadow overflow-hidden sm:rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <h3 class="text-lg font-medium leading-6 text-gray-900 mb-4">Información General</h3>
              <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt class="text-sm font-medium text-gray-500">Nombre</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ promotion.tiendapromocion_nombre }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">Tipo de Promoción</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ promotion.promocion_nombre }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">Fecha de Inicio</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ formatDate(promotion.tiendapromocion_fechainicio) }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">Fecha de Caducidad</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ formatDate(promotion.tiendapromocion_fechacaducidad) }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">Período</dt>
                  <dd class="mt-1">
                    <span
                      v-if="isInValidPeriod"
                      class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800"
                    >
                      Vigente ({{ daysUntilExpiry }} días restantes)
                    </span>
                    <span
                      v-else
                      class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800"
                    >
                      Fuera de período
                    </span>
                  </dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">Estado</dt>
                  <dd class="mt-1">
                    <span
                      v-if="Number(promotion.tiendapromocion_estado) === 1"
                      class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800"
                    >
                      Activo
                    </span>
                    <span
                      v-else
                      class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800"
                    >
                      Inactivo
                    </span>
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <!-- Products Card -->
          <div class="bg-white shadow overflow-hidden sm:rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <div class="flex items-center justify-between mb-4">
                <div>
                  <h3 class="text-lg font-medium leading-6 text-gray-900">Productos Base</h3>
                  <p class="text-sm text-gray-500 mt-1">
                    {{ products.length }} producto(s) vinculado(s) a esta bonificación
                  </p>
                </div>
                <button
                  @click="showLinkProductsModal = true"
                  class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Vincular Productos
                </button>
              </div>

              <!-- Products List -->
              <div v-if="products.length > 0" class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-32">Cantidad</th>
                      <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase w-24">Acciones</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200 bg-white">
                    <tr v-for="product in products" :key="product.producto_id">
                      <td class="px-4 py-4">
                        <div class="flex items-center">
                          <div v-if="product.producto_imagen" class="h-10 w-10 flex-shrink-0">
                            <img
                              class="h-10 w-10 rounded object-cover"
                              :src="getImageUrl(product.producto_imagen)"
                              :alt="product.producto_titulo"
                            />
                          </div>
                          <div :class="product.producto_imagen ? 'ml-4' : ''">
                            <div class="text-sm font-medium text-gray-900">{{ product.producto_titulo }}</div>
                          </div>
                        </div>
                      </td>
                      <td class="px-4 py-4 text-sm text-gray-500">{{ product.producto_sku }}</td>
                      <td class="px-4 py-4">
                        <input
                          type="number"
                          min="1"
                          :value="product.tiendapromocionproducto_cantidad || 1"
                          @change="updateProductQuantity(product.producto_id, $event.target.value)"
                          class="w-20 px-2 py-1 border rounded focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </td>
                      <td class="px-4 py-4 text-center">
                        <button
                          @click="unlinkProduct(product.producto_id)"
                          class="text-red-600 hover:text-red-900"
                          title="Eliminar producto"
                        >
                          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div v-else class="text-center py-6 text-gray-500">
                No hay productos base vinculados
              </div>
            </div>
          </div>

          <!-- Bonification Products Card -->
          <div class="bg-white shadow overflow-hidden sm:rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <div class="flex items-center justify-between mb-4">
                <div>
                  <h3 class="text-lg font-medium leading-6 text-gray-900">Productos de Bonificación</h3>
                  <p class="text-sm text-gray-500 mt-1">
                    {{ bonifications.length }} producto(s) que se bonifican en esta promoción
                  </p>
                </div>
                <button
                  @click="showLinkBonificationsModal = true"
                  class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Vincular Bonificaciones
                </button>
              </div>

              <!-- Bonification Products List -->
              <div v-if="bonifications.length > 0" class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-32">Cantidad</th>
                      <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase w-24">Acciones</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200 bg-white">
                    <tr v-for="product in bonifications" :key="`${product.producto_id}-${product.productoatributo_id}`">
                      <td class="px-4 py-4">
                        <div class="flex items-center">
                          <div v-if="product.producto_imagen" class="h-10 w-10 flex-shrink-0">
                            <img
                              class="h-10 w-10 rounded object-cover"
                              :src="getImageUrl(product.producto_imagen)"
                              :alt="product.producto_titulo"
                            />
                          </div>
                          <div :class="product.producto_imagen ? 'ml-4' : ''">
                            <div class="text-sm font-medium text-gray-900">{{ product.producto_titulo }}</div>
                          </div>
                        </div>
                      </td>
                      <td class="px-4 py-4 text-sm text-gray-500">{{ product.producto_sku }}</td>
                      <td class="px-4 py-4">
                        <input
                          type="number"
                          min="1"
                          :value="product.tiendapromocionproducto_cantidad || 1"
                          @change="updateBonificationQuantity(product.producto_id, product.productoatributo_id, $event.target.value)"
                          class="w-20 px-2 py-1 border rounded focus:ring-2 focus:ring-green-500 text-sm"
                        />
                      </td>
                      <td class="px-4 py-4 text-center">
                        <button
                          @click="unlinkBonification(product.producto_id, product.productoatributo_id)"
                          class="text-red-600 hover:text-red-900"
                          title="Eliminar producto"
                        >
                          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div v-else class="text-center py-6 text-gray-500">
                No hay productos de bonificación
              </div>
            </div>
          </div>

          <!-- Actions Card -->
          <div class="bg-white shadow overflow-hidden sm:rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <h3 class="text-lg font-medium leading-6 text-gray-900 mb-4">Acciones</h3>
              <div class="flex flex-wrap gap-3">
                <button
                  @click="confirmDelete"
                  class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                >
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Eliminar Bonificación
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Link Products Modal -->
    <LinkProductsModal
      v-if="showLinkProductsModal"
      :promotion-id="promotion.tiendapromocion_id"
      @close="showLinkProductsModal = false"
      @linked="handleProductsLinked"
    />

    <!-- Link Bonification Products Modal -->
    <LinkBonificationProductsModal
      v-if="showLinkBonificationsModal"
      :promotion-id="promotion.tiendapromocion_id"
      @close="showLinkBonificationsModal = false"
      @linked="handleBonificationsLinked"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { promotionsApi } from '../services/promotionsApi';
import LinkProductsModal from '../components/LinkProductsModal.vue';
import LinkBonificationProductsModal from '../components/LinkBonificationProductsModal.vue';

const route = useRoute();
const router = useRouter();

const promotion = ref(null);
const products = ref([]);
const bonifications = ref([]);
const loading = ref(false);
const error = ref(null);
const updatingStatus = ref(false);
const showLinkProductsModal = ref(false);
const showLinkBonificationsModal = ref(false);

// Computed: Check if promotion is in valid period (use backend value if available)
const isInValidPeriod = computed(() => {
  if (!promotion.value) return false;

  // Preferir el valor del backend si está disponible
  if (promotion.value.hasOwnProperty('is_active_period')) {
    return Number(promotion.value.is_active_period) === 1;
  }

  // Fallback: cálculo del lado del cliente
  const now = new Date();
  const startDate = new Date(promotion.value.tiendapromocion_fechainicio);
  const endDate = new Date(promotion.value.tiendapromocion_fechacaducidad);

  // Set end date to end of day
  endDate.setHours(23, 59, 59, 999);

  return now >= startDate && now <= endDate;
});

// Computed: Days until expiry (use backend value if available)
const daysUntilExpiry = computed(() => {
  if (!promotion.value) return 0;

  // Preferir el valor del backend si está disponible
  if (promotion.value.hasOwnProperty('days_until_expiry')) {
    return Number(promotion.value.days_until_expiry);
  }

  // Fallback: cálculo del lado del cliente
  const now = new Date();
  const endDate = new Date(promotion.value.tiendapromocion_fechacaducidad);
  endDate.setHours(23, 59, 59, 999);

  const diffTime = endDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays > 0 ? diffDays : 0;
});

// Fetch promotion
async function fetchPromotion() {
  loading.value = true;
  error.value = null;

  try {
    const promotionId = parseInt(route.params.id);
    const response = await promotionsApi.getPromotion(promotionId);

    if (response.status === 'success') {
      promotion.value = response.data;

      // Debug: ver qué valores vienen del backend
      console.log('📊 Backend values:', {
        is_active_period: response.data.is_active_period,
        days_until_expiry: response.data.days_until_expiry,
        fechainicio: response.data.tiendapromocion_fechainicio,
        fechacaducidad: response.data.tiendapromocion_fechacaducidad,
        estado: response.data.tiendapromocion_estado
      });

      // Debug: ver cálculo del lado del cliente
      const now = new Date();
      const startDate = new Date(response.data.tiendapromocion_fechainicio);
      const endDate = new Date(response.data.tiendapromocion_fechacaducidad);
      endDate.setHours(23, 59, 59, 999);

      console.log('🖥️ Client-side calculation:', {
        now: now.toISOString(),
        nowLocal: now.toLocaleString('es-PE'),
        startDate: startDate.toISOString(),
        startDateLocal: startDate.toLocaleString('es-PE'),
        endDate: endDate.toISOString(),
        endDateLocal: endDate.toLocaleString('es-PE'),
        isInPeriod: now >= startDate && now <= endDate,
        daysUntil: Math.ceil((endDate - now) / (1000 * 60 * 60 * 24))
      });

      // Extract products and bonifications from the response
      if (response.data.productos) {
        products.value = response.data.productos;
      }

      if (response.data.productos_bonificacion) {
        bonifications.value = response.data.productos_bonificacion;
      }
    }
  } catch (err) {
    console.error('Error fetching promotion:', err);
    error.value = err.response?.data?.message || 'Error al cargar la bonificación';
  } finally {
    loading.value = false;
  }
}

// Toggle status
async function toggleStatus() {
  if (!promotion.value) return;

  try {
    updatingStatus.value = true;
    const currentStatus = Number(promotion.value.tiendapromocion_estado);
    const newStatus = currentStatus === 1 ? 0 : 1;

    console.log('Toggling status from', currentStatus, 'to', newStatus);

    const response = await promotionsApi.updatePromotion(promotion.value.tiendapromocion_id, {
      tiendapromocion_estado: newStatus
    });

    if (response.status === 'success') {
      // Refresh to get updated data
      await fetchPromotion();
    }
  } catch (error) {
    console.error('Error toggling status:', error);
    alert('Error al cambiar el estado de la bonificación');
  } finally {
    updatingStatus.value = false;
  }
}

// Confirm delete
async function confirmDelete() {
  if (!promotion.value) return;

  if (confirm(`¿Estás seguro de que deseas eliminar la bonificación "${promotion.value.tiendapromocion_nombre}"?`)) {
    try {
      await promotionsApi.deletePromotion(promotion.value.tiendapromocion_id);
      router.push('/promotions');
    } catch (error) {
      console.error('Error deleting promotion:', error);
      alert('Error al eliminar la bonificación');
    }
  }
}

// Handle products linked
async function handleProductsLinked(productData) {
  if (!promotion.value) return;

  try {
    const response = await promotionsApi.linkProducts(promotion.value.tiendapromocion_id, {
      productos: productData
    });

    if (response.status === 'success') {
      // Refresh to get updated data
      await fetchPromotion();
    }
  } catch (error) {
    console.error('Error linking products:', error);
    alert('Error al vincular productos');
  }
}

// Handle bonifications linked
async function handleBonificationsLinked(productData) {
  if (!promotion.value) return;

  try {
    const response = await promotionsApi.linkBonifications(promotion.value.tiendapromocion_id, {
      productos: productData
    });

    if (response.status === 'success') {
      // Refresh to get updated data
      await fetchPromotion();
    }
  } catch (error) {
    console.error('Error linking bonifications:', error);
    alert('Error al vincular productos de bonificación');
  }
}

// Get image URL
function getImageUrl(imageName) {
  return `https://cdn.mitienda.pe/images/${imageName}`;
}

// Format date
function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' });
}

// Update product quantity
async function updateProductQuantity(productId, quantity) {
  if (!promotion.value || !quantity || quantity < 1) return;

  try {
    const response = await promotionsApi.updateProductQuantity(
      promotion.value.tiendapromocion_id,
      productId,
      parseInt(quantity)
    );

    if (response.status === 'success') {
      // Update local data
      const product = products.value.find(p => p.producto_id === productId);
      if (product) {
        product.tiendapromocionproducto_cantidad = parseInt(quantity);
      }
    }
  } catch (error) {
    console.error('Error updating product quantity:', error);
    alert('Error al actualizar la cantidad del producto');
    // Refresh to restore previous value
    await fetchPromotion();
  }
}

// Update bonification quantity
async function updateBonificationQuantity(productId, attributeId, quantity) {
  if (!promotion.value || !quantity || quantity < 1) return;

  try {
    const response = await promotionsApi.updateBonificationQuantity(
      promotion.value.tiendapromocion_id,
      productId,
      attributeId,
      parseInt(quantity)
    );

    if (response.status === 'success') {
      // Update local data
      const product = bonifications.value.find(
        p => p.producto_id === productId && p.productoatributo_id === attributeId
      );
      if (product) {
        product.tiendapromocionproducto_cantidad = parseInt(quantity);
      }
    }
  } catch (error) {
    console.error('Error updating bonification quantity:', error);
    alert('Error al actualizar la cantidad del producto de bonificación');
    // Refresh to restore previous value
    await fetchPromotion();
  }
}

// Unlink product
async function unlinkProduct(productId) {
  if (!promotion.value) return;

  if (confirm('¿Estás seguro de que deseas desvincular este producto?')) {
    try {
      await promotionsApi.unlinkProduct(promotion.value.tiendapromocion_id, productId);
      // Refresh to get updated data
      await fetchPromotion();
    } catch (error) {
      console.error('Error unlinking product:', error);
      alert('Error al desvincular el producto');
    }
  }
}

// Unlink bonification
async function unlinkBonification(productId, attributeId) {
  if (!promotion.value) return;

  if (confirm('¿Estás seguro de que deseas desvincular este producto de bonificación?')) {
    try {
      await promotionsApi.unlinkBonification(
        promotion.value.tiendapromocion_id,
        productId,
        attributeId
      );
      // Refresh to get updated data
      await fetchPromotion();
    } catch (error) {
      console.error('Error unlinking bonification:', error);
      alert('Error al desvincular el producto de bonificación');
    }
  }
}

// Initialize
onMounted(() => {
  fetchPromotion();
});
</script>
