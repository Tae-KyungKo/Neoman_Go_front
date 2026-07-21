import { useRef, useState, type ReactElement } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import Button from '../components/Button';
import Icon from '../components/icons/Icon';
import { getTeamById } from '../data/teams';
import { useTeamRole } from '../lib/teamRole';
import { withMock } from '../lib/mockData';
import '../styles/teamShared.css';
import './FormationPage.css';

interface PlayerPosition {
  id: number;
  role: string;
  name: string;
  x: number;
  y: number;
}

const SPORT_LABEL: Record<string, string> = { soccer: '축구', futsal: '풋살', basketball: '농구' };

const INITIAL_POSITIONS: Record<string, PlayerPosition[]> = {
  soccer: [
    { id: 1, role: 'GK', name: '김주장', x: 50, y: 92 },
    { id: 2, role: 'DF', name: '박에이스', x: 28, y: 76 },
    { id: 3, role: 'DF', name: '이서포터', x: 50, y: 78 },
    { id: 4, role: 'DF', name: '최윙백', x: 72, y: 76 },
    { id: 5, role: 'MF', name: '정미드필더', x: 20, y: 56 },
    { id: 6, role: 'MF', name: '한볼란치', x: 42, y: 60 },
    { id: 7, role: 'MF', name: '오볼란치', x: 58, y: 60 },
    { id: 8, role: 'MF', name: '장윙어', x: 80, y: 56 },
    { id: 9, role: 'FW', name: '윤스트라이커', x: 34, y: 30 },
    { id: 10, role: 'FW', name: '조공격수', x: 50, y: 22 },
    { id: 11, role: 'FW', name: '류스트라이커', x: 66, y: 30 },
  ],
  futsal: [
    { id: 1, role: 'GK', name: '김주장', x: 50, y: 90 },
    { id: 2, role: 'DF', name: '박에이스', x: 30, y: 68 },
    { id: 3, role: 'DF', name: '이서포터', x: 70, y: 68 },
    { id: 4, role: 'PV', name: '정피봇', x: 50, y: 42 },
    { id: 5, role: 'WG', name: '한윙어', x: 50, y: 16 },
  ],
  basketball: [
    { id: 1, role: 'G', name: '김주장', x: 16, y: 50 },
    { id: 2, role: 'G', name: '박에이스', x: 32, y: 26 },
    { id: 3, role: 'F', name: '이서포터', x: 32, y: 74 },
    { id: 4, role: 'F', name: '정포워드', x: 56, y: 36 },
    { id: 5, role: 'C', name: '최센터', x: 66, y: 50 },
  ],
};

function SoccerLines() {
  return (
    <svg className="nm-court-lines" viewBox="0 0 68 105" preserveAspectRatio="none">
      <g fill="none" stroke="rgba(255,255,255,.55)" strokeWidth="0.4">
        <rect x="1" y="1" width="66" height="103" />
        <line x1="1" y1="52.5" x2="67" y2="52.5" />
        <circle cx="34" cy="52.5" r="9.15" />
        <rect x="13.84" y="1" width="40.32" height="16.5" />
        <rect x="13.84" y="87.5" width="40.32" height="16.5" />
      </g>
    </svg>
  );
}
function FutsalLines() {
  return (
    <svg className="nm-court-lines" viewBox="0 0 40 20" preserveAspectRatio="none">
      <g fill="none" stroke="rgba(255,255,255,.55)" strokeWidth="0.25">
        <rect x="0.5" y="0.5" width="39" height="19" />
        <line x1="20" y1="0.5" x2="20" y2="19.5" />
        <circle cx="20" cy="10" r="3" />
      </g>
    </svg>
  );
}
function BasketballLines() {
  return (
    <svg className="nm-court-lines" viewBox="0 0 28 15" preserveAspectRatio="none">
      <g fill="none" stroke="rgba(255,255,255,.6)" strokeWidth="0.15">
        <rect x="0.3" y="0.3" width="27.4" height="14.4" />
        <line x1="14" y1="0.3" x2="14" y2="14.7" />
        <circle cx="14" cy="7.5" r="2.2" />
      </g>
    </svg>
  );
}

