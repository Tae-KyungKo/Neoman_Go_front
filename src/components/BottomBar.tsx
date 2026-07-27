import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from './icons/Icon';
import { CATEGORIES } from '../data/categories';
import { useNotifications } from '../context/NotificationContext';
import './BottomBar.css';

export function BottomBar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();

  return (
    <div className="nm-bottombar">
      {open && (
        <div className="nm-bottombar__popup-wrap">
          <div className="nm-bottombar__popup">
            {CATEGORIES.map((c) => (
              <div
                key={c.id}
                className="nm-bottombar__popup-item"
                onClick={() => {
                  setOpen(false);
                  navigate(`/categories/${c.id}`);
                }}
              >
                {c.ko}
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="nm-bottombar__row">
        <button type="button" className="nm-bottombar__item" onClick={() => navigate('/board')}>
          자유 게시판
        </button>
        <button type="button" className="nm-bottombar__item" onClick={() => navigate('/mypage/teams')}>
          My TEAM
        </button>
        <button type="button" className="nm-bottombar__center" onClick={() => setOpen((o) => !o)}>
          <span>카테고리</span>
          <Icon name="ChevronUp" size={14} />
        </button>
        <button type="button" className="nm-bottombar__item" onClick={() => navigate('/mypage/info')}>
          마이 페이지
        </button>
        <button type="button" className="nm-bottombar__item" onClick={() => navigate('/mypage/notifications')}>
          알림함
          {unreadCount > 0 && <span className="nm-bottombar__item-dot" />}
        </button>
      </div>
    </div>
  );
}

export default BottomBar;
