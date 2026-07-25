import type { ReactNode } from 'react';
import Header from './Header';
import BottomBar from './BottomBar';
import Footer from './Footer';
import { useNotifications } from '../context/NotificationContext';

export function MainLayout({ active, children }: { active?: string; children: ReactNode }) {
  const { streamStatus } = useNotifications();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header active={active} />
      {streamStatus === 'fallback' && (
        <div
          role="status"
          style={{
            padding: '8px 20px',
            background: 'rgba(255,171,0,.12)',
            color: '#8a6100',
            textAlign: 'center',
            font: 'var(--text-caption-1-medium)',
          }}
        >
          실시간 알림 연결이 불안정해 주기적으로 새 알림을 확인하고 있어요.
        </div>
      )}
      <div style={{ flex: 1 }}>{children}</div>
      <BottomBar />
      <Footer />
    </div>
  );
}

export default MainLayout;
