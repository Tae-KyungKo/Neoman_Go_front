import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  requestCsrfToken,
  requestWebLogin,
  requestWebLogout,
  requestWebRefresh,
  type LoginCredentials,
  type WebTokenResponse,
} from '../api/authApi';
import { getCurrentUser, type MeResponse } from '../api/userApi';
import {
  getAuthSession,
  setAuthSession,
  setCsrfToken,
} from '../auth/authSession';
import { clearTokens } from '../auth/tokenStorage';

export type UserRole = 'user' | 'admin';
export type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated';

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
  status: AuthStatus;
  login: (user: AuthUser) => void;
  updateCurrentUser: (updates: Partial<AuthUser>) => void;
  authenticate: (credentials: LoginCredentials) => Promise<AuthUser>;
  logout: () => Promise<void>;
  authLoading: boolean;
  authReady: boolean;
}

interface RestoredSession {
  tokens: WebTokenResponse;
  csrfToken: string;
  me: MeResponse;
}

const AuthContext = createContext<AuthContextValue | null>(null);
let initialSessionPromise: Promise<RestoredSession> | null = null;

function restoreWebSession(): Promise<RestoredSession> {
  if (!initialSessionPromise) {
    initialSessionPromise = requestCsrfToken().then(async (csrf) => {
      const tokens = await requestWebRefresh(csrf.token);
      const me = await getCurrentUser(tokens.accessToken);
      return { tokens, csrfToken: csrf.token, me };
    });
  }
  return initialSessionPromise;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>('checking');
  const [operationLoading, setOperationLoading] = useState(false);

  const login = (nextUser: AuthUser) => {
    setUser(nextUser);
    setStatus('authenticated');
  };

  const updateCurrentUser = (updates: Partial<AuthUser>) => {
    setUser((currentUser) => currentUser ? { ...currentUser, ...updates } : null);
  };

  const normalizeUser = useCallback((me: MeResponse, loginId?: string): AuthUser => ({
    id: me.id,
    nickname: me.nickname,
    role: me.role === 'ADMIN' ? 'admin' : 'user',
    loginId,
    email: me.email,
    status: me.status,
  }), []);

  const ensureCsrfToken = useCallback(async (): Promise<string> => {
    const currentCsrfToken = getAuthSession().csrfToken;
    if (currentCsrfToken) {
      return currentCsrfToken;
    }

    const csrf = await requestCsrfToken();
    setCsrfToken(csrf.token);
    return csrf.token;
  }, []);

  const logout = useCallback(async () => {
    setOperationLoading(true);
    try {
      const csrfToken = await ensureCsrfToken();
      await requestWebLogout(csrfToken);
    } finally {
      clearTokens();
      setUser(null);
      setStatus('unauthenticated');
      setOperationLoading(false);
    }
  }, [ensureCsrfToken]);

  const authenticate = useCallback(async (credentials: LoginCredentials): Promise<AuthUser> => {
    setOperationLoading(true);

    try {
      const csrfToken = await ensureCsrfToken();
      const tokens = await requestWebLogin(credentials, csrfToken);
      setAuthSession(tokens);

      const me = await getCurrentUser(tokens.accessToken);
      const authenticatedUser = normalizeUser(me, credentials.loginId);
      setUser(authenticatedUser);
      setStatus('authenticated');
      return authenticatedUser;
    } catch (error) {
      clearTokens();
      setUser(null);
      setStatus('unauthenticated');
      throw error;
    } finally {
      setOperationLoading(false);
    }
  }, [ensureCsrfToken, normalizeUser]);

  useEffect(() => {
    let active = true;

    restoreWebSession()
      .then(({ tokens, csrfToken, me }) => {
        if (!active) return;
        setCsrfToken(csrfToken);
        setAuthSession(tokens);
        setUser(normalizeUser(me));
        setStatus('authenticated');
      })
      .catch(() => {
        if (!active) return;
        clearTokens();
        setUser(null);
        setStatus('unauthenticated');
      });

    return () => {
      active = false;
    };
  }, [normalizeUser]);

  useEffect(() => {
    const handleAuthExpired = () => {
      clearTokens();
      setUser(null);
      setOperationLoading(false);
      setStatus('unauthenticated');
    };

    window.addEventListener('neomango:auth-expired', handleAuthExpired);
    return () => window.removeEventListener('neomango:auth-expired', handleAuthExpired);
  }, []);

  const authReady = status !== 'checking';
  const authLoading = status === 'checking' || operationLoading;

  return (
    <AuthContext.Provider
      value={{
        user,
        status,
        login,
        updateCurrentUser,
        authenticate,
        logout,
        authLoading,
        authReady,
      }}
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
