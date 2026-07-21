import { useState } from 'react';
import MainLayout from '../components/MainLayout';
import Chip from '../components/Chip';
import TeamCard from '../components/TeamCard';
import { CATEGORIES } from '../data/categories';
import { TEAMS } from '../data/teams';
import { withMock } from '../lib/mockData';
import './TeamFindPage.css';

export function TeamFindPage() {
  const [categoryId, setCategoryId] = useState<string>('all');
  const teams = withMock(TEAMS, []);
  const filtered = categoryId === 'all' ? teams : teams.filter((t) => t.categoryId === categoryId);

  return (
    <MainLayout active="팀 찾기">
      <div className="nm-teamfind">
        <div className="nm-teamfind__header">
          <h1 className="nm-teamfind__title">팀 찾기</h1>
        </div>
        <p className="nm-teamfind__subtitle">종목과 실력에 맞는 팀을 찾아 바로 신청해보세요.</p>

        <div className="nm-teamfind__filters">
          <Chip active={categoryId === 'all'} onClick={() => setCategoryId('all')}>
            전체
          </Chip>
          {CATEGORIES.map((c) => (
            <Chip key={c.id} active={categoryId === c.id} onClick={() => setCategoryId(c.id)}>
              {c.ko}
            </Chip>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="nm-empty-state">조건에 맞는 팀이 없어요.</div>
        ) : (
          <div className="nm-teamfind__grid">
            {filtered.map((t) => (
              <TeamCard key={t.id} team={t} />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default TeamFindPage;
