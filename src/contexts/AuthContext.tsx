import React, { createContext, useContext, useState, useEffect } from 'react';

interface Admin {
  username: string;
  isAuthenticated: boolean;
}

interface AuthContextType {
  admin: Admin | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    // Check for existing admin session in localStorage
    const storedAdmin = localStorage.getItem('admin');
    if (storedAdmin) {
      const parsedAdmin = JSON.parse(storedAdmin);
      setAdmin(parsedAdmin);
      setIsAuthenticated(parsedAdmin.isAuthenticated);
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    // In a real app, this would be a server call to validate credentials
    // For demo purposes, we'll use hardcoded admin credentials
    if (username === 'admin' && password === 'admin123') {
      const adminUser = { username, isAuthenticated: true };
      setAdmin(adminUser);
      setIsAuthenticated(true);
      localStorage.setItem('admin', JSON.stringify(adminUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setAdmin(null);
    setIsAuthenticated(false);
    localStorage.removeItem('admin');
  };

  return (
    <AuthContext.Provider value={{ admin, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};