import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import Avatar from './Avatar';
import Button from './Button';
import ThemeToggle from './ThemeToggle';
import Icon from './icons/Icon';
import './Header.css';

const NAV: { label: string; to?: string }[] = [
  { label: '카테고리', to: '/' },
  { label: '팀 찾기', to: '/teams' },
  { label: '게시판', to: '/board' },
  { label: '공지사항', to: '/notices' },
];

interface HeaderProps {
  active?: string;
}

export function Header({ active }: HeaderProps) {
  const { user, logout } = useAuth();
  const { unreadCount, streamStatus } = useNotifications();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/');
    } catch {
      navigate('/');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="nm-header">
      <div className="nm-header__left">
        <Link to="/" className="nm-header__logo">
          너만고
        </Link>
        <nav className="nm-header__nav">
          {NAV.map((item) =>
            item.to ? (
              <Link
                key={item.label}
                to={item.to}
                className={'nm-nav-link' + (item.label === active ? ' nm-nav-link--active' : '')}
              >
                {item.label}
              </Link>
            ) : (
              <span key={item.label} className="nm-nav-link nm-nav-link--disabled" aria-disabled="true">
                {item.label}
              </span>
            ),
          )}
        </nav>
      </div>
      <div className="nm-header__right">
        <ThemeToggle />
        {user ? (
          <>
            <button
              type="button"
              className="nm-header__bell"
              aria-label="알림함"
              title={streamStatus === 'connected' ? '실시간 알림 연결됨' : '알림함'}
              onClick={() => navigate('/mypage/notifications')}
            >
              <Icon name="Bell" size={20} />
              {unreadCount > 0 && (
                <span className="nm-header__bell-badge">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
            <button type="button" onClick={() => navigate('/mypage/info')} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex' }} aria-label="마이페이지">
              <Avatar size={40} />
            </button>
            <Button
              label={isLoggingOut ? '로그아웃 중...' : '로그아웃'}
              variant="outlined"
              color="assistive"
              size="md"
              disabled={isLoggingOut}
              onClick={() => void handleLogout()}
            />
          </>
        ) : (
          <>
            <Button label="로그인" variant="outlined" color="assistive" size="md" onClick={() => navigate('/login')} />
            <Button label="회원가입" variant="solid" color="primary" size="md" onClick={() => navigate('/signup')} />
          </>
        )}
      </div>
    </header>
  );
}

export default Header;
