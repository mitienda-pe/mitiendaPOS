import { ref, onMounted, onBeforeUnmount } from 'vue';

/**
 * Detecta despliegues nuevos comparando el buildId compilado en el bundle
 * contra el de /version.json (regenerado en cada build).
 *
 * El POS nunca recarga solo: el carrito vive en memoria y un refresh a mitad de
 * venta la perdería. Solo avisamos; el cajero decide cuándo actualizar.
 */

const CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutos
const FIRST_CHECK_DELAY = 15 * 1000; // no competir con la carga inicial

const newVersionAvailable = ref(false);
const latestVersion = ref(null);

const currentVersion = __APP_VERSION__;
const currentBuildId = __BUILD_ID__;

let intervalId = null;
let firstCheckId = null;
let listeners = 0;

async function checkVersion() {
  // En dev el version.json del disco es el del último build de producción:
  // siempre distinto, y el banner saldría en cada arranque.
  if (import.meta.env.DEV) return;
  if (newVersionAvailable.value) return;
  if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;

  try {
    const res = await fetch(`/version.json?_=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) return;
    const data = await res.json();
    if (data?.version && data.version !== currentBuildId) {
      latestVersion.value = data.appVersion || data.version;
      newVersionAvailable.value = true;
    }
  } catch {
    // Sin red o servidor caído: no molestamos al cajero.
  }
}

export function useVersionCheck() {
  onMounted(() => {
    listeners++;
    if (listeners === 1) {
      firstCheckId = setTimeout(checkVersion, FIRST_CHECK_DELAY);
      intervalId = setInterval(checkVersion, CHECK_INTERVAL);
    }
  });

  onBeforeUnmount(() => {
    listeners--;
    if (listeners === 0) {
      if (firstCheckId) clearTimeout(firstCheckId);
      if (intervalId) clearInterval(intervalId);
      firstCheckId = null;
      intervalId = null;
    }
  });

  function reload() {
    window.location.reload();
  }

  function dismiss() {
    newVersionAvailable.value = false;
  }

  return {
    newVersionAvailable,
    currentVersion,
    currentBuildId,
    latestVersion,
    checkVersion,
    reload,
    dismiss,
  };
}

/** Versión visible en la UI (menú, ayuda, soporte). */
export function useAppVersion() {
  return { currentVersion, currentBuildId };
}
