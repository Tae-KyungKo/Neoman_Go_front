import { useEffect, useState } from 'react';
import MainLayout from '../components/MainLayout';
import Chip from '../components/Chip';
import TeamCard, { type TeamCardModel } from '../components/TeamCard';
import Pagination from '../components/Pagination';
import { getTeams, type TeamSummaryResponse } from '../api/teamApi';
import { getApiErrorMessage } from '../api/httpClient';
import { CATEGORIES, getCategoryByApiCode } from '../data/categories';
import './TeamFindPage.css';

const PAGE_SIZE = 12;

export function TeamFindPage() {
  const [categoryId, setCategoryId] = useState<string>('all');
  const [filter, setFilter] = useState<'latest' | 'casual' | 'competitive'>('latest');
  const [teams, setTeams] = useState<TeamSummaryResponse[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const category = CATEGORIES.find((item) => item.id === categoryId);
    let active = true;

    setIsLoading(true);
    setLoadError(null);

    const level =
      filter === 'casual' ? 'CASUAL' : filter === 'competitive' ? 'COMPETITIVE' : null;

    getTeams(category?.apiCode ?? null, level, page - 1, PAGE_SIZE)
      .then((response) => {
        if (!active) return;
        setTeams(response.content);
        setTotalPages(Math.max(1, response.totalPages));
      })
      .catch((error) => {
        if (!active) return;
        setTeams([]);
        setTotalPages(1);
        setLoadError(getApiErrorMessage(error, '팀 목록을 불러오지 못했습니다.'));
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [categoryId, filter, page]);

  const teamCards: TeamCardModel[] = teams.map((team) => ({
    id: team.id,
    categoryId: getCategoryByApiCode(team.category)?.id ?? '',
    name: team.name,
    level: team.level === 'CASUAL' ? '즐겜' : '빡겜',
    location: team.location,
    time: team.activityTime,
    status: team.status,
    memberCount: team.memberCount,
  }));

  const selectCategory = (nextCategoryId: string) => {
    setCategoryId(nextCategoryId);
    setPage(1);
  };

  return (
    <MainLayout active="팀 찾기">
      <div className="nm-teamfind">
        <div className="nm-teamfind__header">
          <h1 className="nm-teamfind__title">팀 찾기</h1>
        </div>
        <p className="nm-teamfind__subtitle">종목과 실력에 맞는 팀을 찾아 바로 신청해보세요.</p>

        <div className="nm-teamfind__filter-row">
          <div className="nm-teamfind__filters">
            <Chip active={categoryId === 'all'} onClick={() => selectCategory('all')}>
              전체
            </Chip>
            {CATEGORIES.map((c) => (
              <Chip key={c.id} active={categoryId === c.id} onClick={() => selectCategory(c.id)}>
                {c.ko}
              </Chip>
            ))}
          </div>
          <select
            className="nm-teamfind__sort"
            value={filter}
            aria-label="팀 성향 필터"
            onChange={(event) => {
              setFilter(event.target.value as typeof filter);
              setPage(1);
            }}
          >
            <option value="latest">최신순</option>
            <option value="casual">즐겜</option>
            <option value="competitive">빡겜</option>
          </select>
        </div>

        {isLoading ? (
          <div className="nm-empty-state">팀 목록을 불러오는 중이에요.</div>
        ) : loadError ? (
          <div className="nm-empty-state">{loadError}</div>
        ) : teamCards.length === 0 ? (
          <div className="nm-empty-state">조건에 맞는 팀이 없어요.</div>
        ) : (
          <div className="nm-teamfind__grid">
            {teamCards.map((t) => (
              <TeamCard key={t.id} team={t} />
            ))}
          </div>
        )}

        {!isLoading && !loadError && (
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        )}
      </div>
    </MainLayout>
  );
}

export default TeamFindPage;
