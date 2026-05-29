<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <div class="flex justify-center">
          <img src="@/assets/logo-mitiendapos-wb.svg" alt="MiTiendaPOS Logo" class="h-12" />
        </div>
        <h2 class="mt-4 text-center text-2xl font-extrabold text-gray-900">
          Crea tu cuenta
        </h2>
        <p class="mt-2 text-center text-sm text-gray-500">
          Prueba gratis de 14 días. Sin tarjeta.
        </p>
      </div>

      <div v-if="error" class="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{{ error }}</div>

      <!-- Paso 1: datos -->
      <form v-if="step === 1" class="mt-8 space-y-4" @submit.prevent="handleSendOtp">
        <div>
          <label class="form-label">Nombre del negocio</label>
          <input v-model="form.business_name" type="text" required class="input-field" placeholder="Mi Bodega" />
        </div>
        <div>
          <label class="form-label">Tu nombre</label>
          <input v-model="form.admin_name" type="text" required class="input-field" placeholder="Nombre y apellido" />
        </div>
        <div>
          <label class="form-label">Correo electrónico</label>
          <input v-model="form.email" type="email" required class="input-field" placeholder="tu@correo.com" />
        </div>
        <div>
          <label class="form-label">Contraseña</label>
          <input v-model="form.password" type="password" required class="input-field" placeholder="Mínimo 8 caracteres" />
        </div>
        <div>
          <label class="form-label">Celular <span class="text-gray-400 font-normal">(opcional)</span></label>
          <input v-model="form.phone" type="tel" class="input-field" placeholder="999 999 999" />
        </div>

        <p class="text-xs text-gray-400 text-center flex items-center justify-center gap-1">
          <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          Protegido con verificación anti-bots
        </p>

        <button type="submit" :disabled="loading" class="btn-primary w-full justify-center">
          {{ loading ? loadingLabel : 'Continuar' }}
        </button>
      </form>

      <!-- Paso 2: OTP -->
      <form v-else class="mt-8 space-y-4" @submit.prevent="handleRegister">
        <p class="text-sm text-gray-600 text-center">
          Ingresa el código de 6 dígitos que enviamos a
          <strong>{{ maskedRecipient || form.email }}</strong>.
        </p>
        <div>
          <label class="form-label">Código de verificación</label>
          <input
            v-model="otpCode"
            type="text"
            inputmode="numeric"
            maxlength="6"
            required
            class="input-field text-center tracking-[0.5em] text-lg"
            placeholder="------"
          />
        </div>

        <button type="submit" :disabled="loading || otpCode.length !== 6" class="btn-primary w-full justify-center">
          {{ loading ? 'Creando tu tienda...' : 'Crear cuenta' }}
        </button>

        <div class="text-center">
          <button type="button" class="text-sm text-gray-500 hover:text-gray-700" :disabled="loading" @click="goBack">
            ← Cambiar mis datos
          </button>
        </div>
      </form>

      <div class="text-center mt-4">
        <router-link to="/login" class="text-sm text-primary-600 hover:text-primary-500 font-medium">
          ¿Ya tienes cuenta? Inicia sesión
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { authApi } from '../services/authApi';
import { solveCaptcha } from '../services/capSolver';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();

const step = ref(1);
const loading = ref(false);
const loadingLabel = ref('Enviando código...');
const error = ref('');
const sessionId = ref('');
const maskedRecipient = ref('');
const otpCode = ref('');

const form = reactive({
  business_name: '',
  admin_name: '',
  email: '',
  password: '',
  phone: '',
});

const handleSendOtp = async () => {
  error.value = '';
  if (form.password.length < 8) {
    error.value = 'La contraseña debe tener al menos 8 caracteres.';
    return;
  }
  loading.value = true;
  try {
    // Resolver el CAPTCHA (invisible) antes de pedir el OTP.
    loadingLabel.value = 'Verificando que eres humano...';
    const captchaToken = await solveCaptcha();

    loadingLabel.value = 'Enviando código...';
    const res = await authApi.registerSendOtp({
      email: form.email.trim(),
      name: form.admin_name.trim(),
      captchaToken,
    });
    if (res?.has_account) {
      error.value = 'Ya existe una cuenta con este correo. Inicia sesión.';
      return;
    }
    if (res?.error) {
      error.value = res.message || 'No se pudo enviar el código.';
      return;
    }
    sessionId.value = res.session_id;
    maskedRecipient.value = res.masked_recipient || '';
    step.value = 2;
  } catch (e) {
    error.value = e?.response?.data?.message || 'No se pudo enviar el código. Intenta de nuevo.';
  } finally {
    loading.value = false;
  }
};

const handleRegister = async () => {
  error.value = '';
  loading.value = true;
  try {
    const data = await authApi.register({
      email: form.email.trim(),
      password: form.password,
      business_name: form.business_name.trim(),
      admin_name: form.admin_name.trim(),
      phone: form.phone.trim(),
      country: 'PE',
      session_id_email: sessionId.value,
      code_email: otpCode.value,
    });

    if (!data?.access_token) {
      error.value = data?.message || 'No se pudo completar el registro.';
      return;
    }
    await authStore.loginWithRegistration(data);
  } catch (e) {
    error.value = e?.response?.data?.message || 'No se pudo completar el registro. Verifica el código.';
  } finally {
    loading.value = false;
  }
};

const goBack = () => {
  step.value = 1;
  otpCode.value = '';
  error.value = '';
};
</script>
