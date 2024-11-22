import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { loadData } from '../services/dataService';

interface AuthContextType {
  user: User | null;
  login: (email: string, pin: string) => Promise<void>;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, pin: string) => {
    try {
      setError(null);
      const data = await loadData();
      
      // Find user
      const foundUser = data.users.find(u => u.email === email);
      if (!foundUser) {
        throw new Error('User not found');
      }

      // Check PIN - default is '0000' if not set
      const correctPin = data.pins?.[email] || '0000';
      if (pin !== correctPin) {
        throw new Error('Invalid PIN');
      }

      setUser(foundUser);
      localStorage.setItem('user', JSON.stringify(foundUser));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setError(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}