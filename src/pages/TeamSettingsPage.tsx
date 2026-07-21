import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import Button from '../components/Button';
import Avatar from '../components/Avatar';
import ConfirmModal from '../components/ConfirmModal';
import { getCategoryById } from '../data/categories';
import { getTeamById } from '../data/teams';
import { useTeamRole } from '../lib/teamRole';
import { withMock } from '../lib/mockData';
import '../styles/teamShared.css';

type Dialog = 'delegate' | 'close' | 'delete' | null;

export function TeamSettingsPage() {
  const { teamId = '' } = useParams();
  const navigate = useNavigate();
  const role = useTeamRole(Number(teamId));
  const [dialog, setDialog] = useState<Dialog>(null);
  const [nameInput, setNameInput] = useState('');

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
  const otherMembers = team.roster.filter((m) => m.role !== '팀장');

  return (
    <MainLayout active="팀 찾기">
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '56px 24px 120px' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <span className="nm-team-tag">{category?.ko}</span>
        </div>
        <h1 style={{ font: 'var(--text-title-1)', color: 'var(--label-normal)', margin: '0 0 28px' }}>{team.name} — 팀 설정</h1>

        <div className="nm-settings-card">
          <div className="nm-settings-card__title">팀장 위임</div>
          <div className="nm-settings-card__desc">다른 팀원에게 팀장 권한을 넘겨요. 위임 즉시 본인은 팀원이 됩니다.</div>
          <Button label="팀장 위임하기" variant="outlined" color="assistive" size="md" style={{ marginTop: 16 }} onClick={() => setDialog('delegate')} />
        </div>

        <div className="nm-settings-card">
          <div className="nm-settings-card__title">모집 마감</div>
          <div className="nm-settings-card__desc">마감 후에는 새로운 가입 신청을 받을 수 없어요. 팀은 계속 유지돼요.</div>
          <Button label="모집 마감하기" variant="outlined" color="assistive" size="md" style={{ marginTop: 16 }} onClick={() => setDialog('close')} />
        </div>

        <div className="nm-settings-card nm-settings-card--danger">
          <div className="nm-settings-card__title" style={{ color: 'var(--status-negative)' }}>
            팀 삭제
          </div>
          <div className="nm-settings-card__desc">삭제 후 일반 사용자 화면에서 팀을 다시 조회할 수 없어요. 이 작업은 되돌릴 수 없어요.</div>
          <Button label="팀 삭제하기" variant="outlined" color="assistive" size="md" style={{ marginTop: 16 }} onClick={() => setDialog('delete')} />
        </div>
      </div>

      {dialog === 'delegate' && (
        <ConfirmModal
          title="팀장을 위임하시겠습니까?"
          confirmLabel="위임하기"
          onCancel={() => setDialog(null)}
          onConfirm={() => {
            setDialog(null);
            navigate(`/teams/${team.id}`);
          }}
        >
          <div className="nm-list-card" style={{ marginBottom: 16 }}>
            {otherMembers.map((m, i) => (
              <div key={i} className="nm-roster-row" style={{ cursor: 'pointer' }}>
                <Avatar size={32} />
                <span style={{ font: 'var(--text-body-2-semibold)', color: 'var(--label-normal)' }}>{m.name}</span>
                <span className="nm-roster-role">새 팀장으로 지정</span>
              </div>
            ))}
          </div>
          <p style={{ font: 'var(--text-body-2-regular)', color: 'var(--label-alternative-2)', margin: '0 0 4px' }}>
            현재 팀장: {team.ownerName} → 위임 후 본인은 팀원이 됩니다. 즉시 반영돼요.
          </p>
        </ConfirmModal>
      )}

      {dialog === 'close' && (
        <ConfirmModal
          title="팀 모집을 마감하시겠습니까?"
          description="마감 후 새로운 가입 신청을 받을 수 없습니다."
          confirmLabel="마감하기"
          onCancel={() => setDialog(null)}
          onConfirm={() => {
            setDialog(null);
            navigate(`/teams/${team.id}`);
          }}
        />
      )}

      {dialog === 'delete' && (
        <ConfirmModal
          title="팀을 삭제하시겠습니까?"
          description="삭제 후 일반 사용자 화면에서 팀을 다시 조회할 수 없습니다. 확인을 위해 팀 이름을 입력해주세요."
          confirmLabel="삭제하기"
          titleColor="var(--status-negative)"
          confirmDisabled={nameInput !== team.name}
          onCancel={() => setDialog(null)}
          onConfirm={() => {
            setDialog(null);
            navigate('/teams');
          }}
        >
          <div className="nm-field" style={{ marginBottom: 20 }}>
            <label>팀 이름 입력</label>
            <input placeholder={team.name} value={nameInput} onChange={(e) => setNameInput(e.target.value)} />
          </div>
        </ConfirmModal>
      )}
    </MainLayout>
  );
}

export default TeamSettingsPage;
