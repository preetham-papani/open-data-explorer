import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { authApi } from '../services/api';
import { useToast } from './ToastContext';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  login: (credentials: { email: string; password: string }) => Promise<User>;
  register: (data: { username: string; email: string; password: string }) => Promise<User>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { showToast } = useToast();

  const refreshProfile = useCallback(async () => {
    try {
      const profile = await authApi.getProfile();
      setUser(profile);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const login = async (credentials: { email: string; password: string }): Promise<User> => {
    const loggedInUser = await authApi.login(credentials);
    setUser(loggedInUser);
    showToast(`Welcome back, ${loggedInUser.username}!`, 'success');
    return loggedInUser;
  };

  const register = async (data: { username: string; email: string; password: string }): Promise<User> => {
    const newUser = await authApi.register(data);
    setUser(newUser);
    showToast(`Registration complete! Welcome, ${newUser.username}!`, 'success');
    return newUser;
  };

  const logout = async (): Promise<void> => {
    try {
      await authApi.logout();
      setUser(null);
      showToast('Logged out successfully.', 'info');
    } catch (err: any) {
      setUser(null);
      showToast(err.message || 'Logged out.', 'info');
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
