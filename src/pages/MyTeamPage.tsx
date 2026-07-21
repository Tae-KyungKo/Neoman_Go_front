import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import MyPageLayout from '../components/MyPageLayout';
import Chip from '../components/Chip';
import Button from '../components/Button';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { getCategoryById } from '../data/categories';
import { getTeamById, MY_APPLICATIONS, MY_TEAMS } from '../data/teams';
import { withMock } from '../lib/mockData';
import '../styles/teamShared.css';

type Tab = 'teams' | 'apps';

const STATUS_TONE = { pending: 'caution', rejected: 'negative', approved: 'positive' } as const;
const STATUS_LABEL = { pending: '대기 중', rejected: '거절됨', approved: '승인됨' } as const;

export function MyTeamPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('teams');

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const myTeams = withMock(MY_TEAMS, []);
  const myApplications = withMock(MY_APPLICATIONS, []);

  return (
    <MyPageLayout active="team">
      <h1 style={{ font: 'var(--text-title-1)', color: 'var(--label-normal)', margin: '0 0 24px' }}>My TEAM</h1>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <Chip active={tab === 'teams'} onClick={() => setTab('teams')}>
          소속된 팀 ({myTeams.length})
        </Chip>
        <Chip active={tab === 'apps'} onClick={() => setTab('apps')}>
          신청 현황 ({myApplications.length})
        </Chip>
      </div>

      <div className="nm-list-card">
        {tab === 'teams'
          ? myTeams.map((entry) => {
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
            })
          : myApplications.map((app) => {
              const team = getTeamById(app.teamId);
              if (!team) return null;
              const category = getCategoryById(team.categoryId);
              return (
                <div key={app.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 20px', borderBottom: '1px solid var(--line-normal-normal)' }}>
                  <span className="nm-team-tag">{category?.ko}</span>
                  <span style={{ flex: 1, font: 'var(--text-body-1-medium)', color: 'var(--label-normal)' }}>{team.name}</span>
                  <StatusBadge label={STATUS_LABEL[app.status]} tone={STATUS_TONE[app.status]} />
                  {app.status === 'pending' && <Button label="신청 취소" variant="outlined" color="assistive" size="sm" />}
                </div>
              );
            })}
        {(tab === 'teams' ? myTeams.length : myApplications.length) === 0 && <div className="nm-empty-state">아직 내역이 없어요.</div>}
      </div>
    </MyPageLayout>
  );
}

export default MyTeamPage;
