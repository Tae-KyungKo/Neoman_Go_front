import { useNavigate } from 'react-router-dom';
import Icon from './icons/Icon';
import type { Team } from '../data/teams';
import { getCategoryById } from '../data/categories';
import './TeamCard.css';

export function TeamCard({ team }: { team: Team }) {
  const navigate = useNavigate();
  const category = getCategoryById(team.categoryId);

  return (
    <div className="nm-team-card" onClick={() => navigate(`/teams/${team.id}`)}>
      <div className="nm-team-card__body">
        <div className="nm-team-card__top">
          <span className="nm-team-card__tag">{category?.ko}</span>
          <span className="nm-team-card__level">{team.level}</span>
        </div>
        <div className="nm-team-card__name">{team.name}</div>
        <div className="nm-team-card__meta">
          <span>
            <Icon name="Pin" size={13} />
            {team.location}
          </span>
          <span>
            <Icon name="Clock" size={13} />
            {team.time}
          </span>
        </div>
        <div className="nm-team-card__members-row">
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, font: 'var(--text-caption-1-medium)', color: 'var(--label-alternative-2)' }}>
            <Icon name="Persons" size={14} />
            팀원
          </span>
          <span className="nm-team-card__member-count">{team.roster.length}명</span>
        </div>
      </div>
    </div>
  );
}

export default TeamCard;
