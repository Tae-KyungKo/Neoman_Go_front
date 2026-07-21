import { createContext, useContext, useState, type ReactNode } from 'react';

export type UserRole = 'user' | 'admin';

export interface AuthUser {
  nickname: string;
  role: UserRole;
  loginId?: string;
  email?: string;
  joinedAt?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  login: (user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  const login = (nextUser: AuthUser) => setUser(nextUser);
  const logout = () => setUser(null);

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
