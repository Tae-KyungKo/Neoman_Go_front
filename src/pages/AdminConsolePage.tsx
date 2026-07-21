import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import Chip from '../components/Chip';
import Button from '../components/Button';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { ADMIN_USERS, REPORTED_POSTS } from '../data/admin';
import { withMock } from '../lib/mockData';
import '../styles/teamShared.css';
import './AdminConsolePage.css';

type Tab = 'users' | 'posts';

export function AdminConsolePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('users');

  if (user?.role !== 'admin') {
    return <Navigate to="/forbidden" replace />;
  }

  const users = withMock(ADMIN_USERS, []);
  const reportedPosts = withMock(REPORTED_POSTS, []);

  return (
    <MainLayout>
      <div className="nm-admin-shell">
        <h1 style={{ font: 'var(--text-title-1)', color: 'var(--label-normal)', margin: '0 0 8px' }}>관리자 콘솔</h1>
        <p style={{ font: 'var(--text-body-2-regular)', color: 'var(--label-alternative-2)', margin: '0 0 24px' }}>회원과 신고된 게시글을 관리하세요.</p>
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          <Chip active={tab === 'users'} onClick={() => setTab('users')}>
            회원 관리
          </Chip>
          <Chip active={tab === 'posts'} onClick={() => setTab('posts')}>
            신고된 게시글
          </Chip>
        </div>

        {tab === 'users' ? (
          <div className="nm-admin-table">
            <div className="nm-admin-thead nm-users-grid">
              <span>닉네임 / 아이디</span>
              <span>가입일</span>
              <span>상태</span>
              <span />
            </div>
            {users.map((u) => (
              <div key={u.id} className="nm-admin-row nm-users-grid">
                <span>
                  <div style={{ font: 'var(--text-body-1-medium)', color: 'var(--label-normal)' }}>{u.nickname}</div>
                  <div style={{ font: 'var(--text-caption-1-medium)', color: 'var(--label-alternative-3)' }}>{u.loginId}</div>
                </span>
                <span style={{ font: 'var(--text-body-2-regular)', color: 'var(--label-alternative-2)' }}>{u.joinedAt}</span>
                <span>
                  <StatusBadge label={u.status === 'active' ? '활동 중' : '정지됨'} tone={u.status === 'active' ? 'positive' : 'negative'} />
                </span>
                <span style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button label={u.status === 'active' ? '정지' : '정지 해제'} variant="outlined" color="assistive" size="sm" />
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="nm-admin-table">
            <div className="nm-admin-thead nm-posts-grid">
              <span>분류</span>
              <span>제목</span>
              <span>작성자</span>
              <span>신고 수</span>
              <span />
            </div>
            {reportedPosts.map((p) => (
              <div key={p.id} className="nm-admin-row nm-posts-grid">
                <span className="nm-team-tag">{p.category}</span>
                <span style={{ font: 'var(--text-body-1-medium)', color: 'var(--label-normal)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {p.title}
                </span>
                <span style={{ font: 'var(--text-body-2-regular)', color: 'var(--label-alternative-2)' }}>{p.author}</span>
                <span style={{ font: 'var(--text-caption-1-semibold)', color: 'var(--status-negative)' }}>신고 {p.reportCount}건</span>
                <span style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                  <Button label="게시글 보기" variant="outlined" color="assistive" size="sm" onClick={() => navigate(`/board/${p.postId}`)} />
                  <Button label="삭제" variant="outlined" color="assistive" size="sm" />
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default AdminConsolePage;
