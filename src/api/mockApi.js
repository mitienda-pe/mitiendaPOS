// Mock user data
const users = [
  { id: 1, username: 'cajero', password: '123456', name: 'Juan Pérez', role: 'cajero' },
  { id: 2, username: 'supervisor', password: '123456', name: 'Ana García', role: 'supervisor' },
  { id: 3, username: 'admin', password: '123456', name: 'Carlos Rodríguez', role: 'administrador' }
];

// Mock API responses
export const mockApi = {
  async login(username, password) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
      return {
        data: {
          token: 'mock-jwt-token',
          user: {
            id: user.id,
            name: user.name,
            role: user.role
          }
        }
      };
    }
    
    throw {
      response: {
        status: 401,
        data: {
          message: 'Credenciales inválidas'
        }
      }
    };
  },

  async getProfile() {
    // This would normally fetch the user profile using the JWT token
    // For mock purposes, we'll return a default profile
    return {
      data: {
        id: 1,
        name: 'Usuario de Prueba',
        role: 'cajero'
      }
    };
  }
};
