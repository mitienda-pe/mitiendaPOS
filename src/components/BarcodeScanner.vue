<template>
  <div v-if="modelValue" class="fixed z-50 inset-0 overflow-y-auto">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 bg-gray-900 bg-opacity-90 transition-opacity" @click="closeScanner"></div>
      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg leading-6 font-medium text-gray-900 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 7V5a2 2 0 0 1 2-2h2"/>
                <path d="M17 3h2a2 2 0 0 1 2 2v2"/>
                <path d="M21 17v2a2 2 0 0 1-2 2h-2"/>
                <path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
                <rect width="10" height="10" x="7" y="7" rx="1"/>
              </svg>
              Escanear Código de Barras
            </h3>
            <button @click="closeScanner" class="text-gray-400 hover:text-gray-500 focus:outline-none">
              <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Vista de cámara -->
          <div class="relative bg-black rounded-lg overflow-hidden">
            <div id="barcode-scanner">
              <!-- QuaggaJS se montará aquí -->
            </div>

            <!-- Overlay con guía visual -->
            <div class="absolute inset-0 pointer-events-none flex items-center justify-center" style="z-index: 10;">
              <div class="border-4 border-green-400 rounded-lg shadow-lg" style="width: 80%; height: 50%;"></div>
            </div>
          </div>

          <!-- Instrucciones -->
          <div class="mt-4 p-3 bg-blue-50 rounded-lg">
            <p class="text-sm text-blue-800 text-center">
              📸 Posiciona el código de barras dentro del área verde
            </p>
          </div>

          <!-- Resultado -->
          <div v-if="lastDetected" class="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-green-800">Código detectado:</p>
                <p class="text-lg font-bold text-green-900 mt-1">{{ lastDetected }}</p>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
          </div>

          <!-- Estado del escáner -->
          <div v-if="!isScanning && !error" class="mt-4 text-center">
            <div class="inline-flex items-center px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg">
              <svg class="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Iniciando cámara...
            </div>
          </div>

          <!-- Error -->
          <div v-if="error" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-sm font-medium text-red-800">⚠️ Error al acceder a la cámara</p>
            <p class="text-sm text-red-600 mt-1">{{ error }}</p>
            <button @click="retryScanner" class="mt-3 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700">
              Reintentar
            </button>
          </div>
        </div>

        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button @click="closeScanner" type="button" class="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue';
import Quagga from '@ericblade/quagga2';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits(['update:modelValue', 'detected']);

const isScanning = ref(false);
const lastDetected = ref('');
const error = ref('');
const isProcessing = ref(false); // Evitar detecciones múltiples

// Iniciar el escáner
const startScanner = async () => {
  error.value = '';
  isScanning.value = false;
  isProcessing.value = false; // Resetear flag al iniciar

  try {
    const config = {
      inputStream: {
        type: 'LiveStream',
        target: document.querySelector('#barcode-scanner'),
        constraints: {
          width: { min: 640, ideal: 1280 },
          height: { min: 480, ideal: 720 },
          facingMode: 'environment',
          aspectRatio: { ideal: 1.7777777778 }
        }
      },
      locator: {
        patchSize: 'medium',
        halfSample: true
      },
      numOfWorkers: 2,
      frequency: 10,
      decoder: {
        readers: [
          'ean_reader',
          'code_128_reader',
          'code_39_reader',
          'upc_reader',
          'ean_8_reader'
        ]
      },
      locate: true
    };

    console.log('🚀 Initializing QuaggaJS with config:', config);

    Quagga.init(config, (err) => {
      if (err) {
        console.error('❌ QuaggaJS Error:', err);
        error.value = err.message || 'No se pudo acceder a la cámara. Verifica los permisos.';
        isScanning.value = false;
        return;
      }

      console.log('✅ QuaggaJS initialized successfully');

      Quagga.start();
      isScanning.value = true;

      // Verificar que el video se haya creado después de start()
      setTimeout(() => {
        const video = document.querySelector('#barcode-scanner video');
        const canvas = document.querySelector('#barcode-scanner canvas');

        console.log('📹 Video element after start:', video);
        console.log('🎨 Canvas element after start:', canvas);
        console.log('📹 Video srcObject:', video?.srcObject);
        console.log('📹 Video readyState:', video?.readyState);

        if (video && !video.srcObject) {
          console.warn('⚠️ Video no tiene srcObject asignado');
        }
      }, 500);
    });

    // Evento de detección
    Quagga.onDetected((result) => {
      if (result && result.codeResult && result.codeResult.code) {
        // Evitar múltiples detecciones del mismo código
        if (isProcessing.value) {
          console.log('⏭️ Skipping duplicate detection while processing');
          return;
        }

        const code = result.codeResult.code;
        console.log('📦 Barcode detected:', code);

        // Marcar como procesando para evitar duplicados
        isProcessing.value = true;

        // Actualizar último código detectado
        lastDetected.value = code;

        // Detener el escáner inmediatamente
        Quagga.stop();
        isScanning.value = false;

        // Emitir el código detectado
        emit('detected', code);

        // Cerrar automáticamente después de detectar
        setTimeout(() => {
          closeScanner();
        }, 1500);
      }
    });

  } catch (err) {
    console.error('❌ Error starting scanner:', err);
    error.value = 'Error al iniciar el escáner. Por favor, intenta nuevamente.';
    isScanning.value = false;
  }
};

// Detener el escáner
const stopScanner = () => {
  try {
    if (isScanning.value) {
      Quagga.stop();
      isScanning.value = false;
      console.log('🛑 Scanner stopped');
    }
  } catch (err) {
    console.error('Error stopping scanner:', err);
  }
};

// Cerrar modal
const closeScanner = () => {
  stopScanner();
  lastDetected.value = '';
  error.value = '';
  isProcessing.value = false; // Resetear flag de procesamiento
  emit('update:modelValue', false);
};

// Reintentar
const retryScanner = () => {
  stopScanner();
  setTimeout(() => {
    startScanner();
  }, 500);
};

// Observar cambios en modelValue
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    // Dar tiempo para que el DOM se monte
    setTimeout(() => {
      startScanner();
    }, 300);
  } else {
    stopScanner();
  }
});

// Limpiar al desmontar
onUnmounted(() => {
  stopScanner();
});
</script>

<style>
#barcode-scanner {
  position: relative;
  width: 100%;
  height: 400px;
  background: #000;
}

#barcode-scanner video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
}

#barcode-scanner canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  pointer-events: none;
}

#barcode-scanner canvas.drawingBuffer {
  z-index: 2;
}
</style>
