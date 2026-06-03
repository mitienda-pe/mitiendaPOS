import { watch } from 'vue';

// IDs del widget de Tawk.to (propiedad / widget)
const TAWK_PROPERTY_ID = '6a20989a707d6b1c2e40b9c4';
const TAWK_WIDGET_ID = '1jq7l87j2';

let loaded = false;

/**
 * Inyecta el script del widget de Tawk.to una sola vez.
 * Idempotente: llamadas posteriores no vuelven a cargar el script.
 */
function loadScript() {
  if (loaded || typeof document === 'undefined') return;
  loaded = true;

  window.Tawk_API = window.Tawk_API || {};
  window.Tawk_LoadStart = new Date();

  const s1 = document.createElement('script');
  const s0 = document.getElementsByTagName('script')[0];
  s1.async = true;
  s1.src = `https://embed.tawk.to/${TAWK_PROPERTY_ID}/${TAWK_WIDGET_ID}`;
  s1.setAttribute('charset', 'UTF-8');
  s1.setAttribute('crossorigin', '*');
  s0.parentNode.insertBefore(s1, s0);
}

/**
 * Envía atributos del visitante a Tawk.to para dar contexto a soporte
 * (nombre del cajero/usuario, tienda, sucursal). Se reintenta vía onLoad
 * si el widget aún no terminó de cargar.
 */
function setVisitor(attrs) {
  const api = window.Tawk_API;
  if (!api) return;

  const apply = () => {
    try {
      if (typeof api.setAttributes === 'function') {
        api.setAttributes(attrs, () => {});
      }
    } catch (e) {
      console.warn('[Tawk] No se pudieron enviar atributos del visitante', e);
    }
  };

  // Si el widget ya cargó, aplicar de inmediato; si no, esperar a onLoad.
  if (api.setAttributes) {
    apply();
  } else {
    const prevOnLoad = api.onLoad;
    api.onLoad = function () {
      if (typeof prevOnLoad === 'function') prevOnLoad();
      apply();
    };
  }
}

/**
 * Carga el widget de Tawk.to y mantiene sincronizados los atributos del
 * visitante con la sesión del cajero/tienda mientras esté autenticado.
 *
 * @param {import('vue').Ref|object} authStore
 * @param {import('vue').Ref|object} cashierStore
 */
export function useTawkTo(authStore, cashierStore) {
  loadScript();

  watch(
    () => ({
      store: authStore.selectedStore?.name,
      tiendaId: authStore.selectedStore?.id ?? authStore.tokenTiendaId,
      user: authStore.user?.name,
      cashier: cashierStore?.cashierName,
      sucursal: cashierStore?.sucursal?.nombre,
    }),
    (ctx) => {
      if (!ctx.store && !ctx.user && !ctx.cashier) return;

      const name = ctx.cashier || ctx.user || 'Cajero POS';
      setVisitor({
        name,
        store: ctx.store || '',
        'tienda-id': ctx.tiendaId != null ? String(ctx.tiendaId) : '',
        sucursal: ctx.sucursal || '',
        origen: 'POS',
      });
    },
    { immediate: true }
  );
}
