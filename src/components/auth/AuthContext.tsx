import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthState {
  userId: string;
  role: string;
  accessToken: string;
}

interface AuthContextType {
  auth: AuthState | null;
  setAuth: (auth: AuthState | null) => void;
  isLoading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [auth, setAuth] = useState<AuthState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for tokens in localStorage
    const savedAuth = localStorage.getItem('auth');
    if (savedAuth) {
      setAuth(JSON.parse(savedAuth));
    }
    setIsLoading(false);
  }, []);

  const handleSetAuth = (newAuth: AuthState | null) => {
    setAuth(newAuth);
    if (newAuth) {
      localStorage.setItem('auth', JSON.stringify(newAuth));
    } else {
      localStorage.removeItem('auth');
    }
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken })
        });
      } catch (e) {}
    }
    localStorage.removeItem('refreshToken');
    handleSetAuth(null);
  };

  return (
    <AuthContext.Provider value={{ auth, setAuth: handleSetAuth, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
