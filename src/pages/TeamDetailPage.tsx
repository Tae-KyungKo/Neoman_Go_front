import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import Button from '../components/Button';
import Avatar from '../components/Avatar';
import StatusBadge from '../components/StatusBadge';
import Icon from '../components/icons/Icon';
import TextareaField from '../components/TextareaField';
import { getCategoryById } from '../data/categories';
import { getTeamById } from '../data/teams';
import { useAuth } from '../context/AuthContext';
import { useTeamRole } from '../lib/teamRole';
import { withMock } from '../lib/mockData';
import '../styles/teamShared.css';
import './TeamDetailPage.css';

export function TeamDetailPage() {
  const { teamId = '' } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const role = useTeamRole(Number(teamId));
  const [applyOpen, setApplyOpen] = useState(false);
  const [applyMessage, setApplyMessage] = useState('');

  const team = withMock(getTeamById(Number(teamId)), undefined);

  if (!team) {
    return (
      <MainLayout active="팀 찾기">
        <div className="nm-team-detail">
          <div className="nm-empty-state">존재하지 않는 팀입니다.</div>
        </div>
      </MainLayout>
    );
  }

  const category = getCategoryById(team.categoryId);
  const showFormation = (team.categoryId === 'soccer' || team.categoryId === 'basketball') && (role === 'member' || role === 'owner');
  const ownerDisplayName = role === 'owner' ? user?.nickname ?? team.ownerName : team.ownerName;

  return (
    <MainLayout active="팀 찾기">
      <div className="nm-team-detail">
        <div className="nm-team-detail__main">
          <div className="nm-team-detail__hero">
            <div className="nm-team-detail__tags">
              <span className="nm-team-tag">{category?.ko}</span>
              <StatusBadge label={team.status === 'recruiting' ? '모집 중' : '마감'} tone={team.status === 'recruiting' ? 'positive' : 'neutral'} />
            </div>
            <h1 className="nm-team-detail__name">{team.name}</h1>
            <div className="nm-team-detail__owner-line">
              팀장 {ownerDisplayName} · {team.createdAt} 생성
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
              {team.time}
            </div>
            <div className="nm-info-card__row">
              <Icon name="Persons" size={16} />
              {team.roster.length}명 활동 중
            </div>
          </div>

          <h3 style={{ font: 'var(--text-heading-1)', color: 'var(--label-normal)', margin: '0 0 12px' }}>팀원 ({team.roster.length}명)</h3>
          <div className="nm-list-card" style={{ padding: '4px 20px', marginBottom: 24 }}>
            {team.roster.map((m, i) => (
              <div key={i} className="nm-roster-row">
                <Avatar size={32} />
                <span style={{ font: 'var(--text-body-2-semibold)', color: 'var(--label-normal)' }}>{m.name}</span>
                <span style={{ font: 'var(--text-caption-1-medium)', color: 'var(--label-alternative-2)' }}>{m.level}</span>
                <span className={'nm-roster-role' + (m.role === '팀장' ? ' nm-roster-role--leader' : '')}>{m.role}</span>
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
              {team.categoryId === 'basketball' ? (
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
            <div style={{ font: 'var(--text-title-2)', color: 'var(--label-normal)', marginBottom: 20 }}>{team.roster.length}명</div>
            {role === 'guest' && (
              <Button label="참가 신청" variant="solid" color="primary" size="lg" fullWidth onClick={() => setApplyOpen(true)} />
            )}
            {role === 'user' && team.status === 'recruiting' && (
              <Button label="참가 신청" variant="solid" color="primary" size="lg" fullWidth onClick={() => setApplyOpen(true)} />
            )}
            {role === 'user' && team.status === 'closed' && (
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
              style={{ minHeight: 100, marginBottom: 8 }}
            />
            {role === 'guest' && <div className="nm-field__hint nm-field__hint--error" style={{ marginBottom: 8 }}>신청하려면 로그인이 필요해요.</div>}
            <div className="nm-modal-card__actions" style={{ marginTop: 12 }}>
              <Button label="취소" variant="outlined" color="assistive" size="md" onClick={() => setApplyOpen(false)} />
              <Button
                label={role === 'guest' ? '로그인하러 가기' : '신청하기'}
                variant="solid"
                color="primary"
                size="md"
                onClick={() => (role === 'guest' ? navigate('/login') : setApplyOpen(false))}
              />
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

export default TeamDetailPage;
