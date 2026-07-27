import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import Button from '../components/Button';
import Icon from '../components/icons/Icon';

export function ForbiddenPage() {
  const navigate = useNavigate();

  return (
    <MainLayout>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '120px 40px', textAlign: 'center' }}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 100,
            background: 'rgba(255,66,79,.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--status-negative)',
            marginBottom: 20,
          }}
        >
          <Icon name="TriangleExclamation" size={32} />
        </div>
        <h1 style={{ font: 'var(--text-title-2)', color: 'var(--label-normal)', margin: 0 }}>이 페이지에 접근할 권한이 없어요</h1>
        <p style={{ font: 'var(--text-body-1-regular)', color: 'var(--label-alternative-2)', marginTop: 10, maxWidth: 380 }}>
          관리자 전용 페이지이거나 접근 조건을 만족하지 않아요.
        </p>
        <div style={{ display: 'flex', gap: 10, marginTop: 32 }}>
          <Button label="이전 페이지" variant="outlined" color="assistive" size="md" onClick={() => navigate(-1)} />
          <Button label="홈으로" variant="solid" color="primary" size="md" onClick={() => navigate('/')} />
        </div>
      </div>
    </MainLayout>
  );
}

export default ForbiddenPage;
