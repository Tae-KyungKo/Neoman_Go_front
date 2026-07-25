import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import Button from '../components/Button';
import Avatar from '../components/Avatar';
import ConfirmModal from '../components/ConfirmModal';
import Icon from '../components/icons/Icon';
import {
  createComment,
  deleteComment,
  deletePost,
  getComments,
  getPost,
  updateComment,
  type CommentResponse,
  type PostResponse,
} from '../api/postApi';
import { getApiErrorMessage } from '../api/httpClient';
import { getAccessToken } from '../auth/tokenStorage';
import { useAuth } from '../context/AuthContext';
import { BOARD_TAB_BY_TYPE } from '../constants/board';
import '../styles/postShared.css';
import './PostDetailPage.css';

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

export function PostDetailPage() {
  const { postId = '' } = useParams();
  const numericPostId = Number(postId);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState<PostResponse | null>(null);
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [processingCommentId, setProcessingCommentId] = useState<number | null>(null);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!Number.isInteger(numericPostId) || numericPostId <= 0) {
      setLoadError('올바르지 않은 게시글 번호입니다.');
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setLoadError(null);
    try {
      const [postResponse, commentPage] = await Promise.all([
        getPost(numericPostId),
        getComments(numericPostId),
      ]);
      setPost(postResponse);
      setComments(commentPage.content);
    } catch (error) {
      setPost(null);
      setComments([]);
      setLoadError(getApiErrorMessage(error, '게시글을 불러오지 못했습니다.'));
    } finally {
      setIsLoading(false);
    }
  }, [numericPostId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCreateComment = async () => {
    const accessToken = getAccessToken();
    if (!accessToken || !commentInput.trim() || isSubmittingComment) return;
    setIsSubmittingComment(true);
    setActionError(null);
    try {
      const comment = await createComment(numericPostId, commentInput.trim(), accessToken);
      setComments((items) => [...items, comment]);
      setCommentInput('');
    } catch (error) {
      setActionError(getApiErrorMessage(error, '댓글을 등록하지 못했습니다.'));
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleUpdateComment = async (commentId: number) => {
    const accessToken = getAccessToken();
    if (!accessToken || !editingContent.trim() || processingCommentId !== null) return;
    setProcessingCommentId(commentId);
    setActionError(null);
    try {
      const updated = await updateComment(commentId, editingContent.trim(), accessToken);
      setComments((items) => items.map((item) => item.id === commentId ? updated : item));
      setEditingCommentId(null);
      setEditingContent('');
    } catch (error) {
      setActionError(getApiErrorMessage(error, '댓글을 수정하지 못했습니다.'));
    } finally {
      setProcessingCommentId(null);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    const accessToken = getAccessToken();
    if (!accessToken || processingCommentId !== null) return;
    setProcessingCommentId(commentId);
    setActionError(null);
    try {
      await deleteComment(commentId, accessToken);
      setComments((items) => items.filter((item) => item.id !== commentId));
    } catch (error) {
      setActionError(getApiErrorMessage(error, '댓글을 삭제하지 못했습니다.'));
    } finally {
      setProcessingCommentId(null);
    }
  };

  const handleDeletePost = async () => {
    const accessToken = getAccessToken();
    if (!accessToken) return;
    setActionError(null);
    try {
      await deletePost(numericPostId, accessToken);
      navigate('/board', { replace: true });
    } catch (error) {
      setDeleteOpen(false);
      setActionError(getApiErrorMessage(error, '게시글을 삭제하지 못했습니다.'));
    }
  };

  if (isLoading) {
    return <MainLayout active="게시판"><div className="nm-post-detail nm-empty-state">게시글을 불러오는 중이에요.</div></MainLayout>;
  }
  if (loadError || !post) {
    return (
      <MainLayout active="게시판">
        <div className="nm-post-detail nm-empty-state">
          <div>{loadError ?? '존재하지 않는 게시글입니다.'}</div>
          <Button label="목록으로" variant="outlined" color="assistive" size="md" onClick={() => navigate('/board')} />
        </div>
      </MainLayout>
    );
  }

  const isMine = user?.id === post.authorId;
  const category = BOARD_TAB_BY_TYPE[post.type];

  return (
    <MainLayout active="게시판">
      <div className="nm-post-detail">
        <div className="nm-post-detail__breadcrumb">
          <Link to="/board">자유게시판</Link>
          <Icon name="ChevronRight" size={12} />
          <span>{category}</span>
        </div>
        <span className={'nm-post-cat' + (post.type === 'RECRUITMENT' ? ' nm-post-cat--recruit' : '')}>{category}</span>
        <h1 className="nm-post-detail__title">{post.title}</h1>
        <div className="nm-post-detail__author-row">
          <Avatar size={32} />
          <div style={{ flex: 1 }}>
            <div className="nm-post-detail__author-name">{post.authorNickname}</div>
            <div className="nm-post-detail__author-meta">
              <span>{formatDate(post.createdAt)} 작성</span>
              <span><Icon name="Eye" size={12} /> {post.viewCount}</span>
            </div>
          </div>
        </div>
        <div className="nm-post-detail__body">{post.content}</div>
        {actionError && <div className="nm-field__hint nm-field__hint--error" style={{ marginBottom: 16 }}>{actionError}</div>}
        <div className="nm-post-detail__actions">
          <Button label="목록으로" variant="outlined" color="assistive" size="md" onClick={() => navigate('/board')} />
          {isMine && (
            <div style={{ display: 'flex', gap: 8 }}>
              <Button label="수정" variant="outlined" color="assistive" size="md" onClick={() => navigate(`/board/${post.id}/edit`)} />
              <Button label="삭제" variant="outlined" color="assistive" size="md" onClick={() => setDeleteOpen(true)} />
            </div>
          )}
        </div>

        <h3 style={{ font: 'var(--text-heading-1)', color: 'var(--label-normal)', margin: '0 0 8px' }}>댓글 {comments.length}</h3>
        <div>
          {comments.map((comment) => {
            const isCommentMine = user?.id === comment.authorId;
            return (
              <div key={comment.id} className="nm-comment-item">
                <Avatar size={24} />
                <div style={{ flex: 1 }}>
                  <div className="nm-comment-item__head">
                    <span style={{ font: 'var(--text-body-2-semibold)', color: 'var(--label-normal)' }}>{comment.authorNickname}</span>
                    <span style={{ font: 'var(--text-caption-1-medium)', color: 'var(--label-alternative-3)' }}>{formatDate(comment.createdAt)}</span>
                  </div>
                  {editingCommentId === comment.id ? (
                    <div className="nm-comment-input-bar" style={{ marginTop: 8 }}>
                      <input value={editingContent} maxLength={1000} onChange={(event) => setEditingContent(event.target.value)} />
                      <Button label="취소" variant="outlined" color="assistive" size="sm" onClick={() => setEditingCommentId(null)} />
                      <Button label="저장" variant="solid" color="primary" size="sm" disabled={!editingContent.trim() || processingCommentId !== null} onClick={() => void handleUpdateComment(comment.id)} />
                    </div>
                  ) : (
                    <div style={{ font: 'var(--text-body-2-regular)', color: 'var(--label-normal)', marginTop: 4 }}>{comment.content}</div>
                  )}
                </div>
                {isCommentMine && editingCommentId !== comment.id && (
                  <div style={{ display: 'flex', gap: 4 }}>
                    <Button label="수정" variant="outlined" color="assistive" size="sm" onClick={() => { setEditingCommentId(comment.id); setEditingContent(comment.content); }} />
                    <Button label="삭제" variant="outlined" color="assistive" size="sm" disabled={processingCommentId !== null} onClick={() => void handleDeleteComment(comment.id)} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {user && (
          <div className="nm-comment-input-bar">
            <Avatar size={24} />
            <input placeholder="댓글을 입력하세요" maxLength={1000} value={commentInput} onChange={(event) => setCommentInput(event.target.value)} />
            <Button label={isSubmittingComment ? '등록 중...' : '등록'} variant="solid" color="primary" size="md" disabled={!commentInput.trim() || isSubmittingComment} onClick={() => void handleCreateComment()} />
          </div>
        )}
      </div>

      {deleteOpen && (
        <ConfirmModal
          title="게시글을 삭제하시겠습니까?"
          description="삭제한 글은 일반 사용자 화면에서 다시 조회할 수 없습니다."
          confirmLabel="삭제"
          onCancel={() => setDeleteOpen(false)}
          onConfirm={() => void handleDeletePost()}
        />
      )}
    </MainLayout>
  );
}

export default PostDetailPage;
