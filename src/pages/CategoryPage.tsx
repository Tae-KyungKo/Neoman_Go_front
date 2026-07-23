import { useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import Button from '../components/Button';
import TeamCard from '../components/TeamCard';
import Icon from '../components/icons/Icon';
import { getCategoryById } from '../data/categories';
import { getTeamsByCategory } from '../data/teams';
import { withMock } from '../lib/mockData';
import './CategoryPage.css';

const GRADIENTS: Record<string, string> = {
  lol: 'linear-gradient(135deg, #1f2a44, #3a5fcd)',
  valorant: 'linear-gradient(135deg, #a3122b, #ff4655)',
  pubg: 'linear-gradient(135deg, #4a3f2b, #b08d57)',
  fifa: 'linear-gradient(135deg, #0f5132, #22b06f)',
  soccer: 'linear-gradient(135deg, #0b6e4f, #38b06a)',
  basketball: 'linear-gradient(135deg, #b85c1f, #e08a3c)',
};

const PAGE_SIZE = 6;

export function CategoryPage() {
  const { categoryId = '' } = useParams();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'latest' | 'casual' | 'competitive'>('latest');
  const [page, setPage] = useState(1);

  const category = getCategoryById(categoryId);
  const teams = withMock(getTeamsByCategory(categoryId), []);

  const filteredTeams = useMemo(() => {
    const latestTeams = [...teams].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    if (filter === 'casual') {
      return latestTeams.filter((team) => team.level === '즐겜');
    }
    if (filter === 'competitive') {
      return latestTeams.filter((team) => team.level === '빡겜');
    }
    return latestTeams;
  }, [teams, filter]);

  if (!category) {
    return <Navigate to="/" replace />;
  }

  const totalPages = Math.max(1, Math.ceil(filteredTeams.length / PAGE_SIZE));
  const pageItems = filteredTeams.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <MainLayout active="카테고리">
      <div className="nm-cat-hero" style={{ background: GRADIENTS[category.id] }}>
        <div className="nm-cat-hero-overlay">
          <span className="nm-cat-hero__eyebrow">CATEGORY</span>
          <h1 className="nm-cat-hero__title">{category.en}</h1>
        </div>
      </div>

      <div className="nm-cat-stat-row">
        <div className="nm-cat-stat">
          <b>{teams.length}</b>
          <span>등록된 팀</span>
        </div>
      </div>

      <div className="nm-cat-sort-row">
        <h2 style={{ font: 'var(--text-heading-1)', color: 'var(--label-normal)', margin: 0 }}>모집 중인 팀</h2>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <select
            className="nm-cat-sort-select"
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value as typeof filter);
              setPage(1);
            }}
          >
            <option value="latest">최신순</option>
            <option value="casual">즐겜</option>
            <option value="competitive">빡겜</option>
          </select>
          <Button label="팀 만들기" variant="solid" color="primary" size="sm" onClick={() => navigate(`/teams/new?category=${category.id}`)} />
        </div>
      </div>

      {pageItems.length === 0 ? (
        <div style={{ padding: '80px 48px', textAlign: 'center', font: 'var(--text-body-1-regular)', color: 'var(--label-alternative-3)' }}>
          아직 등록된 팀이 없어요.
        </div>
      ) : (
        <div className="nm-cat-team-grid">
          {pageItems.map((t) => (
            <TeamCard key={t.id} team={t} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="nm-pagination" style={{ paddingBottom: 40 }}>
          <button className="nm-page-btn" onClick={() => setPage((p) => Math.max(1, p - 1))} aria-label="이전 페이지">
            <Icon name="ChevronLeft" size={14} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} className={'nm-page-btn' + (p === page ? ' nm-page-btn--active' : '')} onClick={() => setPage(p)}>
              {p}
            </button>
          ))}
          <button className="nm-page-btn" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} aria-label="다음 페이지">
            <Icon name="ChevronRight" size={14} />
          </button>
        </div>
      )}
    </MainLayout>
  );
}

export default CategoryPage;
