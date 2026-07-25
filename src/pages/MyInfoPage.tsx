import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import MyPageLayout from '../components/MyPageLayout';
import Button from '../components/Button';
import ConfirmModal from '../components/ConfirmModal';
import { useAuth } from '../context/AuthContext';
import './MyInfoPage.css';

export function MyInfoPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    try {
      await logout();
    } catch {
      // 서버 로그아웃에 실패해도 로컬 인증 정보는 AuthContext에서 제거한다.
    } finally {
      navigate('/');
    }
  };

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <MyPageLayout active="info">
      <h1 style={{ font: 'var(--text-title-1)', color: 'var(--label-normal)', margin: '0 0 24px' }}>내 정보</h1>
      <div className="nm-mp-card">
        <div className="nm-info-row">
          <span className="nm-info-row__label">아이디</span>
          <span className="nm-info-row__value">{user.loginId ?? '-'}</span>
        </div>
        <div className="nm-info-row">
          <span className="nm-info-row__label">닉네임</span>
          <span className="nm-info-row__value">{user.nickname}</span>
        </div>
        <div className="nm-info-row">
          <span className="nm-info-row__label">이메일</span>
          <span className="nm-info-row__value">{user.email ?? '-'}</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
        <Button label="정보 수정" variant="outlined" color="assistive" size="md" onClick={() => navigate('/mypage/edit')} />
        <Button label="비밀번호 변경" variant="outlined" color="assistive" size="md" onClick={() => navigate('/mypage/change-password')} />
      </div>

      <div className="nm-mp-card" style={{ marginTop: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ font: 'var(--text-body-1-semibold)', color: 'var(--label-normal)' }}>로그아웃</div>
            <div style={{ font: 'var(--text-caption-1-medium)', color: 'var(--label-alternative-2)', marginTop: 2 }}>현재 기기에서 로그아웃해요</div>
          </div>
          <Button
            label={isLoggingOut ? '로그아웃 중...' : '로그아웃'}
            variant="outlined"
            color="assistive"
            size="sm"
            disabled={isLoggingOut}
            onClick={handleLogout}
          />
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 20,
            paddingTop: 20,
            borderTop: '1px solid var(--line-normal-normal)',
          }}
        >
          <div>
            <div style={{ font: 'var(--text-body-1-semibold)', color: 'var(--status-negative)' }}>회원 탈퇴</div>
            <div style={{ font: 'var(--text-caption-1-medium)', color: 'var(--label-alternative-2)', marginTop: 2 }}>탈퇴 시 모든 활동 기록이 삭제돼요</div>
          </div>
          <Button label="탈퇴하기" variant="outlined" color="assistive" size="sm" onClick={() => setWithdrawOpen(true)} />
        </div>
      </div>

      {withdrawOpen && (
        <ConfirmModal
          title="정말 탈퇴하시겠습니까?"
          description="탈퇴 시 모든 활동 기록이 삭제되며 복구할 수 없습니다."
          confirmLabel="탈퇴하기"
          titleColor="var(--status-negative)"
          onCancel={() => setWithdrawOpen(false)}
          onConfirm={() => {
            setWithdrawOpen(false);
            void logout().catch(() => undefined);
            navigate('/');
          }}
        />
      )}
    </MyPageLayout>
  );
}

export default MyInfoPage;
