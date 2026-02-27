import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: number;
  tenant_id: number;
  username: string;
  name: string;
  role: 'admin' | 'cashier' | 'stock_manager';
  tenant?: {
    id: number;
    name: string;
    slug: string;
  };
}

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('meatmaster_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed && parsed.tenant_id) {
          setUser(parsed);
        } else {
          localStorage.removeItem('meatmaster_user');
        }
      } catch (e) {
        localStorage.removeItem('meatmaster_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('meatmaster_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('meatmaster_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
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
