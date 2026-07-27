import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import Button from '../components/Button';
import Avatar from '../components/Avatar';
import {
  approveTeamApplication,
  getTeam,
  getTeamApplicationsForOwner,
  getTeamMembers,
  kickTeamMember,
  rejectTeamApplication,
  type TeamApplicationOwnerResponse,
  type TeamDetailResponse,
  type TeamMemberListResponse,
} from '../api/teamApi';
import { ApiError, getApiErrorMessage } from '../api/httpClient';
import { getAccessToken } from '../auth/tokenStorage';
import { useAuth } from '../context/AuthContext';
import '../styles/teamShared.css';

export function TeamManagePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { teamId = '' } = useParams();
  const numericTeamId = Number(teamId);
  const [requests, setRequests] = useState<TeamApplicationOwnerResponse[]>([]);
  const [members, setMembers] = useState<TeamMemberListResponse[]>([]);
  const [team, setTeam] = useState<TeamDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [processingApplicationId, setProcessingApplicationId] = useState<number | null>(null);
  const [kickingMemberId, setKickingMemberId] = useState<number | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const accessToken = getAccessToken();
    if (!accessToken || !Number.isInteger(numericTeamId) || numericTeamId <= 0) {
      setIsLoading(false);
      return;
    }

    let active = true;
    setIsLoading(true);
    setLoadError(null);

    Promise.all([
      getTeam(numericTeamId),
      getTeamApplicationsForOwner(numericTeamId, accessToken),
      getTeamMembers(numericTeamId, accessToken),
    ])
      .then(([teamResponse, applicationResponse, memberResponse]) => {
        if (!active) return;
        setTeam(teamResponse);
        setRequests(applicationResponse);
        setMembers(memberResponse);
      })
      .catch((error) => {
        if (!active) return;
        if (error instanceof ApiError && error.status === 403) {
          navigate('/forbidden', { replace: true });
          return;
        }
        setRequests([]);
        setMembers([]);
        setTeam(null);
        setLoadError(getApiErrorMessage(error, '팀 관리 정보를 불러오지 못했습니다.'));
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [navigate, numericTeamId]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading && !team) {
    return (
      <MainLayout active="팀 찾기">
        <div className="nm-empty-state">팀 관리 정보를 불러오는 중이에요.</div>
      </MainLayout>
    );
  }

  if (!team) {
    return (
      <MainLayout active="팀 찾기">
        <div className="nm-empty-state">존재하지 않는 팀입니다.</div>
      </MainLayout>
    );
  }

  const handleApplication = async (
    applicationId: number,
    action: 'approve' | 'reject',
  ) => {
    const accessToken = getAccessToken();
    if (!accessToken || processingApplicationId !== null) return;

    setProcessingApplicationId(applicationId);
    setLoadError(null);

    try {
      if (action === 'approve') {
        await approveTeamApplication(applicationId, accessToken);
        const refreshedMembers = await getTeamMembers(numericTeamId, accessToken);
        setMembers(refreshedMembers);
      } else {
        await rejectTeamApplication(applicationId, accessToken);
      }
      setRequests((list) =>
        list.filter((request) => request.applicationId !== applicationId),
      );
    } catch (error) {
      if (error instanceof ApiError && error.status === 403) {
        navigate('/forbidden', { replace: true });
        return;
      }
      setLoadError(
        getApiErrorMessage(
          error,
          action === 'approve'
            ? '가입 신청을 승인하지 못했습니다.'
            : '가입 신청을 거절하지 못했습니다.',
        ),
      );
    } finally {
      setProcessingApplicationId(null);
    }
  };

  const handleKick = async (teamMemberId: number) => {
    const accessToken = getAccessToken();
    if (!accessToken || kickingMemberId !== null) return;

    setKickingMemberId(teamMemberId);
    setLoadError(null);

    try {
      await kickTeamMember(numericTeamId, teamMemberId, accessToken);
      setMembers((list) =>
        list.filter((member) => member.teamMemberId !== teamMemberId),
      );
    } catch (error) {
      if (error instanceof ApiError && error.status === 403) {
        navigate('/forbidden', { replace: true });
        return;
      }
      setLoadError(getApiErrorMessage(error, '팀원을 방출하지 못했습니다.'));
    } finally {
      setKickingMemberId(null);
    }
  };

  return (
    <MainLayout active="팀 찾기">
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '56px 24px 100px' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <span className="nm-team-tag">{team.category}</span>
        </div>
        <h1 style={{ font: 'var(--text-title-1)', color: 'var(--label-normal)', margin: '0 0 28px' }}>팀 관리 — {team.name}</h1>

        {loadError && (
          <div className="nm-field__hint nm-field__hint--error" style={{ marginBottom: 16 }}>
            {loadError}
          </div>
        )}

        <h3 style={{ font: 'var(--text-heading-1)', color: 'var(--label-normal)', margin: '0 0 12px' }}>가입 신청 ({requests.length})</h3>
        <div className="nm-list-card" style={{ marginBottom: 32 }}>
          {requests.map((r) => (
            <div key={r.applicationId} className="nm-roster-row" style={{ padding: '18px 20px' }}>
              <Avatar size={32} />
              <div style={{ flex: 1 }}>
                <span style={{ font: 'var(--text-body-1-medium)', color: 'var(--label-normal)' }}>{r.applicantNickname}</span>
                {r.message && (
                  <div style={{ font: 'var(--text-body-2-regular)', color: 'var(--label-alternative-2)', marginTop: 2 }}>{r.message}</div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <Button
                  label={processingApplicationId === r.applicationId ? '처리 중...' : '거절'}
                  variant="outlined"
                  color="assistive"
                  size="sm"
                  disabled={processingApplicationId !== null}
                  onClick={() => void handleApplication(r.applicationId, 'reject')}
                />
                <Button
                  label={processingApplicationId === r.applicationId ? '처리 중...' : '승인'}
                  variant="solid"
                  color="primary"
                  size="sm"
                  disabled={processingApplicationId !== null}
                  onClick={() => void handleApplication(r.applicationId, 'approve')}
                />
              </div>
            </div>
          ))}
          {isLoading && <div className="nm-empty-state">가입 신청을 불러오는 중이에요.</div>}
          {!isLoading && requests.length === 0 && <div className="nm-empty-state">대기 중인 신청이 없어요.</div>}
        </div>

        <h3 style={{ font: 'var(--text-heading-1)', color: 'var(--label-normal)', margin: '0 0 12px' }}>팀원 ({members.length})</h3>
        <div className="nm-list-card">
          {members.map((member) => (
            <div key={member.teamMemberId} className="nm-roster-row" style={{ padding: '18px 20px' }}>
              <Avatar size={32} />
              <div style={{ flex: 1 }}>
                <span style={{ font: 'var(--text-body-1-medium)', color: 'var(--label-normal)' }}>{member.nickname}</span>
              </div>
              <span className={'nm-roster-role' + (member.role === 'OWNER' ? ' nm-roster-role--leader' : '')}>
                {member.role === 'OWNER' ? '팀장' : '팀원'}
              </span>
              {member.role !== 'OWNER' && (
                <Button
                  label={kickingMemberId === member.teamMemberId ? '처리 중...' : '방출'}
                  variant="outlined"
                  color="assistive"
                  size="sm"
                  disabled={kickingMemberId !== null}
                  onClick={() => void handleKick(member.teamMemberId)}
                />
              )}
            </div>
          ))}
          {isLoading && <div className="nm-empty-state">팀원 목록을 불러오는 중이에요.</div>}
          {!isLoading && members.length === 0 && <div className="nm-empty-state">활동 중인 팀원이 없어요.</div>}
        </div>
      </div>
    </MainLayout>
  );
}

export default TeamManagePage;
