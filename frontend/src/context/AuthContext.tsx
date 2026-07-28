import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  isGuest: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
  continueAsGuest: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(false);

  useEffect(() => {
    // Load session from local storage on mount
    const savedUser = localStorage.getItem('mealody_user');
    const savedToken = localStorage.getItem('mealody_token');
    const savedGuest = localStorage.getItem('mealody_guest');

    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
        setIsGuest(false);
      } catch (e) {
        localStorage.removeItem('mealody_user');
        localStorage.removeItem('mealody_token');
      }
    } else if (savedGuest === 'true') {
      setIsGuest(true);
    }
  }, []);

  const login = (userData: User, userToken: string) => {
    setUser(userData);
    setToken(userToken);
    setIsGuest(false);
    localStorage.setItem('mealody_user', JSON.stringify(userData));
    localStorage.setItem('mealody_token', userToken);
    localStorage.removeItem('mealody_guest');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setIsGuest(false);
    localStorage.removeItem('mealody_user');
    localStorage.removeItem('mealody_token');
    localStorage.removeItem('mealody_guest');
  };

  const continueAsGuest = () => {
    setUser(null);
    setToken(null);
    setIsGuest(true);
    localStorage.setItem('mealody_guest', 'true');
    localStorage.removeItem('mealody_user');
    localStorage.removeItem('mealody_token');
  };

  const isLoggedIn = !!user;

  return (
    <AuthContext.Provider value={{ user, token, isLoggedIn, isGuest, login, logout, continueAsGuest }}>
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
