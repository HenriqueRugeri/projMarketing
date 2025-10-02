import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Configurar axios
axios.defaults.baseURL = API_BASE_URL;

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Verificar token ao carregar a aplicação
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      // Configurar header de autorização
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Verificar se o token é válido
      verifyToken();
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async () => {
    try {
      const response = await axios.get('/auth/verify');
      setUser(response.data.user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Token inválido:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await axios.post('/auth/login', {
        username,
        password
      });

      const { token, user } = response.data;
      
      // Salvar token
      localStorage.setItem('authToken', token);
      
      // Configurar header de autorização
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Atualizar estado
      setUser(user);
      setIsAuthenticated(true);
      
      return { success: true, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.error || 'Erro ao fazer login';
      return { success: false, message };
    }
  };

  const logout = () => {
    // Remover token
    localStorage.removeItem('authToken');
    
    // Remover header de autorização
    delete axios.defaults.headers.common['Authorization'];
    
    // Limpar estado
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
