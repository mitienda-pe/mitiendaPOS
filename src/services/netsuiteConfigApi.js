import apiClient from './axios';

/**
 * Single API client for the NetSuite configuration screens.
 *
 * Mirrors the backend endpoints in:
 *   - app/Controllers/V1/NetsuiteCredentials.php
 *   - app/Controllers/V1/NetsuiteConfigValidation.php
 */
export const netsuiteConfigApi = {
  /**
   * Returns the credenciales row for the current store. Secrets come back masked.
   * @param {number} tiendaId
   */
  async getCredentials(tiendaId) {
    const response = await apiClient.get(`/netsuite-credentials/tienda/${tiendaId}`);
    return response.data;
  },

  /**
   * Upsert the credenciales row. Only the keys present in `payload` are touched;
   * pass `null` (or empty string) to clear a field.
   *
   * Accepted keys (snake_case):
   *  account_id, consumer_key, consumer_secret, token_id, token_secret,
   *  subsidiary_id, location_id, ubicacion_serie_id, generic_customer_id,
   *  bonification_item_id, customer_category_id, price_level_id,
   *  department_id, class_id, currency_id, country_id, terms_id,
   *  tax_item_id, edoc_standard_id, receivables_account_id,
   *  entity_status_id, payment_method_id, default_zip_id,
   *  discount_item_id, default_salesrep_id,
   *  estado, autosync_enabled, delegate_billing,
   *  sync_mode, so_custom_form_id
   */
  async saveCredentials(tiendaId, payload) {
    const body = { tienda_id: tiendaId, ...payload };
    const response = await apiClient.post('/netsuite-credentials', body);
    return response.data;
  },

  /**
   * Run the configuration validator. Returns
   *   { error, data: { tienda_id, is_complete, issue_count, by_category, issues } }
   */
  async validate(tiendaId) {
    const url = tiendaId
      ? `/netsuite-config/validate/${tiendaId}`
      : '/netsuite-config/validate';
    const response = await apiClient.get(url);
    return response.data;
  },
};
