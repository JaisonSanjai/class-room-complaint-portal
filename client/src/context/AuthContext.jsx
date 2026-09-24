import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.error('Session validation failed:', err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (role, id, password) => {
    const res = await api.post('/auth/login', { role, id, password });
    if (res.data.success) {
      const { token: receivedToken, user: receivedUser } = res.data;
      setToken(receivedToken);
      setUser(receivedUser);
      localStorage.setItem('token', receivedToken);
      localStorage.setItem('user', JSON.stringify(receivedUser));
      return receivedUser;
    }
    throw new Error(res.data.message || 'Login failed');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const toggleStaffNotifications = async () => {
    try {
      const res = await api.patch('/auth/toggle-notifications');
      if (res.data.success) {
        const updatedUser = { ...user, notifications_enabled: res.data.notifications_enabled };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return res.data.notifications_enabled;
      }
    } catch (err) {
      console.error('Failed to toggle notifications:', err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      logout,
      toggleStaffNotifications,
      isAuthenticated: Boolean(user && token)
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
