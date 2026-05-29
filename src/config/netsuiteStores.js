// Tiendas con NetSuite habilitado. Whitelist temporal mientras se propaga
// el flag backend `netsuite_enabled` (ver /pos/access). NO es control de
// seguridad: solo oculta el menú. La protección real vive en el backend.
export const NETSUITE_STORE_IDS = [24282, 4359, 12097];

export function storeHasNetsuite(store) {
  // Preferir el flag real del backend si ya viene en el objeto store.
  if (store && typeof store.netsuite_enabled === 'boolean') {
    return store.netsuite_enabled;
  }
  // Fallback: whitelist por ID (sesiones viejas / antes de propagar el flag).
  return store?.id != null && NETSUITE_STORE_IDS.includes(Number(store.id));
}
