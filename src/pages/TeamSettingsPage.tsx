import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import Button from '../components/Button';
import Avatar from '../components/Avatar';
import ConfirmModal from '../components/ConfirmModal';
import {
  closeTeam,
  delegateTeamOwner,
  deleteTeam,
  getTeam,
  getTeamMembers,
  reopenTeam,
  type TeamDetailResponse,
  type TeamMemberListResponse,
} from '../api/teamApi';
import { ApiError, getApiErrorMessage } from '../api/httpClient';
import { getAccessToken } from '../auth/tokenStorage';
import { useAuth } from '../context/AuthContext';
import { getCategoryByApiCode } from '../data/categories';
import '../styles/teamShared.css';

type Dialog = 'delegate' | 'close' | 'reopen' | 'delete' | null;

export function TeamSettingsPage() {
  const { user } = useAuth();
  const { teamId = '' } = useParams();
  const navigate = useNavigate();
  const numericTeamId = Number(teamId);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [nameInput, setNameInput] = useState('');
  const [members, setMembers] = useState<TeamMemberListResponse[]>([]);
  const [selectedTeamMemberId, setSelectedTeamMemberId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [processingDialog, setProcessingDialog] = useState<Exclude<Dialog, null> | null>(null);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [team, setTeam] = useState<TeamDetailResponse | null>(null);

  useEffect(() => {
    const accessToken = getAccessToken();
    if (!accessToken || !Number.isInteger(numericTeamId) || numericTeamId <= 0) {
      setIsLoading(false);
      return;
    }

    let active = true;
    setIsLoading(true);
    setSettingsError(null);

    Promise.all([getTeam(numericTeamId), getTeamMembers(numericTeamId, accessToken)])
      .then(([teamResponse, memberResponse]) => {
        if (active) {
          setTeam(teamResponse);
          setMembers(memberResponse);
        }
      })
      .catch((error) => {
        if (active) {
          setMembers([]);
          setSettingsError(getApiErrorMessage(error, '팀원 정보를 불러오지 못했습니다.'));
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

  if (isLoading) {
    return (
      <MainLayout active="팀 찾기">
        <div className="nm-empty-state">팀 설정을 불러오는 중이에요.</div>
      </MainLayout>
    );
  }

  if (!team) {
    return (
      <MainLayout active="팀 찾기">
        <div className="nm-empty-state">
          {settingsError ?? '존재하지 않는 팀입니다.'}
        </div>
      </MainLayout>
    );
  }

  const currentMember = members.find((member) => member.userId === user.id);
  if (!isLoading && !settingsError && currentMember?.role !== 'OWNER') {
    return <Navigate to="/forbidden" replace />;
  }

  const category = getCategoryByApiCode(team.category);
  const otherMembers = members.filter((member) => member.role === 'MEMBER');

  const handleApiError = (error: unknown, fallback: string) => {
    if (error instanceof ApiError && error.status === 403) {
      navigate('/forbidden', { replace: true });
      return;
    }
    setSettingsError(getApiErrorMessage(error, fallback));
    setDialog(null);
  };

  const handleDelegate = async () => {
    const accessToken = getAccessToken();
    if (!accessToken || selectedTeamMemberId === null || processingDialog) return;

    setProcessingDialog('delegate');
    setSettingsError(null);
    try {
      await delegateTeamOwner(numericTeamId, selectedTeamMemberId, accessToken);
      navigate(`/teams/${team.id}`, { replace: true });
    } catch (error) {
      handleApiError(error, '팀장 권한을 위임하지 못했습니다.');
    } finally {
      setProcessingDialog(null);
    }
  };

  const handleClose = async () => {
    const accessToken = getAccessToken();
    if (!accessToken || processingDialog) return;

    setProcessingDialog('close');
    setSettingsError(null);
    try {
      await closeTeam(numericTeamId, accessToken);
      setTeam((currentTeam) =>
        currentTeam ? { ...currentTeam, status: 'CLOSED' } : currentTeam,
      );
      setDialog(null);
    } catch (error) {
      handleApiError(error, '팀 모집을 마감하지 못했습니다.');
    } finally {
      setProcessingDialog(null);
    }
  };

  const handleReopen = async () => {
    const accessToken = getAccessToken();
    if (!accessToken || processingDialog) return;

    setProcessingDialog('reopen');
    setSettingsError(null);
    try {
      await reopenTeam(numericTeamId, accessToken);
      setTeam((currentTeam) =>
        currentTeam ? { ...currentTeam, status: 'RECRUITING' } : currentTeam,
      );
      setDialog(null);
    } catch (error) {
      handleApiError(error, '팀 모집을 다시 진행하지 못했습니다.');
    } finally {
      setProcessingDialog(null);
    }
  };

  const handleDelete = async () => {
    const accessToken = getAccessToken();
    if (!accessToken || nameInput !== team.name || processingDialog) return;

    setProcessingDialog('delete');
    setSettingsError(null);
    try {
      await deleteTeam(numericTeamId, accessToken);
      navigate('/teams', { replace: true });
    } catch (error) {
      handleApiError(error, '팀을 삭제하지 못했습니다.');
    } finally {
      setProcessingDialog(null);
    }
  };

  return (
    <MainLayout active="팀 찾기">
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '56px 24px 120px' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <span className="nm-team-tag">{category?.ko}</span>
        </div>
        <h1 style={{ font: 'var(--text-title-1)', color: 'var(--label-normal)', margin: '0 0 28px' }}>{team.name} — 팀 설정</h1>

        {settingsError && (
          <div className="nm-field__hint nm-field__hint--error" style={{ marginBottom: 16 }}>
            {settingsError}
          </div>
        )}

        {currentMember?.role === 'OWNER' ? (
          <>
            <div className="nm-settings-card">
              <div className="nm-settings-card__title">팀장 위임</div>
              <div className="nm-settings-card__desc">다른 팀원에게 팀장 권한을 넘겨요. 위임 즉시 본인은 팀원이 됩니다.</div>
              <Button
                label="팀장 위임하기"
                variant="outlined"
                color="assistive"
                size="md"
                style={{ marginTop: 16 }}
                disabled={otherMembers.length === 0}
                onClick={() => {
                  setSelectedTeamMemberId(null);
                  setDialog('delegate');
                }}
              />
            </div>

            <div className="nm-settings-card">
              <div className="nm-settings-card__title">모집 상태</div>
              <div className="nm-settings-card__desc">
                {team.status === 'RECRUITING'
                  ? '현재 모집 중이에요. 마감 후에는 새로운 가입 신청을 받을 수 없어요.'
                  : '현재 모집이 마감됐어요. 모집을 다시 진행하면 새로운 가입 신청을 받을 수 있어요.'}
              </div>
              <Button
                label={team.status === 'RECRUITING' ? '모집 마감하기' : '모집 진행하기'}
                variant="outlined"
                color="assistive"
                size="md"
                style={{ marginTop: 16 }}
                onClick={() => setDialog(team.status === 'RECRUITING' ? 'close' : 'reopen')}
              />
            </div>

            <div className="nm-settings-card nm-settings-card--danger">
              <div className="nm-settings-card__title" style={{ color: 'var(--status-negative)' }}>
                팀 삭제
              </div>
              <div className="nm-settings-card__desc">삭제 후 일반 사용자 화면에서 팀을 다시 조회할 수 없어요. 이 작업은 되돌릴 수 없어요.</div>
              <Button label="팀 삭제하기" variant="outlined" color="assistive" size="md" style={{ marginTop: 16 }} onClick={() => setDialog('delete')} />
            </div>
          </>
        ) : null}
      </div>

      {dialog === 'delegate' && (
        <ConfirmModal
          title="팀장을 위임하시겠습니까?"
          confirmLabel={processingDialog === 'delegate' ? '처리 중...' : '위임하기'}
          confirmDisabled={selectedTeamMemberId === null || processingDialog !== null}
          onCancel={() => setDialog(null)}
          onConfirm={() => void handleDelegate()}
        >
          <div className="nm-list-card" style={{ marginBottom: 16 }}>
            {otherMembers.map((member) => (
              <div
                key={member.teamMemberId}
                className="nm-roster-row"
                style={{
                  cursor: 'pointer',
                  background: selectedTeamMemberId === member.teamMemberId
                    ? 'var(--background-normal-alternative)'
                    : undefined,
                }}
                onClick={() => setSelectedTeamMemberId(member.teamMemberId)}
              >
                <Avatar size={32} />
                <span style={{ font: 'var(--text-body-2-semibold)', color: 'var(--label-normal)' }}>{member.nickname}</span>
                <span className="nm-roster-role">
                  {selectedTeamMemberId === member.teamMemberId ? '선택됨' : '새 팀장으로 지정'}
                </span>
              </div>
            ))}
          </div>
          <p style={{ font: 'var(--text-body-2-regular)', color: 'var(--label-alternative-2)', margin: '0 0 4px' }}>
            현재 팀장: {currentMember?.nickname} → 위임 후 본인은 팀원이 됩니다. 즉시 반영돼요.
          </p>
        </ConfirmModal>
      )}

      {dialog === 'close' && (
        <ConfirmModal
          title="팀 모집을 마감하시겠습니까?"
          description="마감 후 새로운 가입 신청을 받을 수 없습니다."
          confirmLabel={processingDialog === 'close' ? '처리 중...' : '마감하기'}
          confirmDisabled={processingDialog !== null}
          onCancel={() => setDialog(null)}
          onConfirm={() => void handleClose()}
        />
      )}

      {dialog === 'reopen' && (
        <ConfirmModal
          title="팀 모집을 다시 진행하시겠습니까?"
          description="변경 후 새로운 가입 신청을 받을 수 있습니다."
          confirmLabel={processingDialog === 'reopen' ? '처리 중...' : '모집 진행하기'}
          confirmDisabled={processingDialog !== null}
          onCancel={() => setDialog(null)}
          onConfirm={() => void handleReopen()}
        />
      )}

      {dialog === 'delete' && (
        <ConfirmModal
          title="팀을 삭제하시겠습니까?"
          description="삭제 후 일반 사용자 화면에서 팀을 다시 조회할 수 없습니다. 확인을 위해 팀 이름을 입력해주세요."
          confirmLabel={processingDialog === 'delete' ? '처리 중...' : '삭제하기'}
          titleColor="var(--status-negative)"
          confirmDisabled={nameInput !== team.name || processingDialog !== null}
          onCancel={() => {
            setDialog(null);
            setNameInput('');
          }}
          onConfirm={() => void handleDelete()}
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
