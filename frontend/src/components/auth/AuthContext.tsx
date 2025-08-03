import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, userService, extractErrorMessage } from '../../services/api';
import { User } from '../../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, phoneNumber?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUser: (updatedUser: User) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserInfo = async () => {
    try {
      const userInfo = await userService.getMe();
      setUser(userInfo);
    } catch (error) {
      // Token might be invalid, clear it
      localStorage.removeItem('access_token');
      setUser(null);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      fetchUserInfo().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const tokens = await authService.login(email, password);
      localStorage.setItem('access_token', tokens.access_token);
      await fetchUserInfo();
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      throw new Error(errorMessage);
    }
  };

  const register = async (email: string, password: string, phoneNumber?: string) => {
    try {
      await authService.register(email, password, phoneNumber);
      await login(email, password);
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
  };

  const refreshUser = async () => {
    await fetchUserInfo();
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, refreshUser, updateUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};