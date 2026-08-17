import apiClient from './axios';

/**
 * Inventario por almacén: kardex, movimientos manuales y transferencias.
 *
 * Distinto de `inventoryApi.js`, que pese al nombre gestiona el CATÁLOGO de
 * productos (la sección "Inventario" del POS). Acá vive el movimiento de stock.
 *
 * Todo cuelga de `/inventory/*` en el API y del módulo `mod_stock_sucursal`
 * (flag `branch_stock_enabled` → `authStore.canBranchStock`).
 */

/** Tipos que el usuario puede registrar a mano desde el POS. */
export const MANUAL_TYPES = [
  { value: 'entrada', label: 'Ingreso', hint: 'Suma stock: llegó mercadería, devolución de un cliente.' },
  { value: 'salida', label: 'Salida', hint: 'Resta stock: consumo interno, muestra, traslado fuera del sistema.' },
  { value: 'merma', label: 'Merma', hint: 'Resta stock por pérdida: rotura, vencimiento, robo.' },
];

export const MOVEMENT_LABELS = {
  entrada: 'Ingreso',
  salida: 'Salida',
  merma: 'Merma',
  ajuste: 'Ajuste',
  import: 'Importación',
  reconcile: 'Reconciliación',
  devolucion: 'Devolución',
  venta: 'Venta',
  venta_reversa: 'Anulación de venta',
  transferencia_salida: 'Transferencia (salida)',
  transferencia_entrada: 'Transferencia (entrada)',
};

/** Verde lo que suma, rojo lo que resta, azul los traslados. */
export function movementTone(tipo) {
  if (['venta', 'salida', 'merma'].includes(tipo)) return 'red';
  if (['entrada', 'venta_reversa', 'devolucion'].includes(tipo)) return 'green';
  if (String(tipo).startsWith('transferencia')) return 'blue';
  return 'gray';
}

function unwrap(response) {
  const body = response?.data ?? {};
  return body.data ?? body;
}

export const stockMovementsApi = {
  /** Almacenes de la tienda (todas sus direcciones) + cuál es el de por defecto. */
  async warehouses() {
    const response = await apiClient.get('/inventory/warehouses');
    return unwrap(response);
  },

  /** Saldo del producto y de sus variantes en un almacén. */
  async stock(productoId, almacenId) {
    const params = new URLSearchParams({ producto_id: String(productoId) });
    if (almacenId) params.append('almacen_id', String(almacenId));

    const response = await apiClient.get(`/inventory/stock?${params.toString()}`);
    return unwrap(response);
  },

  /** Kardex paginado. Filtros: producto_id, almacen_id, tipo, desde, hasta, page. */
  async kardex(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await apiClient.get(`/inventory/kardex?${params.toString()}`);
    return unwrap(response);
  },

  /** Ingreso / salida / merma. items: [{ producto_id, productoatributo_id?, cantidad }] */
  async createMovement({ tipo, almacenId, motivo, items }) {
    const response = await apiClient.post('/inventory/movements', {
      tipo,
      almacen_id: almacenId,
      motivo: motivo || undefined,
      items,
    });
    return unwrap(response);
  },

  async transfers(page = 1) {
    const response = await apiClient.get(`/inventory/transfers?page=${page}`);
    return unwrap(response);
  },

  async transfer(id) {
    const response = await apiClient.get(`/inventory/transfers/${id}`);
    return unwrap(response);
  },

  async createTransfer({ origenId, destinoId, nota, items }) {
    const response = await apiClient.post('/inventory/transfers', {
      origen_id: origenId,
      destino_id: destinoId,
      nota: nota || undefined,
      items,
    });
    return unwrap(response);
  },

  /** Activación del kardex (flag de tienda). El backend valida la elegibilidad. */
  async getActivation() {
    const response = await apiClient.get('/store-config');
    const cfg = unwrap(response) ?? {};
    return { enabled: Number(cfg.tiendageneral_sw_inventario) === 1 };
  },

  async setActivation(enabled) {
    const response = await apiClient.put('/store-config', {
      tiendageneral_sw_inventario: enabled ? 1 : 0,
    });
    const cfg = unwrap(response) ?? {};
    return { enabled: Number(cfg.tiendageneral_sw_inventario) === 1 };
  },
};

export default stockMovementsApi;
