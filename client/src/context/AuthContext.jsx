import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Optimistic Hydration from localStorage to eliminate FOUC (Flash of Unauthenticated Content) on refresh
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('void_hunter_token') || null;
    } catch {
      return null;
    }
  });

  const [user, setUser] = useState(() => {
    try {
      const cached = localStorage.getItem('void_hunter_user');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  const [profile, setProfile] = useState(() => {
    try {
      const cached = localStorage.getItem('void_hunter_profile');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  // Only consider loading if token exists but no cached user profile is available yet
  const [loading, setLoading] = useState(() => {
    try {
      const t = localStorage.getItem('void_hunter_token');
      const u = localStorage.getItem('void_hunter_user');
      return !!(t && !u);
    } catch {
      return false;
    }
  });

  const [error, setError] = useState(null);

  // Synchronize state and persistent storage
  const saveSession = (sessionToken, sessionUser, sessionProfile) => {
    try {
      if (sessionToken) {
        localStorage.setItem('void_hunter_token', sessionToken);
        setToken(sessionToken);
      }
      if (sessionUser) {
        localStorage.setItem('void_hunter_user', JSON.stringify(sessionUser));
        setUser(sessionUser);
      }
      if (sessionProfile) {
        localStorage.setItem('void_hunter_profile', JSON.stringify(sessionProfile));
        setProfile(sessionProfile);
      }
    } catch (e) {
      console.warn('Storage error:', e);
    }
  };

  const setAuthenticatedSession = (sessionToken, sessionUser, sessionProfile) => {
    saveSession(sessionToken, sessionUser, sessionProfile);
    setLoading(false);
  };

  const logout = () => {
    try {
      localStorage.removeItem('void_hunter_token');
      localStorage.removeItem('void_hunter_user');
      localStorage.removeItem('void_hunter_profile');
    } catch {}
    setToken(null);
    setUser(null);
    setProfile(null);
    setLoading(false);
  };

  // Verify stored session with backend on mount
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.auth.getMe();
        if (response.success) {
          saveSession(token, response.user, response.profile);
        } else {
          logout();
        }
      } catch (err) {
        console.error('Failed to verify stored session:', err);
        const errMsg = String(err.message || '').toLowerCase();
        if (errMsg.includes('401') || errMsg.includes('token') || errMsg.includes('unauthorized') || errMsg.includes('invalid')) {
          logout();
        }
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
        saveSession(response.token, response.user, response.profile);
        return { success: true, user: response.user, profile: response.profile };
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
        saveSession(response.token, response.user, response.profile);
        return { success: true, user: response.user, profile: response.profile };
      }
      throw new Error(response.message || 'Registration failed');
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (!token) return null;
    try {
      const response = await api.auth.getMe();
      if (response.success) {
        saveSession(token, response.user, response.profile);
        return response.profile;
      }
    } catch (err) {
      console.error('Error refreshing profile:', err);
    }
    return null;
  };

  const updateProfileData = async (data) => {
    try {
      const response = await api.auth.updateProfile(data);
      if (response.success) {
        saveSession(token, response.user, response.profile);
        return { success: true, user: response.user, profile: response.profile };
      }
      return { success: false, message: response.message || 'Profile update failed' };
    } catch (err) {
      console.error('Error updating profile:', err);
      return { success: false, message: err.message };
    }
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
        updateProfileData,
        setAuthenticatedSession,
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
