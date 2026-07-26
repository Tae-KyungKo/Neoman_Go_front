import { useEffect, useRef, useState, type ReactElement } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import Button from '../components/Button';
import Icon from '../components/icons/Icon';
import {
  getFormation,
  saveFormation,
  type FormationPlayerPayload,
  type FormationPlayerResponse,
  type FormationSport,
} from '../api/formationApi';
import { getTeam, type TeamDetailResponse } from '../api/teamApi';
import { ApiError, getApiErrorMessage } from '../api/httpClient';
import { getAccessToken } from '../auth/tokenStorage';
import { useAuth } from '../context/AuthContext';
import '../styles/teamShared.css';
import './FormationPage.css';

interface PlayerPosition extends FormationPlayerPayload {
  key: string;
}

interface SportConfig {
  apiSport: FormationSport;
  label: string;
  category: string;
  positions: Array<Omit<PlayerPosition, 'key' | 'playerName' | 'displayOrder'>>;
}

const SPORT_CONFIG: Record<string, SportConfig> = {
  soccer: {
    apiSport: 'SOCCER',
    label: '축구',
    category: 'SOCCER_FUTSAL',
    positions: [
      { positionName: 'GK', x: 50, y: 92 },
      { positionName: 'DF', x: 28, y: 76 },
      { positionName: 'DF', x: 50, y: 78 },
      { positionName: 'DF', x: 72, y: 76 },
      { positionName: 'MF', x: 20, y: 56 },
      { positionName: 'MF', x: 42, y: 60 },
      { positionName: 'MF', x: 58, y: 60 },
      { positionName: 'MF', x: 80, y: 56 },
      { positionName: 'FW', x: 34, y: 30 },
      { positionName: 'FW', x: 50, y: 22 },
      { positionName: 'FW', x: 66, y: 30 },
    ],
  },
  futsal: {
    apiSport: 'FUTSAL',
    label: '풋살',
    category: 'SOCCER_FUTSAL',
    positions: [
      { positionName: 'GK', x: 12, y: 50 },
      { positionName: 'DF', x: 32, y: 30 },
      { positionName: 'DF', x: 32, y: 70 },
      { positionName: 'ALA', x: 60, y: 30 },
      { positionName: 'ALA', x: 60, y: 70 },
      { positionName: 'PIVO', x: 82, y: 50 },
    ],
  },
  basketball: {
    apiSport: 'BASKETBALL',
    label: '농구',
    category: 'BASKETBALL',
    positions: [
      { positionName: 'G', x: 16, y: 50 },
      { positionName: 'G', x: 32, y: 26 },
      { positionName: 'F', x: 32, y: 74 },
      { positionName: 'F', x: 56, y: 36 },
      { positionName: 'C', x: 66, y: 50 },
    ],
  },
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

function toPlayerPositions(players: FormationPlayerResponse[]): PlayerPosition[] {
  return players
    .slice()
    .sort((left, right) => left.displayOrder - right.displayOrder)
    .map((player, index) => ({
      ...player,
      key: String(player.id ?? `${player.displayOrder}-${index}`),
    }));
}

function createDefaultPositions(
  team: TeamDetailResponse,
  config: SportConfig,
): PlayerPosition[] {
  return team.members
    .filter((member) => member.status === 'ACTIVE')
    .slice(0, config.positions.length)
    .map((member, index) => ({
      key: `${member.userId}-${index}`,
      playerName: member.nickname,
      displayOrder: index,
      ...config.positions[index],
    }));
}

export function FormationPage() {
  const { teamId = '', sport = '' } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const numericTeamId = Number(teamId);
  const config = SPORT_CONFIG[sport];
  const [team, setTeam] = useState<TeamDetailResponse | null>(null);
  const [positions, setPositions] = useState<PlayerPosition[]>([]);
  const [version, setVersion] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isReloading, setIsReloading] = useState(false);
  const [hasConflict, setHasConflict] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const courtRef = useRef<HTMLDivElement>(null);
  const dragKey = useRef<string | null>(null);

  useEffect(() => {
    if (!config || !Number.isInteger(numericTeamId) || numericTeamId <= 0) {
      setIsLoading(false);
      return;
    }

    let active = true;
    const accessToken = getAccessToken();
    setIsLoading(true);
    setError(null);

    if (!accessToken) {
      setError('로그인이 필요합니다.');
      setIsLoading(false);
      return;
    }

    Promise.all([
      getTeam(numericTeamId),
      getFormation(numericTeamId, config.apiSport, accessToken),
    ])
      .then(([teamResponse, formationResponse]) => {
        if (!active) return;
        setTeam(teamResponse);
        setVersion(formationResponse.version);
        setPositions(
          formationResponse.version === 0 && formationResponse.players.length === 0
            ? createDefaultPositions(teamResponse, config)
            : toPlayerPositions(formationResponse.players),
        );
      })
      .catch((loadError) => {
        if (active) {
          setError(getApiErrorMessage(loadError, '팀 정보를 불러오지 못했습니다.'));
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [config, numericTeamId]);

  if (!config || !Number.isInteger(numericTeamId) || numericTeamId <= 0) {
    return <Navigate to="/teams" replace />;
  }

  const currentMember = team?.members.find(
    (member) => member.status === 'ACTIVE' && member.userId === user?.id,
  );
  const hasAccess = Boolean(currentMember);
  const categoryMatches = team?.category === config.category;

  const onPointerDown = (key: string) => (event: React.PointerEvent) => {
    dragKey.current = key;
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent) => {
    if (!dragKey.current || !courtRef.current) return;
    const rect = courtRef.current.getBoundingClientRect();
    const x = Math.min(96, Math.max(4, ((event.clientX - rect.left) / rect.width) * 100));
    const y = Math.min(96, Math.max(4, ((event.clientY - rect.top) / rect.height) * 100));
    setPositions((players) =>
      players.map((player) => (player.key === dragKey.current ? { ...player, x, y } : player)),
    );
    setSavedMessage(null);
  };

  const stopDragging = () => {
    dragKey.current = null;
  };

  const updateField = (
    key: string,
    field: 'positionName' | 'playerName',
    value: string,
  ) => {
    setPositions((players) =>
      players.map((player) => (player.key === key ? { ...player, [field]: value } : player)),
    );
    setSavedMessage(null);
  };

  const handleRestoreDefault = () => {
    if (!team) return;
    setPositions(createDefaultPositions(team, config));
    if (!hasConflict) {
      setError(null);
    }
    setSavedMessage(null);
  };

  const handleReloadLatest = async () => {
    const accessToken = getAccessToken();
    if (!accessToken || isReloading) return;

    setIsReloading(true);
    setError(null);
    setSavedMessage(null);
    try {
      const response = await getFormation(
        numericTeamId,
        config.apiSport,
        accessToken,
      );
      setVersion(response.version);
      setPositions(toPlayerPositions(response.players));
      setHasConflict(false);
      setSavedMessage('최신 포메이션을 불러왔습니다.');
    } catch (reloadError) {
      setError(getApiErrorMessage(reloadError, '최신 포메이션을 불러오지 못했습니다.'));
    } finally {
      setIsReloading(false);
    }
  };

  const handleSave = async () => {
    const accessToken = getAccessToken();
    if (!accessToken || isSaving) return;

    if (
      positions.some(
        (player) => !player.positionName.trim() || !player.playerName.trim(),
      )
    ) {
      setError('모든 선수의 포지션과 이름을 입력해 주세요.');
      return;
    }

    setIsSaving(true);
    setError(null);
    setSavedMessage(null);
    try {
      const response = await saveFormation(
        numericTeamId,
        config.apiSport,
        {
          version,
          players: positions.map(({ key: _key, ...player }) => ({
            ...player,
            positionName: player.positionName.trim(),
            playerName: player.playerName.trim(),
          })),
        },
        accessToken,
      );
      setVersion(response.version);
      setPositions(
        toPlayerPositions(response.players),
      );
      setHasConflict(false);
      setSavedMessage(
        response.updatedBy
          ? `${response.updatedBy.nickname}님이 포메이션을 저장했습니다.`
          : '포메이션을 저장했습니다.',
      );
    } catch (saveError) {
      if (saveError instanceof ApiError && saveError.code === 'F005') {
        setHasConflict(true);
        setError('다른 팀원이 포메이션을 먼저 수정했습니다. 최신 내용을 불러온 뒤 다시 편집해 주세요.');
      } else {
        setError(getApiErrorMessage(saveError, '포메이션 저장에 실패했습니다.'));
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout active="팀 찾기">
        <div className="nm-access-guard">포메이션을 불러오는 중이에요.</div>
      </MainLayout>
    );
  }

  if (!team) {
    return (
      <MainLayout active="팀 찾기">
        <div className="nm-access-guard">
          <p>{error ?? '존재하지 않는 팀입니다.'}</p>
          <Button label="팀 목록으로 돌아가기" variant="outlined" color="assistive" onClick={() => navigate('/teams')} />
        </div>
      </MainLayout>
    );
  }

  if (!hasAccess || !categoryMatches) {
    return (
      <MainLayout active="팀 찾기">
        <div className="nm-access-guard">
          <Icon name="TriangleExclamation" size={28} />
          <h1>이 포메이션에 접근할 수 없어요</h1>
          <p>{!hasAccess ? '이 팀의 소속 팀원만 이용할 수 있습니다.' : '팀 카테고리와 종목이 일치하지 않습니다.'}</p>
          <Button label="팀 상세로 돌아가기" variant="outlined" color="assistive" onClick={() => navigate(`/teams/${team.id}`)} />
        </div>
      </MainLayout>
    );
  }

  const Lines = COURT_LINES[sport];

  return (
    <MainLayout active="팀 찾기">
      <div className="nm-fm-shell">
        <div className="nm-fm-header-row">
          <div>
            <span className="nm-team-tag">{config.label}</span>
            <h1 className="nm-fm-title">{team.name} — 포메이션 회의</h1>
            <p className="nm-fm-desc">선수 칩을 드래그하고 이름과 포지션을 편집해 보세요.</p>
          </div>
          <Button
            label={isSaving ? '저장 중...' : '저장하기'}
            variant="solid"
            color="primary"
            size="sm"
            disabled={isSaving || positions.length === 0}
            onClick={handleSave}
          />
        </div>

        {(error || savedMessage) && (
          <div className={`nm-fm-feedback ${error ? 'nm-fm-feedback--error' : ''}`} role="status">
            <span>{error ?? savedMessage}</span>
            {hasConflict && (
              <Button
                label={isReloading ? '불러오는 중...' : '최신 포메이션 불러오기'}
                variant="outlined"
                color="assistive"
                size="sm"
                disabled={isReloading}
                onClick={handleReloadLatest}
              />
            )}
          </div>
        )}

        {positions.length === 0 && (
          <div className="nm-fm-empty">
            <p>저장된 포메이션에 선수가 없습니다.</p>
            <Button
              label="기본 배치로 복원"
              variant="outlined"
              color="assistive"
              size="sm"
              onClick={handleRestoreDefault}
            />
          </div>
        )}

        <div
          ref={courtRef}
          className={`nm-court-wrap nm-court-${sport}`}
          onPointerMove={onPointerMove}
          onPointerUp={stopDragging}
          onPointerCancel={stopDragging}
          onPointerLeave={stopDragging}
        >
          <Lines />
          {positions.map((player) => (
            <div
              key={player.key}
              className="nm-player-chip"
              style={{ left: `${player.x}%`, top: `${player.y}%` }}
              onPointerDown={onPointerDown(player.key)}
            >
              <input
                className="nm-role-input"
                value={player.positionName}
                maxLength={20}
                aria-label={`${player.playerName} 포지션`}
                onChange={(event) => updateField(player.key, 'positionName', event.target.value)}
                onPointerDown={(event) => event.stopPropagation()}
              />
              <input
                className="nm-name-input"
                value={player.playerName}
                maxLength={30}
                aria-label="선수 이름"
                onChange={(event) => updateField(player.key, 'playerName', event.target.value)}
                onPointerDown={(event) => event.stopPropagation()}
              />
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}

export default FormationPage;
