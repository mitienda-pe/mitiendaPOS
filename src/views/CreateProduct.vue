<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-primary-600 text-white sticky top-0 z-20 shadow">
      <div class="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
        <button
          @click="goBack"
          class="p-1 -ml-1 rounded-full hover:bg-primary-700 focus:outline-none"
          aria-label="Volver"
        >
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h1 class="text-xl font-semibold">Nuevo producto</h1>
      </div>
    </div>

    <form @submit.prevent="handleSubmit" class="max-w-2xl mx-auto px-4 py-5 space-y-5">
      <!-- Imagen -->
      <div class="flex items-center gap-4">
        <button
          type="button"
          @click="imageInput?.click()"
          class="flex-shrink-0 w-24 h-24 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <img v-if="imagePreview" :src="imagePreview" alt="Vista previa" class="w-full h-full object-cover" />
          <svg v-else class="h-9 w-9 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
        <div>
          <p class="text-base font-medium text-gray-900">Imagen del producto</p>
          <p class="text-sm text-gray-500">{{ imageFile ? imageFile.name : 'Toca para elegir una foto' }}</p>
          <button
            v-if="imageFile"
            type="button"
            @click="clearImage"
            class="mt-1 text-sm text-red-600 hover:text-red-700"
          >
            Quitar imagen
          </button>
        </div>
        <input
          ref="imageInput"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          capture="environment"
          class="hidden"
          @change="onImageSelected"
        />
      </div>

      <!-- Nombre (con autocompletado del catálogo maestro) -->
      <div class="relative">
        <input
          v-model="form.name"
          type="text"
          placeholder="Nombre del producto *"
          autocomplete="off"
          @input="onNameInput"
          @keydown="onSuggestKeydown"
          @blur="onNameBlur"
          class="w-full px-4 py-4 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
        <ul
          v-if="showSuggestions && nameSuggestions.length"
          class="absolute z-30 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-72 overflow-auto"
        >
          <li
            v-for="(s, idx) in nameSuggestions"
            :key="s.catalogo_id"
            @mousedown.prevent="selectSuggestion(s)"
            :class="idx === highlightedIndex ? 'bg-primary-50' : ''"
            class="px-4 py-3 cursor-pointer hover:bg-primary-50 border-b border-gray-100 last:border-b-0"
          >
            <div class="flex items-center justify-between gap-2">
              <span class="text-sm text-gray-900 leading-snug">{{ s.nombre }}</span>
              <span v-if="s.precio_referencial != null" class="text-xs text-gray-400 flex-shrink-0">
                S/ {{ Number(s.precio_referencial).toFixed(2) }}
              </span>
            </div>
            <div v-if="s.marca || s.categoria" class="text-xs text-gray-400 mt-0.5">
              <span v-if="s.marca">{{ s.marca }}</span>
              <span v-if="s.marca && s.categoria"> · </span>
              <span v-if="s.categoria">{{ s.categoria }}</span>
            </div>
          </li>
        </ul>
        <p class="mt-1 ml-1 text-xs text-gray-400">
          Escribe el nombre y elige una sugerencia del catálogo para autocompletar.
        </p>
      </div>

      <!-- SKU -->
      <div>
        <input
          v-model="form.sku"
          type="text"
          placeholder="SKU"
          class="w-full px-4 py-4 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      <!-- Código de barras + escanear -->
      <div class="flex gap-2">
        <input
          v-model="form.barcode"
          type="text"
          placeholder="Código de barras"
          class="flex-1 px-4 py-4 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
        <button
          type="button"
          @click="showScanner = true"
          class="flex-shrink-0 w-16 rounded-lg bg-primary-200 text-primary-800 flex items-center justify-center hover:bg-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
          aria-label="Escanear código de barras"
        >
          <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 7V5a2 2 0 0 1 2-2h2" />
            <path d="M17 3h2a2 2 0 0 1 2 2v2" />
            <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
            <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
            <rect width="10" height="10" x="7" y="7" rx="1" />
          </svg>
        </button>
      </div>

      <!-- Precio -->
      <div>
        <input
          v-model="form.price"
          type="number"
          step="0.01"
          min="0"
          inputmode="decimal"
          placeholder="Precio (S/) *"
          class="w-full px-4 py-4 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      <!-- Costo de compra (para calcular ganancia; no se muestra al cliente) -->
      <div>
        <input
          v-model="form.cost"
          type="number"
          step="0.01"
          min="0"
          inputmode="decimal"
          placeholder="Costo de compra (S/)"
          class="w-full px-4 py-4 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
        <p v-if="estimatedMargin !== null" class="text-xs text-gray-500 mt-1 ml-1">
          Margen estimado: <span class="font-semibold text-primary-600">{{ estimatedMargin }}%</span>
        </p>
      </div>

      <!-- Afectación IGV -->
      <div>
        <label class="block text-xs text-gray-500 mb-1 ml-1">Afectación IGV</label>
        <select
          v-model.number="form.tax_affectation"
          class="w-full px-4 py-4 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option :value="1">Gravado (con IGV)</option>
          <option :value="2">Exonerado</option>
          <option :value="3">Inafecto</option>
        </select>
        <p class="text-xs text-gray-400 mt-1 ml-1">Exonerado/Inafecto: el precio no incluye IGV.</p>
      </div>

      <!-- Stock + ilimitado -->
      <div class="flex items-center gap-3">
        <input
          v-model="form.stock"
          type="number"
          min="0"
          inputmode="numeric"
          placeholder="Stock"
          :disabled="form.unlimited_stock"
          class="flex-1 px-4 py-4 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:text-gray-400"
        />
        <div class="flex flex-col items-center">
          <span class="text-xs text-gray-600 mb-1">Ilimitado</span>
          <button
            type="button"
            role="switch"
            :aria-checked="form.unlimited_stock"
            @click="form.unlimited_stock = !form.unlimited_stock"
            :class="form.unlimited_stock ? 'bg-primary-500' : 'bg-gray-300'"
            class="relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <span
              :class="form.unlimited_stock ? 'translate-x-6' : 'translate-x-1'"
              class="inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow"
            ></span>
          </button>
        </div>
      </div>

      <!-- Categoría -->
      <div>
        <label class="block text-xs text-gray-500 mb-1 ml-1">Categoría</label>
        <select
          v-model="form.category_id"
          class="w-full px-4 py-4 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="">Sin categoría</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
        </select>
      </div>

      <!-- Publicado -->
      <div class="flex items-center justify-between">
        <div>
          <p class="text-base font-medium text-gray-900">Publicado</p>
          <p class="text-sm text-gray-500">Disponible para venta en el POS</p>
        </div>
        <button
          type="button"
          role="switch"
          :aria-checked="form.published"
          @click="form.published = !form.published"
          :class="form.published ? 'bg-primary-500' : 'bg-gray-300'"
          class="relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <span
            :class="form.published ? 'translate-x-6' : 'translate-x-1'"
            class="inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow"
          ></span>
        </button>
      </div>

      <!-- Botón crear -->
      <button
        type="submit"
        :disabled="!isValid || submitting"
        class="w-full py-4 rounded-full text-base font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
      >
        <svg v-if="submitting" class="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
        {{ submitting ? 'Creando…' : 'Crear producto' }}
      </button>
    </form>

    <!-- Escáner de código de barras -->
    <BarcodeScanner v-model="showScanner" @detected="onBarcodeDetected" />

    <!-- Toast -->
    <Transition name="toast">
      <div
        v-if="toast.show"
        class="fixed bottom-4 right-4 z-50 max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5"
      >
        <div class="p-4 flex items-start">
          <svg v-if="toast.type === 'success'" class="h-6 w-6 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <svg v-else-if="toast.type === 'info'" class="h-6 w-6 text-amber-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <svg v-else class="h-6 w-6 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="ml-3 text-sm font-medium text-gray-900">{{ toast.message }}</p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useInventoryStore } from '../stores/inventory';
