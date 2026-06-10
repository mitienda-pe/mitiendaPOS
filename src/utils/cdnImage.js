// Hosts que soportan resize on-the-fly vía ?w=&q= (worker CDN + Images binding).
// Mismo patrón que cdnResized() en la app Kotlin y cdnThumb() en el storefront.
const RESIZABLE_HOSTS = ['cdn.tiendabox.co', 'cdn.mitienda.pe'];

/**
 * Normaliza una URL de imagen del CDN a una variante pequeña.
 * La API entrega r2_url crudos (original 1080x1080+); renderizarlos como
 * thumbnail descarga la imagen completa. Hosts no redimensionables
 * (CloudFront legacy) se devuelven intactos.
 */
export function cdnThumb(url, width = 200, quality = 80) {
  if (!url || typeof url !== 'string') return url;
  try {
    const u = new URL(url);
    if (!RESIZABLE_HOSTS.includes(u.hostname)) return url;
    u.searchParams.set('w', String(width));
    u.searchParams.set('q', String(quality));
    return u.toString();
  } catch {
    return url;
  }
}
