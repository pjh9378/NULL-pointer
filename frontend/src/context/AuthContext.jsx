import { createContext, useContext, useState, useCallback } from 'react';
import { authApi } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token');
    const userInfo = localStorage.getItem('userInfo');
    return token && userInfo ? JSON.parse(userInfo) : null;
  });

  const login = useCallback(async (email, password) => {
    const { data } = await authApi.login({ email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('userInfo', JSON.stringify({
      email: data.email,
      username: data.username,
      role: data.role,
    }));
    setUser({ email: data.email, username: data.username, role: data.role });
  }, []);

  const signup = useCallback(async (formData) => {
    const { data } = await authApi.signup(formData);
    localStorage.setItem('token', data.token);
    localStorage.setItem('userInfo', JSON.stringify({
      email: data.email,
      username: data.username,
      role: data.role,
    }));
    setUser({ email: data.email, username: data.username, role: data.role });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
