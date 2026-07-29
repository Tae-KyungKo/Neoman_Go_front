import { useCallback, useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import MyPageLayout from '../components/MyPageLayout';
import Chip from '../components/Chip';
import Button from '../components/Button';
import StatusBadge from '../components/StatusBadge';
import {
  cancelTeamApplication,
  getMyTeamApplications,
  getMyTeams,
  markAllTeamApplicationsAsRead,
  markTeamApplicationAsRead,
  type MyTeamSummaryResponse,
  type TeamApplicationSummaryResponse,
} from '../api/teamApi';
import { getApiErrorMessage } from '../api/httpClient';
import { getAccessToken } from '../auth/tokenStorage';
import { useAuth } from '../context/AuthContext';
import { getCategoryByApiCode } from '../data/categories';
import '../styles/teamShared.css';

type Tab = 'teams' | 'apps';
type ApplicationStatus = TeamApplicationSummaryResponse['status'];

const STATUS_TONE: Record<ApplicationStatus, 'caution' | 'negative' | 'positive' | 'neutral'> = {
  PENDING: 'caution',
  REJECTED: 'negative',
  APPROVED: 'positive',
  CANCELED: 'neutral',
};

const STATUS_LABEL: Record<ApplicationStatus, string> = {
  PENDING: '대기 중',
  REJECTED: '거절됨',
  APPROVED: '승인됨',
  CANCELED: '취소됨',
};

const TEAM_LEVEL_LABEL: Record<MyTeamSummaryResponse['level'], string> = {
  CASUAL: '즐겜',
  COMPETITIVE: '빡겜',
};

const TEAM_STATUS_LABEL: Record<MyTeamSummaryResponse['status'], string> = {
  RECRUITING: '모집 중',
  CLOSED: '모집 마감',
};

export function MyTeamPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('teams');
  const [teams, setTeams] = useState<MyTeamSummaryResponse[]>([]);
  const [isLoadingTeams, setIsLoadingTeams] = useState(true);
  const [teamError, setTeamError] = useState<string | null>(null);
  const [applications, setApplications] = useState<TeamApplicationSummaryResponse[]>([]);
  const [isLoadingApplications, setIsLoadingApplications] = useState(true);
  const [cancelingApplicationId, setCancelingApplicationId] = useState<number | null>(null);
  const [readingApplicationId, setReadingApplicationId] = useState<number | null>(null);
  const [isMarkingAllApplications, setIsMarkingAllApplications] = useState(false);
  const [applicationError, setApplicationError] = useState<string | null>(null);

  const loadApplications = useCallback(async () => {
    const accessToken = getAccessToken();
    if (!accessToken) {
      setIsLoadingApplications(false);
      setApplicationError('로그인이 만료되었습니다. 다시 로그인해 주세요.');
      return;
    }

    setIsLoadingApplications(true);
    setApplicationError(null);
    try {
      setApplications(await getMyTeamApplications(accessToken));
    } catch (error) {
      setApplications([]);
      setApplicationError(getApiErrorMessage(error, '신청 현황을 불러오지 못했습니다.'));
    } finally {
      setIsLoadingApplications(false);
    }
  }, []);

  const loadTeams = useCallback(async () => {
    const accessToken = getAccessToken();
    if (!accessToken) {
      setIsLoadingTeams(false);
      setTeamError('로그인이 만료되었습니다. 다시 로그인해 주세요.');
      return;
    }
    setIsLoadingTeams(true);
    setTeamError(null);
    try {
      setTeams(await getMyTeams(accessToken));
    } catch (error) {
      setTeams([]);
      setTeamError(getApiErrorMessage(error, '소속 팀을 불러오지 못했습니다.'));
    } finally {
      setIsLoadingTeams(false);
    }
  }, []);

  useEffect(() => {
    void loadApplications();
    void loadTeams();
  }, [loadApplications, loadTeams]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleCancel = async (applicationId: number) => {
    const accessToken = getAccessToken();
    if (!accessToken || cancelingApplicationId !== null) return;

    setCancelingApplicationId(applicationId);
    setApplicationError(null);

    try {
      const canceled = await cancelTeamApplication(applicationId, accessToken);
      setApplications((list) =>
        list.map((application) =>
          application.applicationId === applicationId
            ? { ...application, status: canceled.status }
            : application,
        ),
      );
    } catch (error) {
      setApplicationError(getApiErrorMessage(error, '가입 신청을 취소하지 못했습니다.'));
    } finally {
      setCancelingApplicationId(null);
    }
  };

  const handleMarkAsRead = async (applicationId: number) => {
    const accessToken = getAccessToken();
    if (!accessToken || readingApplicationId !== null || isMarkingAllApplications) return;

    setReadingApplicationId(applicationId);
    setApplicationError(null);
    try {
      await markTeamApplicationAsRead(applicationId, accessToken);
      setApplications((list) =>
        list.filter((application) => application.applicationId !== applicationId),
      );
    } catch (error) {
      setApplicationError(getApiErrorMessage(error, '신청 내역을 읽음 처리하지 못했습니다.'));
    } finally {
      setReadingApplicationId(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    const accessToken = getAccessToken();
    if (!accessToken || isMarkingAllApplications || applications.length === 0) return;

    setIsMarkingAllApplications(true);
    setApplicationError(null);
    try {
      await markAllTeamApplicationsAsRead(accessToken);
      setApplications([]);
    } catch (error) {
      setApplicationError(getApiErrorMessage(error, '신청 내역을 전체 읽음 처리하지 못했습니다.'));
    } finally {
      setIsMarkingAllApplications(false);
    }
  };

  return (
    <MyPageLayout active="team">
      <h1 style={{ font: 'var(--text-title-1)', color: 'var(--label-normal)', margin: '0 0 24px' }}>My TEAM</h1>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <Chip active={tab === 'teams'} onClick={() => setTab('teams')}>
          소속된 팀 ({teams.length})
        </Chip>
        <Chip active={tab === 'apps'} onClick={() => setTab('apps')}>
          신청 현황 ({applications.length})
        </Chip>
        {tab === 'apps' && applications.length > 0 && (
          <div style={{ marginLeft: 'auto' }}>
            <Button
              label={isMarkingAllApplications ? '처리 중...' : '전체 읽음'}
              variant="outlined"
              color="assistive"
              size="sm"
              disabled={isMarkingAllApplications || readingApplicationId !== null}
              onClick={() => void handleMarkAllAsRead()}
            />
          </div>
        )}
      </div>

      {tab === 'apps' && applicationError && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div className="nm-field__hint nm-field__hint--error" role="alert">{applicationError}</div>
          <Button label="다시 시도" variant="outlined" color="assistive" size="sm" onClick={() => void loadApplications()} />
        </div>
      )}
      {tab === 'teams' && teamError && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div className="nm-field__hint nm-field__hint--error" role="alert">{teamError}</div>
          <Button label="다시 시도" variant="outlined" color="assistive" size="sm" onClick={() => void loadTeams()} />
        </div>
      )}

      <div className="nm-list-card">
        {tab === 'teams' && !isLoadingTeams && teams.map((team) => {
          const category = getCategoryByApiCode(team.category);
          return (
            <div key={team.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 20px', borderBottom: '1px solid var(--line-normal-normal)' }}>
              <span className="nm-team-tag">{category?.ko ?? team.category}</span>
              <div style={{ flex: 1 }}>
                <div style={{ font: 'var(--text-body-1-medium)', color: 'var(--label-normal)' }}>{team.name}</div>
                <div style={{ font: 'var(--text-caption-1-medium)', color: 'var(--label-alternative-2)', marginTop: 3 }}>
                  {team.location} · {team.activityTime} · {team.memberCount}명
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                  <StatusBadge label={TEAM_LEVEL_LABEL[team.level]} tone={team.level === 'COMPETITIVE' ? 'caution' : 'neutral'} />
                  <StatusBadge label={TEAM_STATUS_LABEL[team.status]} tone={team.status === 'RECRUITING' ? 'positive' : 'neutral'} />
                </div>
              </div>
              <StatusBadge label={team.myRole === 'OWNER' ? '팀장' : '팀원'} tone={team.myRole === 'OWNER' ? 'positive' : 'neutral'} />
              <Button label="팀 페이지" variant="outlined" color="assistive" size="sm" onClick={() => navigate(`/teams/${team.id}`)} />
            </div>
          );
        })}
        {tab === 'apps' &&
          !isLoadingApplications &&
          applications.map((application) => {
            const category = getCategoryByApiCode(application.category);
            return (
              <div key={application.applicationId} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 20px', borderBottom: '1px solid var(--line-normal-normal)' }}>
                <span className="nm-team-tag">{category?.ko ?? application.category}</span>
                <span style={{ flex: 1, font: 'var(--text-body-1-medium)', color: 'var(--label-normal)' }}>{application.teamName}</span>
                <StatusBadge label={STATUS_LABEL[application.status]} tone={STATUS_TONE[application.status]} />
                {application.status === 'PENDING' && (
                  <Button
                    label={cancelingApplicationId === application.applicationId ? '취소 중...' : '신청 취소'}
                    variant="outlined"
                    color="assistive"
                    size="sm"
                    disabled={cancelingApplicationId !== null}
                    onClick={() => void handleCancel(application.applicationId)}
                  />
                )}
                <Button
                  label={readingApplicationId === application.applicationId ? '처리 중...' : '읽음'}
                  variant="outlined"
                  color="assistive"
                  size="sm"
                  disabled={
                    readingApplicationId !== null ||
                    isMarkingAllApplications ||
                    cancelingApplicationId === application.applicationId
                  }
                  onClick={() => void handleMarkAsRead(application.applicationId)}
                />
              </div>
            );
          })}

        {tab === 'teams' && isLoadingTeams && <div className="nm-empty-state">소속 팀을 불러오는 중이에요.</div>}
        {tab === 'teams' && !isLoadingTeams && !teamError && teams.length === 0 && <div className="nm-empty-state">아직 소속된 팀이 없어요.</div>}
        {tab === 'apps' && isLoadingApplications && <div className="nm-empty-state">신청 현황을 불러오는 중이에요.</div>}
        {tab === 'apps' && !isLoadingApplications && applications.length === 0 && <div className="nm-empty-state">확인할 신청 내역이 없어요.</div>}
      </div>
    </MyPageLayout>
  );
}

export default MyTeamPage;