import { useAuthStore } from '../stores/auth';
import { useCashierStore } from '../stores/cashier';
import { inventoryApi } from '../services/inventoryApi';
import BarcodeScanner from '../components/BarcodeScanner.vue';

const router = useRouter();
const inventoryStore = useInventoryStore();
const authStore = useAuthStore();
const cashierStore = useCashierStore();

// Reforzar el gate de la ruta: solo admin/supervisor (rol del cajero activo manda).
const canCreate = computed(() => {
  const role = cashierStore.cashierRole || authStore.userRole;
  return role === 'administrador' || role === 'supervisor';
});

const form = reactive({
  name: '',
  sku: '',
  barcode: '',
  price: '',
  cost: '',
  stock: '',
  unlimited_stock: false,
  category_id: '',
  tax_affectation: 1, // 1=Gravado/afecto, 2=Exonerado, 3=Inafecto
  published: true
});

// Margen estimado = (precio de venta - costo de compra) / precio de venta
const estimatedMargin = computed(() => {
  const price = parseFloat(form.price);
  const cost = parseFloat(form.cost);
  if (!price || !cost || cost <= 0) return null;
  return Math.round(((price - cost) / price) * 100);
});

const categories = ref([]);
const imageInput = ref(null);
const imageFile = ref(null);
const imagePreview = ref('');
const showScanner = ref(false);
const submitting = ref(false);
const toast = ref({ show: false, type: 'success', message: '' });

