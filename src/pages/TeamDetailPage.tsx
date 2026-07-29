import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import Button from '../components/Button';
import Avatar from '../components/Avatar';
import StatusBadge from '../components/StatusBadge';
import Icon from '../components/icons/Icon';
import TextareaField from '../components/TextareaField';
import {
  createTeamApplication,
  getMyTeamApplications,
  getTeam,
  type TeamDetailResponse,
} from '../api/teamApi';
import { ApiError, getApiErrorMessage } from '../api/httpClient';
import { getAccessToken } from '../auth/tokenStorage';
import { getCategoryByApiCode } from '../data/categories';
import { useAuth } from '../context/AuthContext';
import '../styles/teamShared.css';
import './TeamDetailPage.css';

export function TeamDetailPage() {
  const { teamId = '' } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const numericTeamId = Number(teamId);
  const [team, setTeam] = useState<TeamDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);
  const [applyMessage, setApplyMessage] = useState('');
  const [applyError, setApplyError] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [hasPendingApplication, setHasPendingApplication] = useState(false);
  const [isApplicationStatusLoading, setIsApplicationStatusLoading] = useState(false);

  useEffect(() => {
    if (!Number.isInteger(numericTeamId) || numericTeamId <= 0) {
      setNotFound(true);
      setIsLoading(false);
      return;
    }

    let active = true;
    setIsLoading(true);
    setLoadError(null);
    setNotFound(false);

    getTeam(numericTeamId)
      .then((response) => {
        if (active) setTeam(response);
      })
      .catch((error) => {
        if (!active) return;
        setTeam(null);
        if (error instanceof ApiError && error.status === 404) {
          setNotFound(true);
        } else {
          setLoadError(getApiErrorMessage(error, '팀 정보를 불러오지 못했습니다.'));
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [numericTeamId]);

  useEffect(() => {
    if (!user || !Number.isInteger(numericTeamId) || numericTeamId <= 0) {
      setHasPendingApplication(false);
      setIsApplicationStatusLoading(false);
      return;
    }

    const accessToken = getAccessToken();
    if (!accessToken) {
      setHasPendingApplication(false);
      setIsApplicationStatusLoading(false);
      return;
    }

    let active = true;
    setIsApplicationStatusLoading(true);

    getMyTeamApplications(accessToken)
      .then((applications) => {
        if (!active) return;
        setHasPendingApplication(
          applications.some(
            (application) =>
              application.teamId === numericTeamId && application.status === 'PENDING',
          ),
        );
      })
      .catch(() => {
        if (active) {
          setHasPendingApplication(false);
        }
      })
      .finally(() => {
        if (active) {
          setIsApplicationStatusLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [numericTeamId, user]);

  const currentMember = team?.members.find(
    (member) => member.status === 'ACTIVE' && member.userId === user?.id,
  );
  const role = !user
    ? 'guest'
    : currentMember?.role === 'OWNER'
      ? 'owner'
      : currentMember
        ? 'member'
        : 'user';

  const handleApply = async () => {
    if (!team) {
      return;
    }

    if (role === 'guest') {
      navigate('/login');
      return;
    }

    const accessToken = getAccessToken();
    if (!accessToken || isApplying) {
      return;
    }

    setApplyError(null);
    setIsApplying(true);

    try {
      const application = await createTeamApplication(
        team.id,
        { message: applyMessage.trim() || null },
        accessToken,
      );
      setHasPendingApplication(application.status === 'PENDING');
      setApplyMessage('');
      setApplyOpen(false);
    } catch (error) {
      if (error instanceof ApiError && error.code === 'TA002') {
        setHasPendingApplication(true);
        setApplyMessage('');
        setApplyOpen(false);
        return;
      }
      setApplyError(getApiErrorMessage(error, '가입 신청에 실패했습니다.'));
    } finally {
      setIsApplying(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout active="팀 찾기">
        <div className="nm-team-detail">
          <div className="nm-empty-state">팀 정보를 불러오는 중이에요.</div>
        </div>
      </MainLayout>
    );
  }

  if (loadError) {
    return (
      <MainLayout active="팀 찾기">
        <div className="nm-team-detail">
          <div className="nm-empty-state">
            <div>{loadError}</div>
            <Button label="다시 시도" variant="outlined" color="assistive" size="md" onClick={() => window.location.reload()} />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (notFound || !team) {
    return (
      <MainLayout active="팀 찾기">
        <div className="nm-team-detail">
          <div className="nm-empty-state">존재하지 않는 팀입니다.</div>
        </div>
      </MainLayout>
    );
  }

  const category = getCategoryByApiCode(team.category);
  const showFormation =
    (team.category === 'SOCCER_FUTSAL' || team.category === 'BASKETBALL') &&
    (role === 'member' || role === 'owner');
  const activeMembers = team.members.filter((member) => member.status === 'ACTIVE');
  const createdAt = new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium' }).format(
    new Date(team.createdAt),
  );

  return (
    <MainLayout active="팀 찾기">
      <div className="nm-team-detail">
        <div className="nm-team-detail__main">
          <div className="nm-team-detail__hero">
            <div className="nm-team-detail__tags">
              <span className="nm-team-tag">{category?.ko}</span>
              <StatusBadge label={team.status === 'RECRUITING' ? '모집 중' : '마감'} tone={team.status === 'RECRUITING' ? 'positive' : 'neutral'} />
            </div>
            <h1 className="nm-team-detail__name">{team.name}</h1>
            <div className="nm-team-detail__owner-line">
              팀장 {team.owner.nickname} · {createdAt} 생성
            </div>
            <p className="nm-team-detail__desc">{team.description}</p>
          </div>

          <div className="nm-info-card" style={{ marginBottom: 24 }}>
            <div className="nm-info-card__row">
              <Icon name="Pin" size={16} />
              {team.location}
            </div>
            <div className="nm-info-card__row">
              <Icon name="Clock" size={16} />
              {team.activityTime}
            </div>
            <div className="nm-info-card__row">
              <Icon name="Persons" size={16} />
              {team.memberCount}명 활동 중
            </div>
          </div>

          <h3 style={{ font: 'var(--text-heading-1)', color: 'var(--label-normal)', margin: '0 0 12px' }}>팀원 ({team.memberCount}명)</h3>
          <div className="nm-list-card" style={{ padding: '4px 20px', marginBottom: 24 }}>
            {activeMembers.map((member) => (
              <div key={member.userId} className="nm-roster-row">
                <Avatar size={32} />
                <span style={{ font: 'var(--text-body-2-semibold)', color: 'var(--label-normal)' }}>{member.nickname}</span>
                <span className={'nm-roster-role' + (member.role === 'OWNER' ? ' nm-roster-role--leader' : '')}>
                  {member.role === 'OWNER' ? '팀장' : '팀원'}
                </span>
              </div>
            ))}
          </div>

          {role === 'owner' && (
            <div style={{ marginBottom: showFormation ? 24 : 0 }}>
              <h3 style={{ font: 'var(--text-heading-1)', color: 'var(--label-normal)', margin: '0 0 12px' }}>팀장 관리</h3>
              <p style={{ font: 'var(--text-body-2-regular)', color: 'var(--label-alternative-2)', marginBottom: 12 }}>
                가입 신청 승인·거절, 팀원 강퇴, 팀 마감·삭제는 팀 관리 페이지에서 진행할 수 있어요.
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <Button label="가입 신청 관리" variant="outlined" color="assistive" size="md" onClick={() => navigate(`/teams/${team.id}/manage`)} />
                <Button label="팀 설정으로 이동" variant="outlined" color="assistive" size="md" onClick={() => navigate(`/teams/${team.id}/settings`)} />
              </div>
            </div>
          )}

          {showFormation && (
            <div className="nm-settings-card">
              <div className="nm-settings-card__title">포메이션 회의</div>
              <div className="nm-settings-card__desc">경기 전 팀원들과 함께 포지션을 드래그로 배치하며 전략을 맞춰보세요. 팀에 소속된 팀원만 입장할 수 있어요.</div>
              {team.category === 'BASKETBALL' ? (
                <Link to={`/teams/${team.id}/formation/basketball`}>
                  <Button label="농구 포메이션" variant="outlined" color="assistive" size="md" style={{ marginTop: 16 }} />
                </Link>
              ) : (
                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                  <Link to={`/teams/${team.id}/formation/soccer`}>
                    <Button label="축구 포메이션" variant="outlined" color="assistive" size="md" />
                  </Link>
                  <Link to={`/teams/${team.id}/formation/futsal`}>
                    <Button label="풋살 포메이션" variant="outlined" color="assistive" size="md" />
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="nm-team-detail__sidebar">
          <div className="nm-info-card nm-team-detail__sidebar-inner">
            <div style={{ font: 'var(--text-caption-1-medium)', color: 'var(--label-alternative-2)', marginBottom: 4 }}>현재 팀원</div>
            <div style={{ font: 'var(--text-title-2)', color: 'var(--label-normal)', marginBottom: 20 }}>{team.memberCount}명</div>
            {role === 'guest' && (
              <Button label="참가 신청" variant="solid" color="primary" size="lg" fullWidth onClick={() => setApplyOpen(true)} />
            )}
            {role === 'user' && isApplicationStatusLoading && (
              <Button label="신청 상태 확인 중..." variant="outlined" color="assistive" size="lg" fullWidth disabled />
            )}
            {role === 'user' && !isApplicationStatusLoading && hasPendingApplication && (
              <Button label="신청 접수 됨" variant="outlined" color="assistive" size="lg" fullWidth disabled />
            )}
            {role === 'user' && !isApplicationStatusLoading && !hasPendingApplication && team.status === 'RECRUITING' && (
              <Button label="참가 신청" variant="solid" color="primary" size="lg" fullWidth onClick={() => setApplyOpen(true)} />
            )}
            {role === 'user' && !isApplicationStatusLoading && !hasPendingApplication && team.status === 'CLOSED' && (
              <Button label="모집 마감됨" variant="outlined" color="assistive" size="lg" fullWidth disabled />
            )}
            {role === 'member' && (
              <Button label="팀 탈퇴" variant="outlined" color="assistive" size="lg" fullWidth onClick={() => navigate(`/teams/${team.id}/leave`)} />
            )}
            {role === 'owner' && (
              <div style={{ font: 'var(--text-caption-1-medium)', color: 'var(--label-alternative-3)', textAlign: 'center' }}>
                팀장은 위임 후 탈퇴할 수 있어요
              </div>
            )}
          </div>
        </div>
      </div>

      {applyOpen && (
        <div className="nm-modal-backdrop" onClick={() => setApplyOpen(false)}>
          <div className="nm-modal-card" style={{ width: 420 }} onClick={(e) => e.stopPropagation()}>
            <h3 className="nm-modal-card__title" style={{ marginBottom: 4 }}>
              {team.name} 팀에 신청하기
            </h3>
            <p style={{ font: 'var(--text-caption-1-medium)', color: 'var(--label-alternative-2)', margin: '0 0 16px' }}>팀장에게 전달할 메시지를 남겨주세요.</p>
            <TextareaField
              label=""
              value={applyMessage}
              onChange={(e) => setApplyMessage(e.target.value)}
              placeholder="간단한 자기소개와 활동 가능 시간을 알려주세요"
              maxLength={500}
              style={{ minHeight: 100, marginBottom: 8 }}
            />
            {role === 'guest' && <div className="nm-field__hint nm-field__hint--error" style={{ marginBottom: 8 }}>신청하려면 로그인이 필요해요.</div>}
            {applyError && <div className="nm-field__hint nm-field__hint--error" style={{ marginBottom: 8 }}>{applyError}</div>}
            <div className="nm-modal-card__actions" style={{ marginTop: 12 }}>
              <Button label="취소" variant="outlined" color="assistive" size="md" onClick={() => setApplyOpen(false)} />
              <Button
                label={role === 'guest' ? '로그인하러 가기' : isApplying ? '신청 중...' : '신청하기'}
                variant="solid"
                color="primary"
                size="md"
                disabled={isApplying}
                onClick={handleApply}
              />
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

export default TeamDetailPage;
