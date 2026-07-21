import type { ReactNode } from 'react';
import Header from './Header';
import BottomBar from './BottomBar';
import Footer from './Footer';

export function MainLayout({ active, children }: { active?: string; children: ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header active={active} />
      <div style={{ flex: 1 }}>{children}</div>
      <BottomBar />
      <Footer />
    </div>
  );
}

export default MainLayout;
