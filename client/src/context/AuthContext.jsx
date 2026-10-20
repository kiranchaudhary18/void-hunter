import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('void_hunter_token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user profile on mount if token exists
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.auth.getMe();
        if (response.success) {
          setUser(response.user);
          setProfile(response.profile);
        } else {
          logout();
        }
      } catch (err) {
        console.error('Failed to verify stored session:', err);
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    setError(null);
    setLoading(true);
    try {
      const response = await api.auth.login({ email, password });
      if (response.success) {
        localStorage.setItem('void_hunter_token', response.token);
        setToken(response.token);
        setUser(response.user);
        setProfile(response.profile);
        return { success: true };
      }
      throw new Error(response.message || 'Login failed');
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setError(null);
    setLoading(true);
    try {
      const response = await api.auth.register({ name, email, password });
      if (response.success) {
        localStorage.setItem('void_hunter_token', response.token);
        setToken(response.token);
        setUser(response.user);
        setProfile(response.profile);
        return { success: true };
      }
      throw new Error(response.message || 'Registration failed');
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('void_hunter_token');
    setToken(null);
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (!token) return null;
    try {
      const response = await api.auth.getMe();
      if (response.success) {
        setUser(response.user);
        setProfile(response.profile);
        return response.profile;
      }
    } catch (err) {
      console.error('Error refreshing profile:', err);
    }
    return null;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        loading,
        error,
        login,
        register,
        logout,
        refreshProfile,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
