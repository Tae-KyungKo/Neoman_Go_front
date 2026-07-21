import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import Button from '../components/Button';
import Avatar from '../components/Avatar';
import ConfirmModal from '../components/ConfirmModal';
import ReportModal from '../components/ReportModal';
import Icon from '../components/icons/Icon';
import { useAuth } from '../context/AuthContext';
import { getPostById } from '../data/posts';
import { withMock } from '../lib/mockData';
import '../styles/postShared.css';
import './PostDetailPage.css';

function catClassName(category: string) {
  return 'nm-post-cat' + (category === '팀모집' ? ' nm-post-cat--recruit' : '');
}

export function PostDetailPage() {
  const { postId = '' } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [commentInput, setCommentInput] = useState('');

  const post = withMock(getPostById(Number(postId)), undefined);

  if (!post) {
    return (
      <MainLayout active="게시판">
        <div className="nm-post-detail nm-empty-state">존재하지 않는 게시글입니다.</div>
      </MainLayout>
    );
  }

  const isMine = Boolean(user) && Boolean(post.isMine);

  return (
    <MainLayout active="게시판">
      <div className="nm-post-detail">
        <div className="nm-post-detail__breadcrumb">
          <Link to="/board">자유게시판</Link>
          <Icon name="ChevronRight" size={12} />
          <span>{post.category}</span>
        </div>
        <span className={catClassName(post.category)}>{post.category}</span>
        <h1 className="nm-post-detail__title">{post.title}</h1>
        <div className="nm-post-detail__author-row">
          <Avatar size={32} />
          <div style={{ flex: 1 }}>
            <div className="nm-post-detail__author-name">{post.author}</div>
            <div className="nm-post-detail__author-meta">
              <span>{post.date} 작성</span>
              <span>
                <Icon name="Eye" size={12} /> {post.views}
              </span>
            </div>
          </div>
          {user && !isMine && <Button label="신고" variant="outlined" color="assistive" size="sm" onClick={() => setReportOpen(true)} />}
        </div>
        <div className="nm-post-detail__body">{post.body}</div>

        <div className="nm-post-detail__like-row">
          <Button
            label={`좋아요 ${likeCount}`}
            variant={liked ? 'solid' : 'outlined'}
            color={liked ? 'primary' : 'assistive'}
            size="md"
            onClick={() => {
              setLiked((l) => !l);
              setLikeCount((c) => (liked ? c - 1 : c + 1));
            }}
          />
        </div>

        <div className="nm-post-detail__actions">
          <Button label="목록으로" variant="outlined" color="assistive" size="md" onClick={() => navigate('/board')} />
          {isMine && (
            <div style={{ display: 'flex', gap: 8 }}>
              <Button label="수정" variant="outlined" color="assistive" size="md" />
              <Button label="삭제" variant="outlined" color="assistive" size="md" onClick={() => setDeleteOpen(true)} />
            </div>
          )}
        </div>

        <h3 style={{ font: 'var(--text-heading-1)', color: 'var(--label-normal)', margin: '0 0 8px' }}>댓글 {post.comments.length}</h3>
        <div>
          {post.comments.map((c) => (
            <div key={c.id} className="nm-comment-item">
              <Avatar size={24} />
              <div style={{ flex: 1 }}>
                <div className="nm-comment-item__head">
                  <span style={{ font: 'var(--text-body-2-semibold)', color: 'var(--label-normal)' }}>{c.author}</span>
                  <span style={{ font: 'var(--text-caption-1-medium)', color: 'var(--label-alternative-3)' }}>{c.date}</span>
                </div>
                <div style={{ font: 'var(--text-body-2-regular)', color: 'var(--label-normal)', marginTop: 4 }}>{c.content}</div>
              </div>
            </div>
          ))}
        </div>
        {user && (
          <div className="nm-comment-input-bar">
            <Avatar size={24} />
            <input placeholder="댓글을 입력하세요" value={commentInput} onChange={(e) => setCommentInput(e.target.value)} />
            <Button label="등록" variant="solid" color="primary" size="md" disabled={!commentInput.trim()} onClick={() => setCommentInput('')} />
          </div>
        )}
      </div>

      {deleteOpen && (
        <ConfirmModal
          title="게시글을 삭제하시겠습니까?"
          description="삭제한 글과 댓글은 복구할 수 없습니다."
          confirmLabel="삭제"
          onCancel={() => setDeleteOpen(false)}
          onConfirm={() => {
            setDeleteOpen(false);
            navigate('/board');
          }}
        />
      )}
      {reportOpen && <ReportModal onCancel={() => setReportOpen(false)} onSubmit={() => setReportOpen(false)} />}
    </MainLayout>
  );
}

export default PostDetailPage;
