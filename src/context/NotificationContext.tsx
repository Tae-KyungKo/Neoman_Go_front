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
  NotificationStreamError,
  type NotificationResponse,
} from '../api/notificationApi';
import { refreshAccessToken } from '../api/httpClient';
import { useAuth } from './AuthContext';

export type NotificationStreamStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'fallback';

interface NotificationContextValue {
  unreadCount: number;
  latestNotification: NotificationResponse | null;
  streamStatus: NotificationStreamStatus;
  setUnreadCount: (count: number) => void;
  decrementUnreadCount: () => void;
  refreshUnreadCount: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const [unreadCount, setUnreadCountState] = useState(0);
  const [latestNotification, setLatestNotification] = useState<NotificationResponse | null>(null);
  const [streamStatus, setStreamStatus] = useState<NotificationStreamStatus>('disconnected');

  const setUnreadCount = useCallback((count: number) => {
    setUnreadCountState(Math.max(0, count));
  }, []);

  const decrementUnreadCount = useCallback(() => {
    setUnreadCountState((count) => Math.max(0, count - 1));
  }, []);

  const refreshUnreadCount = useCallback(async () => {
    if (status !== 'authenticated') {
      setUnreadCountState(0);
      return;
    }
    const response = await getUnreadNotificationCount();
    setUnreadCountState(response.unreadCount);
  }, [status]);

  useEffect(() => {
    if (status !== 'authenticated') {
      setUnreadCountState(0);
      setLatestNotification(null);
      setStreamStatus('disconnected');
      return;
    }

    void refreshUnreadCount().catch(() => {
      // The page-level REST error state remains the user-facing fallback.
    });
  }, [refreshUnreadCount, status]);

  useEffect(() => {
    if (status !== 'authenticated') return;

    const controller = new AbortController();
    let reconnectDelay = 1000;
    let consecutiveFailures = 0;

    const run = async () => {
      while (!controller.signal.aborted) {
        setStreamStatus(consecutiveFailures === 0 ? 'connecting' : 'reconnecting');

        try {
          await connectNotificationStream(
            controller.signal,
            (notification) => {
              consecutiveFailures = 0;
              reconnectDelay = 1000;
              setLatestNotification(notification);
              if (!notification.read) {
                setUnreadCountState((count) => count + 1);
              }
            },
            () => {
              consecutiveFailures = 0;
              reconnectDelay = 1000;
              setStreamStatus('connected');
            },
          );
        } catch (error) {
          if (controller.signal.aborted) return;
          if (error instanceof NotificationStreamError && error.status === 401) {
            try {
              await refreshAccessToken();
              reconnectDelay = 1000;
              continue;
            } catch {
              return;
            }
          }
        }

        consecutiveFailures += 1;
        setStreamStatus(consecutiveFailures >= 3 ? 'fallback' : 'reconnecting');
        if (consecutiveFailures >= 3) {
          void refreshUnreadCount().catch(() => undefined);
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
    return () => {
      controller.abort();
      setStreamStatus('disconnected');
    };
  }, [refreshUnreadCount, status]);

  useEffect(() => {
    if (status !== 'authenticated' || streamStatus !== 'fallback') return;

    const intervalId = window.setInterval(() => {
      void refreshUnreadCount().catch(() => undefined);
    }, 30_000);

    return () => window.clearInterval(intervalId);
  }, [refreshUnreadCount, status, streamStatus]);

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        latestNotification,
        streamStatus,
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
