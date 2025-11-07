import React, { createContext, ReactNode, useContext, useMemo, useState } from 'react';

interface User {
  email: string;
  role: 'user' | 'barber';
}

interface AuthContextType {
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  readonly children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);

  const signIn = async (email: string, password: string) => {
    // Simulación de autenticación
    // Si el email contiene "barber", "barbero" o "admin", es un barbero
    const isBarber = email.toLowerCase().includes('barber') || 
                     email.toLowerCase().includes('barbero') || 
                     email.toLowerCase().includes('admin');
    
    const newUser: User = {
      email,
      role: isBarber ? 'barber' : 'user'
    };
    
    setUser(newUser);
  };

  const signOut = () => {
    setUser(null);
  };

  const value = useMemo(() => ({ user, signIn, signOut }), [user]);

  return (
    <AuthContext.Provider value={value}>
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