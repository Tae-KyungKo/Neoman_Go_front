import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import MyPageLayout from '../components/MyPageLayout';
import Button from '../components/Button';
import Icon from '../components/icons/Icon';
import { useAuth } from '../context/AuthContext';
import { NOTIFICATIONS_TODAY, NOTIFICATIONS_YESTERDAY, type Notification } from '../data/notifications';
import { withMock } from '../lib/mockData';
import './NotificationsPage.css';

export function NotificationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [today, setToday] = useState(withMock(NOTIFICATIONS_TODAY, []));
  const [yesterday, setYesterday] = useState(withMock(NOTIFICATIONS_YESTERDAY, []));

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const unreadCount = today.filter((n) => n.unread).length + yesterday.filter((n) => n.unread).length;

  const markAllRead = () => {
    setToday((list) => list.map((n) => ({ ...n, unread: false })));
    setYesterday((list) => list.map((n) => ({ ...n, unread: false })));
  };

  const handleClick = (n: Notification, list: Notification[], setList: (v: Notification[]) => void) => {
    setList(list.map((x) => (x.id === n.id ? { ...x, unread: false } : x)));
    navigate(n.targetPath);
  };

  const renderGroup = (list: Notification[], setList: (v: Notification[]) => void) =>
    list.map((n) => (
      <div key={n.id} className={'nm-notif-item' + (n.unread ? ' nm-notif-item--unread' : '')} onClick={() => handleClick(n, list, setList)}>
        <div className="nm-notif-icon">
          <Icon name={n.icon} size={18} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ font: 'var(--text-body-2-regular)', color: 'var(--label-normal)' }}>{n.text}</div>
          <div style={{ font: 'var(--text-caption-1-medium)', color: 'var(--label-alternative-3)', marginTop: 4 }}>{n.time}</div>
        </div>
        {n.unread && <div style={{ width: 8, height: 8, borderRadius: 100, background: 'var(--primary-normal-3)', flexShrink: 0, marginTop: 4 }} />}
      </div>
    ));

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
        <Button label="모두 읽음 처리" variant="outlined" color="assistive" size="sm" onClick={markAllRead} disabled={unreadCount === 0} />
      </div>

      {today.length === 0 && yesterday.length === 0 ? (
        <div className="nm-empty-state">아직 도착한 알림이 없어요.</div>
      ) : (
        <>
          {today.length > 0 && (
            <>
              <div className="nm-notif-date-label">오늘</div>
              <div className="nm-list-card">{renderGroup(today, setToday)}</div>
            </>
          )}
          {yesterday.length > 0 && (
            <>
              <div className="nm-notif-date-label">어제</div>
              <div className="nm-list-card">{renderGroup(yesterday, setYesterday)}</div>
            </>
          )}
        </>
      )}
    </MyPageLayout>
  );
}

export default NotificationsPage;
