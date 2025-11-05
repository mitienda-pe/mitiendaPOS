<template>
  <Transition name="fade">
    <div v-if="show" class="fixed inset-0 z-[9999] overflow-y-auto bg-gray-900 bg-opacity-95 flex items-center justify-center">
      <div class="bg-white rounded-lg shadow-2xl max-w-md w-full p-8">
        <!-- Processing Icon -->
        <div class="flex justify-center mb-6">
          <div class="bg-green-100 rounded-full p-6">
            <svg class="w-16 h-16 text-green-600 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        </div>

        <h2 class="text-2xl font-bold text-center mb-2 text-gray-900">
          {{ title || 'Procesando...' }}
        </h2>

        <p class="text-gray-600 text-center text-sm">
          {{ message || 'Por favor espere mientras procesamos su solicitud' }}
        </p>

        <!-- Progress indicator dots -->
        <div class="flex justify-center mt-6 space-x-2">
          <div class="w-2 h-2 bg-green-600 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
          <div class="w-2 h-2 bg-green-600 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
          <div class="w-2 h-2 bg-green-600 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
defineProps({
  show: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Procesando...'
  },
  message: {
    type: String,
    default: 'Por favor espere mientras procesamos su solicitud'
  }
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