// Autocompletado del catálogo maestro
const nameSuggestions = ref([]);
const showSuggestions = ref(false);
const highlightedIndex = ref(-1);
let suggestTimer = null;
let suppressSuggest = false; // evita re-sugerir inmediatamente tras seleccionar

const MIN_IMAGE_DIMENSION = 600;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

const isValid = computed(() => {
  const nameOk = form.name.trim().length >= 3;
  const priceOk = form.price !== '' && form.price !== null && parseFloat(form.price) >= 0;
  return nameOk && priceOk;
});

const showToast = (type, message, duration = 3000) => {
  toast.value = { show: true, type, message };
  setTimeout(() => { toast.value.show = false; }, duration);
};

const goBack = () => router.push('/inventory');

const onBarcodeDetected = (code) => {
  form.barcode = code;
};

const onNameInput = () => {
  // No re-sugerir el valor que acabamos de autocompletar al seleccionar.
  if (suppressSuggest) { suppressSuggest = false; return; }

  const q = form.name.trim();
  highlightedIndex.value = -1;
  if (suggestTimer) clearTimeout(suggestTimer);

  if (q.length < 2) {
    nameSuggestions.value = [];
    showSuggestions.value = false;
    return;
  }

  suggestTimer = setTimeout(async () => {
    try {
      const res = await inventoryApi.suggestFromCatalog(q, 8);
      // El usuario pudo seguir escribiendo; ignorar respuestas obsoletas.
      if (form.name.trim() !== q) return;
      nameSuggestions.value = res.data || [];
      showSuggestions.value = nameSuggestions.value.length > 0;
    } catch (error) {
      nameSuggestions.value = [];
      showSuggestions.value = false;
    }
  }, 300);
};

const selectSuggestion = (s) => {
  suppressSuggest = true;
  form.name = s.nombre;
  // Prellenar precio referencial solo si el campo está vacío (siempre editable).
  if (s.precio_referencial != null && (form.price === '' || form.price === null)) {
    form.price = String(s.precio_referencial);
  }
  if (s.barcode && !form.barcode) {
    form.barcode = s.barcode;
  }
  nameSuggestions.value = [];
  showSuggestions.value = false;
  highlightedIndex.value = -1;
};

