<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <div class="flex justify-center">
          <img src="@/assets/logo-mitiendapos-wb.svg" alt="MiTiendaPOS Logo" class="h-12" />
        </div>
        <h2 class="mt-4 text-center text-2xl font-extrabold text-gray-900">
          Recuperar contraseña
        </h2>
        <p class="mt-2 text-center text-sm text-gray-500">
          Ingresa tu correo y te enviaremos un enlace para cambiar tu contraseña.
        </p>
      </div>

      <!-- Estado: formulario -->
      <form v-if="!emailSent" class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <div>
          <label for="email" class="sr-only">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            :disabled="loading"
            placeholder="tu@email.com"
            class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
        </div>

        <div v-if="error" class="text-red-600 text-sm text-center">{{ error }}</div>

        <button
          type="submit"
          :disabled="loading"
          class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
        >
          {{ loading ? 'Enviando...' : 'Enviar enlace' }}
        </button>
      </form>

      <!-- Estado: email enviado -->
      <div v-else class="text-center space-y-4">
        <div class="flex justify-center">
          <div class="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <svg class="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <p class="text-gray-700">
          Hemos enviado un enlace a <strong>{{ email }}</strong> para que cambies tu contraseña.
        </p>
        <p class="text-sm text-gray-500">
          Revisa tu bandeja de entrada y la carpeta de spam. El enlace expira en 1 hora.
        </p>
        <button
          :disabled="loading"
          class="text-sm text-primary-600 hover:text-primary-500 font-medium disabled:opacity-50"
          @click="handleSubmit"
        >
          Enviar de nuevo
        </button>
      </div>

      <div class="text-center mt-4">
        <router-link to="/login" class="text-sm text-primary-600 hover:text-primary-500 font-medium">
          ← Volver a iniciar sesión
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { authApi } from '../services/authApi';

const email = ref('');
const error = ref('');
const loading = ref(false);
const emailSent = ref(false);

const handleSubmit = async () => {
  error.value = '';

  if (!email.value || !email.value.includes('@')) {
    error.value = 'Ingresa un correo electrónico válido';
    return;
  }

  loading.value = true;
  try {
    await authApi.forgotPassword(email.value);
    emailSent.value = true;
  } catch (e) {
    error.value = e?.response?.data?.message || 'Error al enviar el enlace. Intenta de nuevo.';
  } finally {
    loading.value = false;
  }
};
</script>
