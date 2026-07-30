import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import FormField from '../components/FormField';
import TextareaField from '../components/TextareaField';
import Button from '../components/Button';
import { createPost, getPost, updatePost } from '../api/postApi';
import { getApiErrorMessage, getApiFieldErrors } from '../api/httpClient';
import { useAuth } from '../context/AuthContext';
import {
  BOARD_TABS,
  BOARD_TAB_BY_TYPE,
  BOARD_TYPE_BY_TAB,
  type BoardTab,
} from '../constants/board';

export function BoardWritePage() {
  const { postId } = useParams();
  const numericPostId = Number(postId);
  const isEdit = Boolean(postId);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [category, setCategory] = useState<BoardTab>('자유');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEdit || !Number.isInteger(numericPostId) || numericPostId <= 0) return;
    let active = true;
    getPost(numericPostId)
      .then((post) => {
        if (!active) return;
        if (post.authorId !== user?.id) {
          navigate('/forbidden', { replace: true });
          return;
        }
        setCategory(BOARD_TAB_BY_TYPE[post.type]);
        setTitle(post.title);
        setContent(post.content);
      })
      .catch((error) => {
        if (active) setFormError(getApiErrorMessage(error, '게시글을 불러오지 못했습니다.'));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [isEdit, navigate, numericPostId, user?.id]);

  if (!user) return <Navigate to="/login" replace />;

  const isValid = title.trim().length > 0 && content.trim().length > 0;

  const handleSubmit = async () => {
    if (!isValid || isSubmitting) return;
    setIsSubmitting(true);
    setFormError(null);
    setFieldErrors({});
    try {
      const payload = {
        type: BOARD_TYPE_BY_TAB[category],
        title: title.trim(),
        content: content.trim(),
      };
      const post = isEdit
        ? await updatePost(numericPostId, payload)
        : await createPost(payload);
      navigate(`/board/${post.id}`, { replace: true });
    } catch (error) {
      const errors = getApiFieldErrors(error);
      setFieldErrors(errors);
      if (Object.keys(errors).length === 0) {
        setFormError(getApiErrorMessage(error, '게시글을 저장하지 못했습니다.'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout active="게시판">
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '64px 24px 120px' }}>
        <h1 style={{ font: 'var(--text-title-1)', color: 'var(--label-normal)', margin: '0 0 32px' }}>
          {isEdit ? '게시글 수정' : '글쓰기'}
        </h1>
        {isLoading ? (
          <div className="nm-empty-state">게시글을 불러오는 중이에요.</div>
        ) : (
          <>
            <div className="nm-field">
              <label>카테고리</label>
              <select value={category} onChange={(event) => setCategory(event.target.value as BoardTab)}>
                {BOARD_TABS.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
            <FormField
              label="제목"
              placeholder="제목을 입력하세요"
              value={title}
              maxLength={100}
              hint={fieldErrors.title}
              hintStatus={fieldErrors.title ? 'error' : 'default'}
              onChange={(event) => setTitle(event.target.value)}
            />
            <TextareaField
              label="내용"
              placeholder="내용을 입력하세요"
              value={content}
              maxLength={5000}
              hint={fieldErrors.content}
              hintStatus={fieldErrors.content ? 'error' : 'default'}
              onChange={(event) => setContent(event.target.value)}
              style={{ minHeight: 240, marginBottom: 28 }}
            />
            {formError && <div className="nm-field__hint nm-field__hint--error" style={{ marginBottom: 12 }}>{formError}</div>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <Button label="취소" variant="outlined" color="assistive" size="lg" onClick={() => navigate(isEdit ? `/board/${numericPostId}` : '/board')} />
              <Button
                label={isSubmitting ? '저장 중...' : isEdit ? '수정하기' : '등록'}
                variant="solid"
                color="primary"
                size="lg"
                disabled={!isValid || isSubmitting}
                onClick={() => void handleSubmit()}
              />
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}

export default BoardWritePage;
