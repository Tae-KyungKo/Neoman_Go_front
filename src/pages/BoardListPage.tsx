import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import Chip from '../components/Chip';
import Button from '../components/Button';
import Pagination from '../components/Pagination';
import Icon from '../components/icons/Icon';
import { getPosts, type PostSummaryResponse } from '../api/postApi';
import { getApiErrorMessage } from '../api/httpClient';
import { useAuth } from '../context/AuthContext';
import {
  BOARD_TABS,
  BOARD_TAB_BY_TYPE,
  BOARD_TYPE_BY_TAB,
  type BoardTab,
} from '../constants/board';
import '../styles/postShared.css';
import './BoardListPage.css';

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ko-KR', { month: '2-digit', day: '2-digit' }).format(new Date(value));
}

export function BoardListPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<BoardTab | '전체'>('전체');
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [posts, setPosts] = useState<PostSummaryResponse[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const timeoutId = window.setTimeout(() => {
      setIsLoading(true);
      setLoadError(null);
      getPosts(tab === '전체' ? null : BOARD_TYPE_BY_TAB[tab], keyword, page - 1)
        .then((response) => {
          if (!active) return;
          setPosts(response.content);
          setTotalPages(Math.max(1, response.totalPages));
        })
        .catch((error) => {
          if (!active) return;
          setPosts([]);
          setLoadError(getApiErrorMessage(error, '게시글을 불러오지 못했습니다.'));
        })
        .finally(() => {
          if (active) setIsLoading(false);
        });
    }, 300);

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [keyword, page, tab]);

  return (
    <MainLayout active="게시판">
      <div className="nm-board">
        <div className="nm-board__header">
          <h1 className="nm-board__title">자유게시판</h1>
          {user && <Button label="글쓰기" variant="solid" color="primary" size="sm" onClick={() => navigate('/board/new')} />}
        </div>
        <p className="nm-board__subtitle">팀원, 잡담, 궁금한 것까지 자유롭게 나눠보세요.</p>
        <div className="nm-board__toolbar">
          <div className="nm-board__tabs">
            <Chip active={tab === '전체'} onClick={() => { setTab('전체'); setPage(1); }}>전체</Chip>
            {BOARD_TABS.map((item) => (
              <Chip key={item} active={tab === item} onClick={() => { setTab(item); setPage(1); }}>{item}</Chip>
            ))}
          </div>
          <div className="nm-board__search">
            <Icon name="Search" size={16} />
            <input
              placeholder="제목과 내용 검색"
              value={keyword}
              onChange={(event) => { setKeyword(event.target.value); setPage(1); }}
            />
          </div>
        </div>

        {loadError && <div className="nm-empty-state">{loadError}</div>}
        {isLoading && <div className="nm-empty-state">게시글을 불러오는 중이에요.</div>}
        {!isLoading && !loadError && posts.length === 0 && <div className="nm-empty-state">게시글이 없어요.</div>}
        {!isLoading && !loadError && posts.length > 0 && (
          <div className="nm-list-card">
            {posts.map((post) => (
              <div key={post.id} className="nm-list-row nm-post-row" onClick={() => navigate(`/board/${post.id}`)}>
                <span className={'nm-post-cat' + (post.type === 'RECRUITMENT' ? ' nm-post-cat--recruit' : '')}>
                  {BOARD_TAB_BY_TYPE[post.type]}
                </span>
                <div className="nm-post-main">
                  <div className="nm-post-title-row">
                    <span className="nm-post-title">{post.title}</span>
                    {post.commentCount > 0 && <span className="nm-post-comment-count">[{post.commentCount}]</span>}
                  </div>
                  <div className="nm-post-preview">{post.preview}</div>
                </div>
                <div className="nm-post-meta">
                  <span>{post.authorNickname}</span>
                  <span><Icon name="Eye" size={13} />{post.viewCount}</span>
                  <span style={{ width: 58 }}>{formatDate(post.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        {!loadError && <Pagination page={page} totalPages={totalPages} onChange={setPage} />}
      </div>
    </MainLayout>
  );
}

export default BoardListPage;
