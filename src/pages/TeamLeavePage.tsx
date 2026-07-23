import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import Button from '../components/Button';
import ConfirmModal from '../components/ConfirmModal';
import {
  getTeamMembers,
  leaveTeam,
  type TeamMemberListResponse,
} from '../api/teamApi';
import { ApiError, getApiErrorMessage } from '../api/httpClient';
import { getAccessToken } from '../auth/tokenStorage';
import { useAuth } from '../context/AuthContext';
import { getCategoryById } from '../data/categories';
import { getTeamById } from '../data/teams';
import { withMock } from '../lib/mockData';
import '../styles/teamShared.css';

export function TeamLeavePage() {
  const { user } = useAuth();
  const { teamId = '' } = useParams();
  const navigate = useNavigate();
  const numericTeamId = Number(teamId);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [members, setMembers] = useState<TeamMemberListResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);
  const [requiresDelegation, setRequiresDelegation] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const team = withMock(getTeamById(numericTeamId), undefined);

  useEffect(() => {
    const accessToken = getAccessToken();
    if (!accessToken || !Number.isInteger(numericTeamId) || numericTeamId <= 0) {
      setIsLoading(false);
      return;
    }

    let active = true;
    setIsLoading(true);
    setLoadError(null);

    getTeamMembers(numericTeamId, accessToken)
      .then((response) => {
        if (active) {
          setMembers(response);
        }
      })
      .catch((error) => {
        if (active) {
          setMembers([]);
          setLoadError(getApiErrorMessage(error, '팀원 정보를 불러오지 못했습니다.'));
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [numericTeamId]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!team) {
    return (
      <MainLayout active="팀 찾기">
        <div className="nm-empty-state">존재하지 않는 팀입니다.</div>
      </MainLayout>
    );
  }

  const currentMember = members.find((member) => member.userId === user.id);
  if (!isLoading && !loadError && !currentMember) {
    return <Navigate to={`/teams/${team.id}`} replace />;
  }

  const category = getCategoryById(team.categoryId);
  const isLeader = currentMember?.role === 'OWNER';
  const mustDelegateFirst = isLeader && (members.length > 1 || requiresDelegation);

  const handleLeave = async () => {
    const accessToken = getAccessToken();
    if (!accessToken || isLeaving) return;

    setIsLeaving(true);
    setLoadError(null);

    try {
      await leaveTeam(numericTeamId, accessToken);
      navigate('/mypage/teams', { replace: true });
    } catch (error) {
      setConfirmOpen(false);
      if (error instanceof ApiError && error.code === 'T010') {
        setRequiresDelegation(true);
      }
      setLoadError(getApiErrorMessage(error, '팀 탈퇴를 처리하지 못했습니다.'));
    } finally {
      setIsLeaving(false);
    }
  };

  return (
    <MainLayout active="팀 찾기">
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '64px 24px 120px' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <span className="nm-team-tag">{category?.ko}</span>
        </div>
        <h1 style={{ font: 'var(--text-title-1)', color: 'var(--label-normal)', margin: '0 0 28px' }}>{team.name} — 설정</h1>

        {loadError && (
          <div className="nm-field__hint nm-field__hint--error" style={{ marginBottom: 16 }}>
            {loadError}
          </div>
        )}

        {isLoading ? (
          <div className="nm-empty-state">팀원 정보를 불러오는 중이에요.</div>
        ) : !currentMember ? null : mustDelegateFirst ? (
          <div className="nm-settings-card">
            <div className="nm-settings-card__title" style={{ color: 'var(--status-negative)' }}>
              현재 탈퇴하려는 팀의 주장입니다
            </div>
            <div className="nm-settings-card__desc">다음 주장을 선택하고 탈퇴하여 주십시오. 팀원이 여러 명인 팀에서는 위임 없이 바로 탈퇴할 수 없어요.</div>
            <Button label="팀장 위임하러 가기" variant="outlined" color="assistive" size="md" style={{ marginTop: 16 }} onClick={() => navigate(`/teams/${team.id}/settings`)} />
          </div>
        ) : (
          <div className="nm-settings-card nm-settings-card--danger">
            <div className="nm-settings-card__title" style={{ color: 'var(--status-negative)' }}>
              {isLeader ? '팀 해체' : '팀 탈퇴'}
            </div>
            <div className="nm-settings-card__desc">
              {isLeader
                ? '팀을 해체하면 되돌릴 수 없어요.'
                : '팀을 탈퇴하면 팀 채널과 활동 기록에서 제외돼요. 다시 가입하려면 팀장의 승인이 필요해요.'}
            </div>
            <Button
              label={isLeader ? '팀 해체하기' : '팀 탈퇴하기'}
              variant="outlined"
              color="assistive"
              size="md"
              style={{ marginTop: 20 }}
              onClick={() => setConfirmOpen(true)}
            />
          </div>
        )}
      </div>

      {confirmOpen && (
        <ConfirmModal
          title={isLeader ? '정말 해체하시겠습니까?' : '정말 팀을 탈퇴하시겠습니까?'}
          description={isLeader ? undefined : '다시 가입하려면 팀장의 승인이 필요합니다.'}
          confirmLabel={isLeaving ? '처리 중...' : isLeader ? '해체하기' : '탈퇴하기'}
          confirmDisabled={isLeaving}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={() => void handleLeave()}
        />
      )}
    </MainLayout>
  );
}

export default TeamLeavePage;
