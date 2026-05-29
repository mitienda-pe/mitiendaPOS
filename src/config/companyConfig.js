/**
 * Valores por defecto (genéricos) para tickets cuando NO hay datos de la tienda.
 *
 * IMPORTANTE: NO hardcodear aquí datos de una empresa concreta. El POS es
 * multitenant: los datos reales de la empresa (razón social, RUC, logo,
 * dirección, teléfono) deben venir de la tienda autenticada
 * (`authStore.selectedStore`). Este objeto solo se usa como fallback neutro.
 */

export const COMPANY_CONFIG = {
  legalName: '',
  commercialName: '',
  ruc: '',
  logoUrl: null,
  website: '',

  sunat: {
    authorizationText: '',
    representationText: '',
  }
};

/**
 * Construye la información de empresa para el ticket a partir de la tienda
 * autenticada. Devuelve siempre un objeto con la misma forma que COMPANY_CONFIG.
 *
 * @param {Object|null} store - authStore.selectedStore
 * @returns {{legalName:string, commercialName:string, ruc:string, logoUrl:(string|null), website:string, sunat:{authorizationText:string, representationText:string}}}
 */
export const buildCompanyInfo = (store) => {
  const s = store || {};
  return {
    legalName: s.razonSocial || s.name || '',
    commercialName: s.name || s.razonSocial || '',
    ruc: s.ruc || '',
    logoUrl: s.logo || null,
    website: s.url || '',
    sunat: {
      authorizationText: '',
      representationText: '',
    }
  };
};