const COURT_LINES: Record<string, () => ReactElement> = {
  soccer: SoccerLines,
  futsal: FutsalLines,
  basketball: BasketballLines,
};

export function FormationPage() {
  const { teamId = '', sport = '' } = useParams();
  const navigate = useNavigate();
  const role = useTeamRole(Number(teamId));
  const [positions, setPositions] = useState<PlayerPosition[]>(INITIAL_POSITIONS[sport] ?? []);
  const courtRef = useRef<HTMLDivElement>(null);
  const dragId = useRef<number | null>(null);

  const team = withMock(getTeamById(Number(teamId)), undefined);

  if (!team || !INITIAL_POSITIONS[sport]) {
    return <Navigate to="/teams" replace />;
  }

  if (role !== 'member' && role !== 'owner') {
    return (
      <MainLayout active="팀 찾기">
        <div className="nm-access-guard">
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 100,
              background: 'rgba(255,66,79,.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--status-negative)',
              marginBottom: 20,
            }}
          >
            <Icon name="TriangleExclamation" size={28} />
          </div>
          <h1 style={{ font: 'var(--text-title-2)', color: 'var(--label-normal)', margin: 0 }}>이 팀의 소속 팀원만 볼 수 있어요</h1>
          <p style={{ font: 'var(--text-body-1-regular)', color: 'var(--label-alternative-2)', marginTop: 10, maxWidth: 340 }}>
            포메이션 회의는 팀 내부 전략 공간이라 가입한 팀원에게만 열려 있어요.
          </p>
          <Button label="팀 상세로 돌아가기" variant="outlined" color="assistive" size="md" style={{ marginTop: 28 }} onClick={() => navigate(`/teams/${team.id}`)} />
        </div>
      </MainLayout>
    );
  }

  const onPointerDown = (id: number) => (e: React.PointerEvent) => {
    dragId.current = id;
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (dragId.current == null || !courtRef.current) return;
    const rect = courtRef.current.getBoundingClientRect();
    const x = Math.min(96, Math.max(4, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.min(96, Math.max(4, ((e.clientY - rect.top) / rect.height) * 100));
    setPositions((list) => list.map((p) => (p.id === dragId.current ? { ...p, x, y } : p)));
  };
  const onPointerUp = () => {
    dragId.current = null;
  };
  const updateField = (id: number, field: 'role' | 'name', value: string) => {
    setPositions((list) => list.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const Lines = COURT_LINES[sport];

  return (
    <MainLayout active="팀 찾기">
      <div className="nm-fm-shell">
        <div className="nm-fm-header-row">
          <div>
            <span className="nm-team-tag">{SPORT_LABEL[sport]}</span>
            <h1 className="nm-fm-title">{team.name} — 포메이션 회의</h1>
            <p className="nm-fm-desc">선수 칩을 드래그해서 팀의 {SPORT_LABEL[sport]} 포메이션을 함께 구상해보세요.</p>
          </div>
          <Button label="저장하기" variant="solid" color="primary" size="sm" />
        </div>

        <div
          ref={courtRef}
          className={'nm-court-wrap nm-court-' + sport}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        >
          <Lines />
          {positions.map((p) => (
            <div key={p.id} className="nm-player-chip" style={{ left: p.x + '%', top: p.y + '%' }} onPointerDown={onPointerDown(p.id)}>
              <input
                className="nm-role-input"
                value={p.role}
                placeholder="포지션"
                onChange={(e) => updateField(p.id, 'role', e.target.value)}
                onPointerDown={(e) => e.stopPropagation()}
              />
              <input
                className="nm-name-input"
                value={p.name}
                placeholder="이름"
                onChange={(e) => updateField(p.id, 'name', e.target.value)}
                onPointerDown={(e) => e.stopPropagation()}
              />
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}

export default FormationPage;
