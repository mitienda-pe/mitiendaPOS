import { ref } from 'vue';
import { customersApi } from '../services/customersApi';

/**
 * Búsqueda de un cliente por documento, con el mismo camino que usa el inicio de
 * venta: primero la base de la tienda y, si no está, RENIEC/SUNAT (Decolecta).
 *
 * Se extrajo de StartSaleModal para poder pedir el documento en otros momentos
 * del flujo — sobre todo al emitir el comprobante después de cobrar.
 */

/**
 * Cliente en el shape `customer{}` que espera el API (crear venta, cotización y
 * actualizar el receptor del comprobante). Espeja buildCustomerPayload del POS.
 *
 * @param {Object} customer Ficha de la BD de la tienda
 */
export function buildCustomerPayload(customer) {
  const c = customer;
  const docTypeRaw = c?.document_type || '1';
  const isRuc = docTypeRaw === 'ruc' || docTypeRaw === '2' || docTypeRaw === '6';
  const docType = isRuc ? '2' : (docTypeRaw === 'dni' || docTypeRaw === '1' ? '1' : docTypeRaw);

  const base = {
    id: c?.id || null,
    email: c?.email || c?.correoElectronico || c?.correo || c?.tiendacliente_correo_electronico || c?.tiendacliente_correo || '',
    phone: c?.phone || c?.telefono || c?.tiendacliente_telefono || '',
    document_number: c?.document_number || c?.numeroDocumento || '',
    document_type: docType
  };

  if (isRuc) {
    // Domicilio fiscal: de la dirección "Fiscal" del cliente registrado (trae el
    // ubigeo_id ya resuelto) o, si no existe, de la predeterminada.
    const addresses = Array.isArray(c?.addresses) ? c.addresses : [];
    const fiscal = addresses.find(a => a?.label === 'Fiscal')
      || addresses.find(a => a?.is_default)
      || addresses[0];

    return {
      ...base,
      business_name: c?.business_name || c?.name || 'EMPRESA',
      name: '',
      lastname: '',
      fiscal_address: fiscal?.address || c?.direccion || '',
      fiscal_ubigeo_id: fiscal?.ubigeo_id || 0,
      fiscal_ubigeo: c?.ubigeo || ''
    };
  }

  let firstName = '';
  let lastName = '';
  if (c?.nombres || c?.apellidos) {
    firstName = c?.nombres || '';
    lastName = c?.apellidos || '';
  } else if (c?.name) {
    const parts = (c.name || 'Cliente General').trim().split(' ');
    firstName = parts[0] || '';
    lastName = parts.slice(1).join(' ') || '';
  } else {
    firstName = 'Cliente';
    lastName = 'General';
  }

  return { ...base, name: firstName, lastname: lastName, business_name: '' };
}

/**
 * Convierte la respuesta de RENIEC/SUNAT a una ficha con la misma forma que las
 * de la tienda, para poder usarla como `selectedCustomer` del carrito. No se
 * guarda en la base: es un cliente de paso.
 */
function buildRecordFromLookup(lookup, docKind, documentNumber) {
  if (docKind === 'RUC') {
    return {
      id: null,
      document_type: '2',
      document_number: documentNumber,
      name: lookup.razonSocial || 'EMPRESA',
      business_name: lookup.razonSocial || 'EMPRESA',
      direccion: lookup.direccion || '',
      ubigeo: lookup.ubigeo || ''
    };
  }

  return {
    id: null,
    document_type: '1',
    document_number: documentNumber,
    nombres: lookup.nombres || '',
    apellidos: `${lookup.apellidoPaterno || ''} ${lookup.apellidoMaterno || ''}`.trim(),
    name: `${lookup.nombres || ''} ${lookup.apellidoPaterno || ''}`.trim()
  };
}

/**
 * Convierte la respuesta de RENIEC/SUNAT al shape `customer{}` del API.
 * No hay ficha en la tienda, así que va sin `id`.
 */
function buildPayloadFromLookup(lookup, docKind, documentNumber) {
  if (docKind === 'RUC') {
    return {
      id: null,
      email: '',
      phone: '',
      document_number: documentNumber,
      document_type: '2',
      business_name: lookup.razonSocial || 'EMPRESA',
      name: '',
      lastname: '',
      fiscal_address: lookup.direccion || '',
      fiscal_ubigeo_id: 0,
      fiscal_ubigeo: lookup.ubigeo || ''
    };
  }

  return {
    id: null,
    email: '',
    phone: '',
    document_number: documentNumber,
    document_type: '1',
    business_name: '',
    name: lookup.nombres || '',
    lastname: `${lookup.apellidoPaterno || ''} ${lookup.apellidoMaterno || ''}`.trim()
  };
}

/** Nombre legible para confirmarle al cajero a quién le va a emitir. */
function displayNameOf(payload) {
  if (payload.business_name) return payload.business_name;
  return `${payload.name || ''} ${payload.lastname || ''}`.trim();
}

export function useDocumentLookup() {
  const searching = ref(false);
  const error = ref(null);

  /**
   * @param {string} documentNumber
   * @param {'DNI'|'RUC'} docKind
   * @returns {Promise<{found: boolean, source: 'db'|'sunat'|null, displayName: string,
   *                     customer: Object|null, record: Object|null}>}
   *          `customer` va al API; `record` es la ficha para el carrito del POS.
   */
  const lookupDocument = async (documentNumber, docKind) => {
    error.value = null;

    const expectedLength = docKind === 'DNI' ? 8 : 11;
    if (!documentNumber || documentNumber.length !== expectedLength) {
      error.value = `El ${docKind} debe tener ${expectedLength} dígitos`;
      return { found: false, source: null, displayName: '', customer: null, record: null };
    }

    searching.value = true;

    try {
      // Códigos internos de MiTienda: DNI=1, RUC=2
      const documentType = docKind === 'DNI' ? '1' : '2';
      const searchResponse = await customersApi.searchByDocument(documentNumber, documentType);

      if (searchResponse.success && searchResponse.found) {
        const customer = buildCustomerPayload(searchResponse.data);
        return {
          found: true,
          source: 'db',
          displayName: displayNameOf(customer) || searchResponse.data?.name || '',
          customer,
          record: searchResponse.data
        };
      }

      const lookupResponse = await customersApi.lookupDocument(documentNumber, docKind.toLowerCase());

      // `success` puede venir true con data vacía; sin el guard reventaría al mapear.
      if (lookupResponse.success && lookupResponse.data) {
        const customer = buildPayloadFromLookup(lookupResponse.data, docKind, documentNumber);
        return {
          found: true,
          source: 'sunat',
          displayName: displayNameOf(customer),
          customer,
          record: buildRecordFromLookup(lookupResponse.data, docKind, documentNumber)
        };
      }

      error.value = docKind === 'RUC'
        ? 'No se encontró ese RUC en SUNAT. Verifica el número.'
        : 'No se encontró ese DNI en RENIEC. Verifica el número.';

      return { found: false, source: null, displayName: '', customer: null, record: null };
    } catch (err) {
      console.error('[useDocumentLookup] Error buscando el documento:', err);
      error.value = 'No se pudo consultar el documento. Intenta nuevamente.';
      return { found: false, source: null, displayName: '', customer: null, record: null };
    } finally {
      searching.value = false;
    }
  };

  return { searching, error, lookupDocument };
}
