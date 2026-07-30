import { useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import MyPageLayout from '../components/MyPageLayout';
import Button from '../components/Button';
import ConfirmModal from '../components/ConfirmModal';
import FormField from '../components/FormField';
import Icon from '../components/icons/Icon';
import { checkNickname } from '../api/authApi';
import { updateNickname } from '../api/userApi';
import { getApiErrorMessage, getApiFieldErrors } from '../api/httpClient';
import { useAuth } from '../context/AuthContext';
import { validateNickname } from '../lib/validation';
import './MyInfoPage.css';

export function MyInfoPage() {
  const { user, updateCurrentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [nicknameOpen, setNicknameOpen] = useState(false);
  const [nickname, setNickname] = useState('');
  const [nicknameChecked, setNicknameChecked] = useState(false);
  const [nicknameHint, setNicknameHint] = useState<string | null>(null);
  const [nicknameHintStatus, setNicknameHintStatus] = useState<'positive' | 'error'>('error');
  const [isChecking, setIsChecking] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const nicknameCheckSequence = useRef(0);

  if (!user) return <Navigate to="/login" replace />;

  const openNicknameModal = () => {
    nicknameCheckSequence.current += 1;
    setNickname(user.nickname);
    setNicknameChecked(false);
    setNicknameHint(null);
    setIsChecking(false);
    setSuccessMessage(null);
    setNicknameOpen(true);
  };

  const closeNicknameModal = () => {
    if (isUpdating) return;
    nicknameCheckSequence.current += 1;
    setIsChecking(false);
    setNicknameOpen(false);
  };

  const handleCheckNickname = async () => {
    const normalizedNickname = nickname.trim();
    const validationError = validateNickname(normalizedNickname);
    if (validationError || normalizedNickname === user.nickname) {
      setNicknameHint(validationError ?? '현재 닉네임과 다른 닉네임을 입력해 주세요.');
      setNicknameHintStatus('error');
      return;
    }
    const sequence = ++nicknameCheckSequence.current;
    setIsChecking(true);
    try {
      const result = await checkNickname(normalizedNickname);
      if (sequence !== nicknameCheckSequence.current) return;
      setNicknameChecked(result.available);
      setNicknameHint(result.available ? '사용 가능한 닉네임입니다.' : '이미 사용 중인 닉네임입니다.');
      setNicknameHintStatus(result.available ? 'positive' : 'error');
    } catch (error) {
      if (sequence !== nicknameCheckSequence.current) return;
      setNicknameChecked(false);
      setNicknameHint(getApiErrorMessage(error, '중복 확인에 실패했습니다.'));
      setNicknameHintStatus('error');
    } finally {
      if (sequence === nicknameCheckSequence.current) setIsChecking(false);
    }
  };

  const handleUpdateNickname = async () => {
    if (!nicknameChecked || isUpdating) return;
    setIsUpdating(true);
    try {
      const updated = await updateNickname(nickname.trim());
      updateCurrentUser({ nickname: updated.nickname, email: updated.email, status: updated.status });
      nicknameCheckSequence.current += 1;
      setNicknameOpen(false);
      setSuccessMessage('닉네임이 변경되었습니다.');
    } catch (error) {
      const fieldErrors = getApiFieldErrors(error);
      setNicknameChecked(false);
      setNicknameHint(fieldErrors.nickname ?? getApiErrorMessage(error, '닉네임을 변경하지 못했습니다.'));
      setNicknameHintStatus('error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await logout();
    } catch {
      // 서버 실패와 무관하게 AuthContext가 로컬 token을 제거한다.
    } finally {
      navigate('/');
    }
  };

  return (
    <MyPageLayout active="info">
      <h1 style={{ font: 'var(--text-title-1)', color: 'var(--label-normal)', margin: '0 0 24px' }}>내 정보</h1>
      <div className="nm-mp-card">
        <div className="nm-info-row"><span className="nm-info-row__label">아이디</span><span className="nm-info-row__value">{user.loginId ?? '-'}</span></div>
        <div className="nm-info-row"><span className="nm-info-row__label">닉네임</span><span className="nm-info-row__value">{user.nickname}</span></div>
        <div className="nm-info-row"><span className="nm-info-row__label">이메일</span><span className="nm-info-row__value">{user.email ?? '-'}</span></div>
      </div>
      <Button label="닉네임 변경" variant="outlined" color="assistive" size="md" style={{ marginTop: 20 }} onClick={openNicknameModal} />
      {successMessage && (
        <div className="nm-mypage-success" role="status" aria-live="polite">{successMessage}</div>
      )}

      <div className="nm-mp-card nm-mypage-links" style={{ marginTop: 24 }}>
        <button type="button" className="nm-mypage-link" onClick={() => navigate('/mypage/teams')}>
          <Icon name="Persons" size={22} />
          <span><strong>My TEAM</strong><small>소속 팀과 가입 신청 현황을 확인해요.</small></span>
          <Icon name="ChevronRight" size={16} />
        </button>
        <button type="button" className="nm-mypage-link" onClick={() => navigate('/mypage/notifications')}>
          <Icon name="Bell" size={22} />
          <span><strong>알림함</strong><small>팀과 게시판의 새 소식을 확인해요.</small></span>
          <Icon name="ChevronRight" size={16} />
        </button>
        <button type="button" className="nm-mypage-link" onClick={() => void handleLogout()} disabled={isLoggingOut}>
          <Icon name="Person" size={22} />
          <span><strong>{isLoggingOut ? '로그아웃 중...' : '로그아웃'}</strong><small>현재 기기에서 로그아웃해요.</small></span>
          <Icon name="ChevronRight" size={16} />
        </button>
      </div>

      {nicknameOpen && (
        <ConfirmModal
          title="닉네임 변경"
          description="2~12자의 사용 가능한 닉네임을 입력해 주세요."
          confirmLabel={isUpdating ? '변경 중...' : '변경하기'}
          confirmDisabled={!nicknameChecked || isUpdating}
          closeDisabled={isUpdating}
          confirmOnEnter
          onCancel={closeNicknameModal}
          onConfirm={() => void handleUpdateNickname()}
        >
          <FormField
            label="새 닉네임"
            value={nickname}
            maxLength={12}
            autoFocus
            hint={nicknameHint ?? undefined}
            hintStatus={nicknameHint ? nicknameHintStatus : 'default'}
            action={<Button label={isChecking ? '확인 중...' : '중복 확인'} variant="outlined" color="assistive" size="md" disabled={isChecking} onClick={() => void handleCheckNickname()} />}
            onChange={(event) => {
              nicknameCheckSequence.current += 1;
              setNickname(event.target.value);
              setIsChecking(false);
              setNicknameChecked(false);
              setNicknameHint(null);
            }}
          />
        </ConfirmModal>
      )}
    </MyPageLayout>
  );
}

export default MyInfoPage;
