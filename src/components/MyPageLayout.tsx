import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from './MainLayout';
import Avatar from './Avatar';
import { useAuth } from '../context/AuthContext';
import './MyPageLayout.css';

const NAV_ITEMS: { key: string; label: string; path: string }[] = [
  { key: 'info', label: '내 정보', path: '/mypage/info' },
  { key: 'team', label: 'My TEAM', path: '/mypage/teams' },
  { key: 'notif', label: '알림함', path: '/mypage/notifications' },
];

export function MyPageLayout({ active, children }: { active: string; children: ReactNode }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <MainLayout>
      <div className="nm-mp-shell">
        <div className="nm-mp-sidebar">
          <div className="nm-mp-profile-mini">
            <Avatar size={64} />
            <div style={{ font: 'var(--text-body-1-semibold)', color: 'var(--label-normal)', marginTop: 12 }}>{user?.nickname ?? '게스트'}</div>
          </div>
          <div className="nm-mp-nav">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.key}
                className={'nm-mp-nav-item' + (item.key === active ? ' nm-mp-nav-item--active' : '')}
                onClick={() => navigate(item.path)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <div className="nm-mp-content">{children}</div>
      </div>
    </MainLayout>
  );
}

export default MyPageLayout;
