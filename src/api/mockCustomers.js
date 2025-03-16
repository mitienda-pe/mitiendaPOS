// Mock customers data
let customers = [
  {
    id: 1,
    tipoDoc: 'DNI',
    numDoc: '12345678',
    nombres: 'Juan',
    apellidos: 'Pérez López',
    direccion: 'Av. Example 123',
    email: 'juan@ejemplo.com',
    telefono: '987654321',
    ultimaCompra: '2025-03-10T15:30:00Z'
  },
  {
    id: 2,
    tipoDoc: 'RUC',
    numDoc: '20123456789',
    razonSocial: 'Empresa Ejemplo S.A.C.',
    direccion: 'Jr. Business 456',
    email: 'contacto@empresa.com',
    telefono: '912345678',
    ultimaCompra: '2025-03-09T14:20:00Z'
  }
];

export const mockCustomersApi = {
  // Get all customers with optional filtering
  async getCustomers({ search = '', tipoDoc = '', numDoc = '' } = {}) {
    await new Promise(resolve => setTimeout(resolve, 300));

    return {
      data: customers.filter(c => {
        const matchesTipoDoc = tipoDoc ? c.tipoDoc === tipoDoc : true;
        const matchesNumDoc = numDoc ? c.numDoc.includes(numDoc) : true;
        const matchesSearch = search ? (c.nombres?.toLowerCase().includes(search.toLowerCase()) ||
        c.apellidos?.toLowerCase().includes(search.toLowerCase()) ||
        c.razonSocial?.toLowerCase().includes(search.toLowerCase())) : true;
        return matchesTipoDoc && matchesNumDoc && matchesSearch;
      })
    };
  },

  // Get customer by document
  async getCustomerByDoc(tipoDoc, numDoc) {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const customer = customers.find(c => 
      c.tipoDoc === tipoDoc && c.numDoc === numDoc
    );

    return {
      data: customer || null
    };
  },

  // Add new customer
  async addCustomer(customerData) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newCustomer = {
      id: Math.max(...customers.map(c => c.id)) + 1,
      ...customerData,
      ultimaCompra: new Date().toISOString()
    };

    customers.push(newCustomer);

    return {
      data: newCustomer
    };
  },

  // Update customer
  async updateCustomer(id, customerData) {
    await new Promise(resolve => setTimeout(resolve, 300));

    const index = customers.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error('Cliente no encontrado');
    }

    const updatedCustomer = {
      ...customers[index],
      ...customerData,
    };

    customers[index] = updatedCustomer;

    return {
      data: updatedCustomer
    };
  },

  // Delete customer
  async deleteCustomer(id) {
    await new Promise(resolve => setTimeout(resolve, 300));

    const index = customers.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error('Cliente no encontrado');
    }

    customers = customers.filter(c => c.id !== id);

    return {
      data: { success: true }
    };
  }
};
