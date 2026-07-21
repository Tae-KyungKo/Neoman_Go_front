import { useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import Button from '../components/Button';
import Avatar from '../components/Avatar';
import { getCategoryById } from '../data/categories';
import { getTeamById } from '../data/teams';
import { JOIN_REQUESTS } from '../data/admin';
import { useTeamRole } from '../lib/teamRole';
import { withMock } from '../lib/mockData';
import '../styles/teamShared.css';

export function TeamManagePage() {
  const { teamId = '' } = useParams();
  const role = useTeamRole(Number(teamId));
  const [requests, setRequests] = useState(withMock(JOIN_REQUESTS, []));

  const team = withMock(getTeamById(Number(teamId)), undefined);

  if (!team) {
    return (
      <MainLayout active="팀 찾기">
        <div className="nm-empty-state">존재하지 않는 팀입니다.</div>
      </MainLayout>
    );
  }
  if (role !== 'owner') {
    return <Navigate to="/forbidden" replace />;
  }

  const category = getCategoryById(team.categoryId);

  return (
    <MainLayout active="팀 찾기">
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '56px 24px 100px' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <span className="nm-team-tag">{category?.ko}</span>
          <span className="nm-team-tag" style={{ background: 'var(--background-normal-alternative)', color: 'var(--label-alternative-2)' }}>
            {team.level}
          </span>
        </div>
        <h1 style={{ font: 'var(--text-title-1)', color: 'var(--label-normal)', margin: '0 0 28px' }}>팀 관리 — {team.name}</h1>

        <h3 style={{ font: 'var(--text-heading-1)', color: 'var(--label-normal)', margin: '0 0 12px' }}>가입 신청 ({requests.length})</h3>
        <div className="nm-list-card" style={{ marginBottom: 32 }}>
          {requests.map((r) => (
            <div key={r.id} className="nm-roster-row" style={{ padding: '18px 20px' }}>
              <Avatar size={32} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                  <span style={{ font: 'var(--text-body-1-medium)', color: 'var(--label-normal)' }}>{r.nickname}</span>
                  <span style={{ font: 'var(--text-caption-1-medium)', color: 'var(--label-alternative-2)' }}>{r.level}</span>
                </div>
                <div style={{ font: 'var(--text-body-2-regular)', color: 'var(--label-alternative-2)', marginTop: 2 }}>{r.message}</div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <Button label="거절" variant="outlined" color="assistive" size="sm" onClick={() => setRequests((list) => list.filter((x) => x.id !== r.id))} />
                <Button label="승인" variant="solid" color="primary" size="sm" onClick={() => setRequests((list) => list.filter((x) => x.id !== r.id))} />
              </div>
            </div>
          ))}
          {requests.length === 0 && <div className="nm-empty-state">대기 중인 신청이 없어요.</div>}
        </div>

        <h3 style={{ font: 'var(--text-heading-1)', color: 'var(--label-normal)', margin: '0 0 12px' }}>팀원 ({team.roster.length})</h3>
        <div className="nm-list-card">
          {team.roster.map((m, i) => (
            <div key={i} className="nm-roster-row" style={{ padding: '18px 20px' }}>
              <Avatar size={32} />
              <div style={{ flex: 1 }}>
                <span style={{ font: 'var(--text-body-1-medium)', color: 'var(--label-normal)' }}>{m.name}</span>
              </div>
              <span className={'nm-roster-role' + (m.role === '팀장' ? ' nm-roster-role--leader' : '')}>{m.role}</span>
              {m.role !== '팀장' && <Button label="방출" variant="outlined" color="assistive" size="sm" />}
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}

export default TeamManagePage;
