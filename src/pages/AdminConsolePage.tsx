import { Navigate } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import { useAuth } from '../context/AuthContext';
import './AdminConsolePage.css';

export function AdminConsolePage() {
  const { user } = useAuth();

  if (user?.role !== 'admin') {
    return <Navigate to="/forbidden" replace />;
  }

  return (
    <MainLayout>
      <div className="nm-admin-shell">
        <h1 style={{ font: 'var(--text-title-1)', color: 'var(--label-normal)', margin: '0 0 8px' }}>관리자 콘솔</h1>
        <div className="nm-empty-state">사용자 관리 및 신고 처리 API가 아직 준비되지 않았습니다.</div>
      </div>
    </MainLayout>
  );
}

export default AdminConsolePage;
