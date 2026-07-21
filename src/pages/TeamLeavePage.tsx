import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import Button from '../components/Button';
import ConfirmModal from '../components/ConfirmModal';
import { getCategoryById } from '../data/categories';
import { getTeamById } from '../data/teams';
import { useTeamRole } from '../lib/teamRole';
import { withMock } from '../lib/mockData';
import '../styles/teamShared.css';

export function TeamLeavePage() {
  const { teamId = '' } = useParams();
  const navigate = useNavigate();
  const role = useTeamRole(Number(teamId));
  const [confirmOpen, setConfirmOpen] = useState(false);

  const team = withMock(getTeamById(Number(teamId)), undefined);

  if (!team) {
    return (
      <MainLayout active="팀 찾기">
        <div className="nm-empty-state">존재하지 않는 팀입니다.</div>
      </MainLayout>
    );
  }
  if (role !== 'member' && role !== 'owner') {
    return <Navigate to={`/teams/${team.id}`} replace />;
  }

  const category = getCategoryById(team.categoryId);
  const isLeader = role === 'owner';
  const mustDelegateFirst = isLeader && team.roster.length > 1;

  return (
    <MainLayout active="팀 찾기">
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '64px 24px 120px' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <span className="nm-team-tag">{category?.ko}</span>
        </div>
        <h1 style={{ font: 'var(--text-title-1)', color: 'var(--label-normal)', margin: '0 0 28px' }}>{team.name} — 설정</h1>

        {mustDelegateFirst ? (
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
                ? '팀을 해체하면 모든 팀원이 함께 방출되고, 팀 게시글과 활동 기록도 함께 삭제돼요. 이 작업은 되돌릴 수 없어요.'
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
          title={isLeader ? '정말 팀을 해체하시겠습니까?' : '정말 팀을 탈퇴하시겠습니까?'}
          description={isLeader ? '모든 팀원과 활동 기록이 함께 삭제되며 복구할 수 없습니다.' : '다시 가입하려면 팀장의 승인이 필요합니다.'}
          confirmLabel={isLeader ? '해체하기' : '탈퇴하기'}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={() => {
            setConfirmOpen(false);
            navigate('/mypage/teams');
          }}
        />
      )}
    </MainLayout>
  );
}

export default TeamLeavePage;
