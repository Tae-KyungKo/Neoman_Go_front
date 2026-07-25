import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import MyPageLayout from '../components/MyPageLayout';
import Button from '../components/Button';
import Icon, { type IconName } from '../components/icons/Icon';
import Pagination from '../components/Pagination';
import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type NotificationResponse,
  type NotificationType,
} from '../api/notificationApi';
import { getApiErrorMessage } from '../api/httpClient';
import { getAccessToken } from '../auth/tokenStorage';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import './NotificationsPage.css';

function getNotificationIcon(type: NotificationType): IconName {
  return type === 'POST_COMMENT_CREATED' ? 'Message' : 'Persons';
}

function getNotificationTargetPath(notification: NotificationResponse): string {
  if (notification.targetType === 'TEAM') {
    return `/teams/${notification.targetId}`;
  }
  if (notification.targetType === 'POST') {
    return `/board/${notification.targetId}`;
  }
  return '/mypage/teams';
}

function getKstToday(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function getKstYesterday(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(yesterday);
}

function formatGroupLabel(date: string): string {
  if (date === getKstToday()) return '오늘';
  if (date === getKstYesterday()) return '어제';
  return date.replaceAll('-', '.');
}

function formatNotificationTime(createdAt: string): string {
  return createdAt.slice(11, 16);
}

export function NotificationsPage() {
  const { user } = useAuth();
  const {
    unreadCount,
    latestNotification,
    setUnreadCount,
    decrementUnreadCount,
  } = useNotifications();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const accessToken = getAccessToken();
    if (!accessToken) {
      setIsLoading(false);
      return;
    }

    let active = true;
    setIsLoading(true);
    setLoadError(null);

    getNotifications(page - 1, accessToken)
      .then((notificationPage) => {
        if (!active) return;
        setNotifications(notificationPage.content);
        setTotalPages(Math.max(1, notificationPage.totalPages));
      })
      .catch((error) => {
        if (!active) return;
        setNotifications([]);
        setTotalPages(1);
        setLoadError(getApiErrorMessage(error, '알림을 불러오지 못했습니다.'));
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [page]);

  useEffect(() => {
    if (!latestNotification || page !== 1) return;
    setNotifications((list) => {
      if (list.some((notification) => notification.id === latestNotification.id)) {
        return list;
      }
      return [latestNotification, ...list];
    });
  }, [latestNotification, page]);

  const notificationGroups = useMemo(() => {
    const groups = new Map<string, NotificationResponse[]>();
    notifications.forEach((notification) => {
      const date = notification.createdAt.slice(0, 10);
      const group = groups.get(date) ?? [];
      group.push(notification);
      groups.set(date, group);
    });
    return Array.from(groups.entries());
  }, [notifications]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const markAllRead = async () => {
    const accessToken = getAccessToken();
    if (!accessToken || isMarkingAll) return;

    setIsMarkingAll(true);
    setLoadError(null);
    try {
      await markAllNotificationsAsRead(accessToken);
      setNotifications((list) => list.map((notification) => ({ ...notification, read: true })));
      setUnreadCount(0);
    } catch (error) {
      setLoadError(getApiErrorMessage(error, '알림을 모두 읽음 처리하지 못했습니다.'));
    } finally {
      setIsMarkingAll(false);
    }
  };

  const handleClick = async (notification: NotificationResponse) => {
    const accessToken = getAccessToken();

    if (!notification.read && accessToken) {
      try {
        await markNotificationAsRead(notification.id, accessToken);
        setNotifications((list) =>
          list.map((item) => (item.id === notification.id ? { ...item, read: true } : item)),
        );
        decrementUnreadCount();
      } catch {
        // 읽음 처리 실패가 알림 대상 페이지 이동을 막지는 않는다.
      }
    }

    navigate(getNotificationTargetPath(notification));
  };

  return (
    <MyPageLayout active="notif">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h1 style={{ font: 'var(--text-title-1)', color: 'var(--label-normal)', margin: 0 }}>알림함</h1>
          {unreadCount > 0 && (
            <span style={{ font: 'var(--text-caption-1-semibold)', color: 'var(--static-white-3)', background: 'var(--status-negative)', borderRadius: 100, padding: '3px 9px' }}>
              {unreadCount}
            </span>
          )}
        </div>
        <Button
          label={isMarkingAll ? '처리 중...' : '모두 읽음 처리'}
          variant="outlined"
          color="assistive"
          size="sm"
          onClick={markAllRead}
          disabled={unreadCount === 0 || isMarkingAll}
        />
      </div>

      {isLoading && <div className="nm-empty-state">알림을 불러오는 중이에요.</div>}
      {!isLoading && loadError && <div className="nm-empty-state">{loadError}</div>}
      {!isLoading && !loadError && notifications.length === 0 && (
        <div className="nm-empty-state">아직 도착한 알림이 없어요.</div>
      )}
      {!isLoading && !loadError && notificationGroups.map(([date, group]) => (
        <div key={date}>
          <div className="nm-notif-date-label">{formatGroupLabel(date)}</div>
          <div className="nm-list-card">
            {group.map((notification) => (
              <div
                key={notification.id}
                className={'nm-notif-item' + (!notification.read ? ' nm-notif-item--unread' : '')}
                onClick={() => void handleClick(notification)}
              >
                <div className="nm-notif-icon">
                  <Icon name={getNotificationIcon(notification.type)} size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ font: 'var(--text-body-2-regular)', color: 'var(--label-normal)' }}>{notification.message}</div>
                  <div style={{ font: 'var(--text-caption-1-medium)', color: 'var(--label-alternative-3)', marginTop: 4 }}>
                    {formatNotificationTime(notification.createdAt)}
                  </div>
                </div>
                {!notification.read && <div style={{ width: 8, height: 8, borderRadius: 100, background: 'var(--primary-normal-3)', flexShrink: 0, marginTop: 4 }} />}
              </div>
            ))}
          </div>
        </div>
      ))}

      {!isLoading && !loadError && (
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      )}
    </MyPageLayout>
  );
}

export default NotificationsPage;
