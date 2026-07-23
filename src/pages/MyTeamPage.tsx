import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import MyPageLayout from '../components/MyPageLayout';
import Chip from '../components/Chip';
import Button from '../components/Button';
import StatusBadge from '../components/StatusBadge';
import {
  cancelTeamApplication,
  getMyTeamApplications,
  type TeamApplicationSummaryResponse,
} from '../api/teamApi';
import { getApiErrorMessage } from '../api/httpClient';
import { getAccessToken } from '../auth/tokenStorage';
import { useAuth } from '../context/AuthContext';
import { getCategoryById } from '../data/categories';
import { getTeamById, MY_TEAMS } from '../data/teams';
import { withMock } from '../lib/mockData';
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

export function MyTeamPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('teams');
  const [applications, setApplications] = useState<TeamApplicationSummaryResponse[]>([]);
  const [isLoadingApplications, setIsLoadingApplications] = useState(true);
  const [cancelingApplicationId, setCancelingApplicationId] = useState<number | null>(null);
  const [applicationError, setApplicationError] = useState<string | null>(null);

  useEffect(() => {
    const accessToken = getAccessToken();
    if (!accessToken) {
      setIsLoadingApplications(false);
      return;
    }

    let active = true;
    setIsLoadingApplications(true);
    setApplicationError(null);

    getMyTeamApplications(accessToken)
      .then((response) => {
        if (active) {
          setApplications(response);
        }
      })
      .catch((error) => {
        if (active) {
          setApplications([]);
          setApplicationError(getApiErrorMessage(error, '신청 현황을 불러오지 못했습니다.'));
        }
      })
      .finally(() => {
        if (active) {
          setIsLoadingApplications(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const myTeams = withMock(MY_TEAMS, []);

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

  return (
    <MyPageLayout active="team">
      <h1 style={{ font: 'var(--text-title-1)', color: 'var(--label-normal)', margin: '0 0 24px' }}>My TEAM</h1>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <Chip active={tab === 'teams'} onClick={() => setTab('teams')}>
          소속된 팀 ({myTeams.length})
        </Chip>
        <Chip active={tab === 'apps'} onClick={() => setTab('apps')}>
          신청 현황 ({applications.length})
        </Chip>
      </div>

      {tab === 'apps' && applicationError && (
        <div className="nm-field__hint nm-field__hint--error" style={{ marginBottom: 12 }}>
          {applicationError}
        </div>
      )}

      <div className="nm-list-card">
        {tab === 'teams' &&
          myTeams.map((entry) => {
            const team = getTeamById(entry.teamId);
            if (!team) return null;
            const category = getCategoryById(team.categoryId);
            return (
              <div key={entry.teamId} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 20px', borderBottom: '1px solid var(--line-normal-normal)' }}>
                <span className="nm-team-tag">{category?.ko}</span>
                <span style={{ flex: 1, font: 'var(--text-body-1-medium)', color: 'var(--label-normal)' }}>{team.name}</span>
                <span style={{ font: 'var(--text-caption-1-semibold)', color: entry.role === '팀장' ? 'var(--primary-normal-3)' : 'var(--label-alternative-2)' }}>
                  {entry.role}
                </span>
                <Button label="팀 페이지" variant="outlined" color="assistive" size="sm" onClick={() => navigate(`/teams/${team.id}`)} />
              </div>
            );
          })}

        {tab === 'apps' &&
          !isLoadingApplications &&
          applications.map((application) => {
            const category = getCategoryById(application.category);
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
              </div>
            );
          })}

        {tab === 'teams' && myTeams.length === 0 && <div className="nm-empty-state">아직 내역이 없어요.</div>}
        {tab === 'apps' && isLoadingApplications && <div className="nm-empty-state">신청 현황을 불러오는 중이에요.</div>}
        {tab === 'apps' && !isLoadingApplications && applications.length === 0 && <div className="nm-empty-state">아직 내역이 없어요.</div>}
      </div>
    </MyPageLayout>
  );
}

export default MyTeamPage;