const onSuggestKeydown = (event) => {
  if (!showSuggestions.value || !nameSuggestions.value.length) return;

  if (event.key === 'ArrowDown') {
    event.preventDefault();
    highlightedIndex.value = (highlightedIndex.value + 1) % nameSuggestions.value.length;
  } else if (event.key === 'ArrowUp') {
    event.preventDefault();
    highlightedIndex.value = highlightedIndex.value <= 0
      ? nameSuggestions.value.length - 1
      : highlightedIndex.value - 1;
  } else if (event.key === 'Enter') {
    if (highlightedIndex.value >= 0) {
      event.preventDefault();
      selectSuggestion(nameSuggestions.value[highlightedIndex.value]);
    }
  } else if (event.key === 'Escape') {
    showSuggestions.value = false;
  }
};

const onNameBlur = () => {
  // Retraso para permitir el mousedown sobre una sugerencia antes de ocultar.
  setTimeout(() => { showSuggestions.value = false; }, 150);
};

const clearImage = () => {
  imageFile.value = null;
  if (imagePreview.value) URL.revokeObjectURL(imagePreview.value);
  imagePreview.value = '';
  if (imageInput.value) imageInput.value.value = '';
};

const onImageSelected = (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowed.includes(file.type)) {
    showToast('error', 'Formato no válido. Usa JPG, PNG o WebP.');
    clearImage();
    return;
  }
  if (file.size > MAX_IMAGE_BYTES) {
    showToast('error', 'La imagen es muy grande (máximo 10MB).');
    clearImage();
    return;
  }

  // Validar dimensiones mínimas (el backend exige al menos 600x600).
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
    if (img.naturalWidth < MIN_IMAGE_DIMENSION || img.naturalHeight < MIN_IMAGE_DIMENSION) {
      showToast('error', 'La imagen debe ser de al menos 600×600 px.');
      URL.revokeObjectURL(url);
      clearImage();
      return;
    }
    // Imagen válida
    if (imagePreview.value) URL.revokeObjectURL(imagePreview.value);
    imageFile.value = file;
    imagePreview.value = url;
  };
  img.onerror = () => {
    showToast('error', 'No se pudo leer la imagen.');
    URL.revokeObjectURL(url);
    clearImage();
  };
  img.src = url;
};

const handleSubmit = async () => {
  if (!isValid.value || submitting.value) return;

  submitting.value = true;
  try {
    const payload = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      barcode: form.barcode.trim(),
      price: parseFloat(form.price),
      cost: form.cost !== '' && form.cost !== null ? parseFloat(form.cost) : null,
      stock: form.stock,
      unlimited_stock: form.unlimited_stock,
      tax_affectation: form.tax_affectation,
      published: form.published,
      categories: form.category_id ? [form.category_id] : []
    };

    const result = await inventoryStore.createProduct(payload, imageFile.value);

    if (result.success) {
      if (result.imageError) {
        // El producto se creó pero la imagen no se pudo subir.
        showToast('info', 'Producto creado, pero la imagen no se pudo subir: ' + result.imageError, 4000);
        setTimeout(() => router.push('/inventory'), 2500);
      } else {
        showToast('success', 'Producto creado correctamente');
        setTimeout(() => router.push('/inventory'), 1200);
      }
    } else {
      showToast('error', result.message || 'No se pudo crear el producto');
    }
  } catch (error) {
    console.error('Error creating product:', error);
    showToast('error', error.message || 'No se pudo crear el producto');
  } finally {
    submitting.value = false;
  }
};

onMounted(async () => {
  if (!canCreate.value) {
    router.replace('/inventory');
    return;
  }
  try {
    const res = await inventoryApi.getCategories();
    if (res.success) categories.value = res.data;
  } catch (error) {
    console.error('Error loading categories:', error);
  }
});
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(1rem);
}
</style>
