import api from './api';

const AuthService = {
  login: async (email, password) => {
    const response = await api.post('auth/login', { email, password });
    if (response.data.success) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : {};
  },

  isAuthenticated: () => {
    return localStorage.getItem('token') !== null;
  }
};

export default AuthService; 