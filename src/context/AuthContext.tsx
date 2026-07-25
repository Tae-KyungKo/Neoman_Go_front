import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { requestLogin, requestLogout, type LoginCredentials } from '../api/authApi';
import { getCurrentUser, type MeResponse } from '../api/userApi';
import { clearTokens, getAccessToken, saveTokens } from '../auth/tokenStorage';

export type UserRole = 'user' | 'admin';

export interface AuthUser {
  id?: number;
  nickname: string;
  role: UserRole;
  loginId?: string;
  email?: string;
  joinedAt?: string;
  status?: 'ACTIVE' | 'DELETED';
}

interface AuthContextValue {
  user: AuthUser | null;
  login: (user: AuthUser) => void;
  authenticate: (credentials: LoginCredentials) => Promise<AuthUser>;
  logout: () => Promise<void>;
  authLoading: boolean;
  authReady: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authReady, setAuthReady] = useState(() => !getAccessToken());

  const login = (nextUser: AuthUser) => setUser(nextUser);
  const logout = async () => {
    const accessToken = getAccessToken();

    try {
      if (accessToken) {
        await requestLogout(accessToken);
      }
    } finally {
      clearTokens();
      setUser(null);
      setAuthReady(true);
    }
  };

  const normalizeUser = useCallback((me: MeResponse, loginId?: string): AuthUser => ({
    id: me.id,
    nickname: me.nickname,
    role: me.role === 'ADMIN' ? 'admin' : 'user',
    loginId,
    email: me.email,
    status: me.status,
  }), []);

  const authenticate = useCallback(async (credentials: LoginCredentials): Promise<AuthUser> => {
    setAuthLoading(true);

    try {
      const tokens = await requestLogin(credentials);
      saveTokens(tokens);

      const me = await getCurrentUser(tokens.accessToken);
      const authenticatedUser = normalizeUser(me, credentials.loginId);
      setUser(authenticatedUser);
      setAuthReady(true);

      return authenticatedUser;
    } catch (error) {
      clearTokens();
      setUser(null);
      setAuthReady(true);
      throw error;
    } finally {
      setAuthLoading(false);
    }
  }, [normalizeUser]);

  useEffect(() => {
    const accessToken = getAccessToken();

    if (!accessToken) {
      return;
    }

    let active = true;
    setAuthLoading(true);

    getCurrentUser(accessToken)
      .then((me) => {
        if (active) {
          setUser(normalizeUser(me));
        }
      })
      .catch(() => {
        if (active) {
          clearTokens();
          setUser(null);
        }
      })
      .finally(() => {
        if (active) {
          setAuthLoading(false);
          setAuthReady(true);
        }
      });

    return () => {
      active = false;
    };
  }, [normalizeUser]);

  useEffect(() => {
    const handleAuthExpired = () => {
      setUser(null);
      setAuthLoading(false);
      setAuthReady(true);
    };

    window.addEventListener('neomango:auth-expired', handleAuthExpired);
    return () => window.removeEventListener('neomango:auth-expired', handleAuthExpired);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, login, authenticate, logout, authLoading, authReady }}
    >
      {authReady ? children : null}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
