import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  connectNotificationStream,
  getUnreadNotificationCount,
  type NotificationResponse,
} from '../api/notificationApi';
import { getAccessToken } from '../auth/tokenStorage';
import { useAuth } from './AuthContext';

interface NotificationContextValue {
  unreadCount: number;
  latestNotification: NotificationResponse | null;
  setUnreadCount: (count: number) => void;
  decrementUnreadCount: () => void;
  refreshUnreadCount: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCountState] = useState(0);
  const [latestNotification, setLatestNotification] = useState<NotificationResponse | null>(null);

  const setUnreadCount = useCallback((count: number) => {
    setUnreadCountState(Math.max(0, count));
  }, []);

  const decrementUnreadCount = useCallback(() => {
    setUnreadCountState((count) => Math.max(0, count - 1));
  }, []);

  const refreshUnreadCount = useCallback(async () => {
    const accessToken = getAccessToken();
    if (!accessToken) {
      setUnreadCountState(0);
      return;
    }
    const response = await getUnreadNotificationCount(accessToken);
    setUnreadCountState(response.unreadCount);
  }, []);

  useEffect(() => {
    if (!user) {
      setUnreadCountState(0);
      setLatestNotification(null);
      return;
    }

    void refreshUnreadCount().catch(() => {
      // The page-level REST error state remains the user-facing fallback.
    });
  }, [refreshUnreadCount, user]);

  useEffect(() => {
    const accessToken = getAccessToken();
    if (!user || !accessToken) return;

    const controller = new AbortController();
    let reconnectDelay = 1000;

    const run = async () => {
      while (!controller.signal.aborted) {
        try {
          await connectNotificationStream(
            accessToken,
            controller.signal,
            (notification) => {
              setLatestNotification(notification);
              if (!notification.read) {
                setUnreadCountState((count) => count + 1);
              }
            },
          );
          reconnectDelay = 1000;
        } catch {
          if (controller.signal.aborted) return;
        }

        await new Promise<void>((resolve) => {
          const timeoutId = window.setTimeout(resolve, reconnectDelay);
          controller.signal.addEventListener(
            'abort',
            () => {
              window.clearTimeout(timeoutId);
              resolve();
            },
            { once: true },
          );
        });
        reconnectDelay = Math.min(reconnectDelay * 2, 30_000);
      }
    };

    void run();
    return () => controller.abort();
  }, [user]);

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        latestNotification,
        setUnreadCount,
        decrementUnreadCount,
        refreshUnreadCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}
