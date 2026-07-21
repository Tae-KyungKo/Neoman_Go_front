import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import Chip from '../components/Chip';
import Button from '../components/Button';
import Pagination from '../components/Pagination';
import Icon from '../components/icons/Icon';
import { useAuth } from '../context/AuthContext';
import { withMock } from '../lib/mockData';
import { BOARD_TABS, POSTS, type BoardTab } from '../data/posts';
import '../styles/postShared.css';
import './BoardListPage.css';

const PAGE_SIZE = 6;

function catClassName(category: string) {
  return 'nm-post-cat' + (category === '팀모집' ? ' nm-post-cat--recruit' : '');
}

export function BoardListPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<BoardTab | '전체'>('전체');
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);

  const posts = withMock(POSTS, []);

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      if (tab !== '전체' && p.category !== tab && !p.pinned) return false;
      if (keyword && !p.title.includes(keyword)) return false;
      return true;
    });
  }, [posts, tab, keyword]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <MainLayout active="게시판">
      <div className="nm-board">
        <div className="nm-board__header">
          <h1 className="nm-board__title">자유게시판</h1>
          {user && (
            <Button
              label="글쓰기"
              variant="solid"
              color="primary"
              size="sm"
              onClick={() => navigate('/board/new')}
            />
          )}
        </div>
        <p className="nm-board__subtitle">팀원, 잡담, 궁금한 것까지 자유롭게 나눠보세요.</p>

        <div className="nm-board__toolbar">
          <div className="nm-board__tabs">
            <Chip active={tab === '전체'} onClick={() => { setTab('전체'); setPage(1); }}>
              전체
            </Chip>
            {BOARD_TABS.map((t) => (
              <Chip key={t} active={tab === t} onClick={() => { setTab(t); setPage(1); }}>
                {t}
              </Chip>
            ))}
          </div>
          <div className="nm-board__search">
            <Icon name="Search" size={16} />
            <input placeholder="검색어를 입력하세요" value={keyword} onChange={(e) => { setKeyword(e.target.value); setPage(1); }} />
          </div>
        </div>

        {pageItems.length === 0 ? (
          <div className="nm-empty-state">게시글이 없어요.</div>
        ) : (
          <div className="nm-list-card">
            {pageItems.map((p) => (
              <div
                key={p.id}
                className={'nm-list-row nm-post-row' + (p.pinned ? ' nm-post-row--pinned' : '')}
                onClick={() => navigate(`/board/${p.id}`)}
              >
                <span className={catClassName(p.category)}>{p.category}</span>
                <div className="nm-post-main">
                  <div className="nm-post-title-row">
                    <span className="nm-post-title">{p.title}</span>
                    {p.comments.length > 0 && <span className="nm-post-comment-count">[{p.comments.length}]</span>}
                  </div>
                  <div className="nm-post-preview">{p.preview}</div>
                </div>
                <div className="nm-post-meta">
                  <span>{p.author}</span>
                  <span>
                    <Icon name="Eye" size={13} />
                    {p.views}
                  </span>
                  <span style={{ width: 44 }}>{p.date}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>
    </MainLayout>
  );
}

export default BoardListPage;
