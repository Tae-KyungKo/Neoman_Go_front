import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import Chip from '../components/Chip';
import Button from '../components/Button';
import Icon from '../components/icons/Icon';
import { useAuth } from '../context/AuthContext';
import { BOARD_TABS, type BoardTab } from '../constants/board';
import './BoardListPage.css';

export function BoardListPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<BoardTab | '전체'>('전체');
  const [keyword, setKeyword] = useState('');

  return (
    <MainLayout active="게시판">
      <div className="nm-board">
        <div className="nm-board__header">
          <h1 className="nm-board__title">자유게시판</h1>
          {user && (
            <Button label="글쓰기" variant="solid" color="primary" size="sm" onClick={() => navigate('/board/new')} />
          )}
        </div>
        <p className="nm-board__subtitle">팀원, 잡담, 궁금한 것까지 자유롭게 나눠보세요.</p>
        <div className="nm-board__toolbar">
          <div className="nm-board__tabs">
            <Chip active={tab === '전체'} onClick={() => setTab('전체')}>전체</Chip>
            {BOARD_TABS.map((item) => (
              <Chip key={item} active={tab === item} onClick={() => setTab(item)}>{item}</Chip>
            ))}
          </div>
          <div className="nm-board__search">
            <Icon name="Search" size={16} />
            <input placeholder="검색어를 입력하세요" value={keyword} onChange={(event) => setKeyword(event.target.value)} />
          </div>
        </div>
        <div className="nm-empty-state">통합 게시판 API 연결 작업 전까지 게시글을 표시하지 않습니다.</div>
      </div>
    </MainLayout>
  );
}

export default BoardListPage;
