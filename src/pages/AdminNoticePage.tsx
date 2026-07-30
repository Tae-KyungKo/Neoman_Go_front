import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import Button from '../components/Button';
import FormField from '../components/FormField';
import TextareaField from '../components/TextareaField';
import ConfirmModal from '../components/ConfirmModal';
import Pagination from '../components/Pagination';
import {
  createNotice,
  deleteNotice,
  getNotice,
  getNotices,
  updateNotice,
  type NoticeSummaryResponse,
} from '../api/noticeApi';
import { ApiError, getApiErrorMessage } from '../api/httpClient';
import { useAuth } from '../context/AuthContext';

type Mode = 'list' | 'form';

function formatNoticeDate(createdAt: string): string {
  return createdAt.slice(0, 10).replaceAll('-', '.');
}

export function AdminNoticePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('list');
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [editingNoticeId, setEditingNoticeId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [notices, setNotices] = useState<NoticeSummaryResponse[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingEdit, setIsLoadingEdit] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [noticeError, setNoticeError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setNoticeError(null);

    getNotices(page - 1)
      .then((response) => {
        if (!active) return;
        setNotices(response.content);
        setTotalPages(Math.max(1, response.totalPages));
      })
      .catch((error) => {
        if (!active) return;
        setNotices([]);
        setTotalPages(1);
        setNoticeError(getApiErrorMessage(error, '공지사항을 불러오지 못했습니다.'));
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [page, reloadKey]);

  if (user?.role !== 'admin') {
    return <Navigate to="/forbidden" replace />;
  }

  const startCreate = () => {
    setEditingNoticeId(null);
    setTitle('');
    setBody('');
    setNoticeError(null);
    setMode('form');
  };

  const startEdit = async (noticeId: number) => {
    if (isLoadingEdit) return;

    setIsLoadingEdit(true);
    setNoticeError(null);
    try {
      const notice = await getNotice(noticeId);
      setEditingNoticeId(notice.id);
      setTitle(notice.title);
      setBody(notice.content);
      setMode('form');
    } catch (error) {
      setNoticeError(getApiErrorMessage(error, '공지사항 내용을 불러오지 못했습니다.'));
    } finally {
      setIsLoadingEdit(false);
    }
  };

  const handleApiError = (error: unknown, fallback: string) => {
    if (error instanceof ApiError && error.status === 403) {
      navigate('/forbidden', { replace: true });
      return;
    }
    setNoticeError(getApiErrorMessage(error, fallback));
  };

  const handleSave = async () => {
    const normalizedTitle = title.trim();
    const normalizedContent = body.trim();
    if (!normalizedTitle || !normalizedContent || isSaving) return;

    setIsSaving(true);
    setNoticeError(null);
    try {
      const payload = { title: normalizedTitle, content: normalizedContent };
      if (editingNoticeId === null) {
        await createNotice(payload);
        setPage(1);
      } else {
        await updateNotice(editingNoticeId, payload);
      }
      setMode('list');
      setEditingNoticeId(null);
      setTitle('');
      setBody('');
      setReloadKey((key) => key + 1);
    } catch (error) {
      handleApiError(
        error,
        editingNoticeId === null
          ? '공지사항을 등록하지 못했습니다.'
          : '공지사항을 수정하지 못했습니다.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (confirmId === null || isDeleting) return;

    setIsDeleting(true);
    setNoticeError(null);
    try {
      await deleteNotice(confirmId);
      setConfirmId(null);
      setReloadKey((key) => key + 1);
    } catch (error) {
      setConfirmId(null);
      handleApiError(error, '공지사항을 삭제하지 못했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <MainLayout active="공지사항">
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '56px 24px 100px' }}>
        <div style={{ font: 'var(--text-caption-1-semibold)', color: 'var(--primary-normal-3)', marginBottom: 8 }}>ADMIN</div>

        {mode === 'list' ? (
          <>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
              <h1 style={{ font: 'var(--text-title-1)', color: 'var(--label-normal)', margin: 0 }}>공지 관리</h1>
              <Button label="공지 작성" variant="solid" color="primary" size="sm" onClick={startCreate} />
            </div>

            {noticeError && (
              <div className="nm-field__hint nm-field__hint--error" style={{ marginBottom: 16 }}>
                {noticeError}
              </div>
            )}
            {isLoading && <div className="nm-empty-state">공지사항을 불러오는 중이에요.</div>}
            {!isLoading && !noticeError && notices.length === 0 && (
              <div className="nm-empty-state">등록된 공지가 없어요.</div>
            )}
            {!isLoading && notices.length > 0 && (
              <div className="nm-list-card">
                {notices.map((notice) => (
                  <div key={notice.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 24px', borderBottom: '1px solid var(--line-normal-normal)' }}>
                    <span style={{ flex: 1, font: 'var(--text-body-1-medium)', color: 'var(--label-normal)' }}>{notice.title}</span>
                    <span style={{ font: 'var(--text-caption-1-medium)', color: 'var(--label-alternative-2)' }}>{formatNoticeDate(notice.createdAt)}</span>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Button
                        label={isLoadingEdit ? '불러오는 중...' : '수정'}
                        variant="outlined"
                        color="assistive"
                        size="sm"
                        disabled={isLoadingEdit}
                        onClick={() => void startEdit(notice.id)}
                      />
                      <Button label="삭제" variant="outlined" color="assistive" size="sm" onClick={() => setConfirmId(notice.id)} />
                    </div>
                  </div>
                ))}
              </div>
            )}
            {!isLoading && !noticeError && (
              <Pagination page={page} totalPages={totalPages} onChange={setPage} />
            )}
          </>
        ) : (
          <>
            <h1 style={{ font: 'var(--text-title-1)', color: 'var(--label-normal)', margin: '0 0 24px' }}>
              {editingNoticeId === null ? '공지 작성' : '공지 수정'}
            </h1>
            {noticeError && (
              <div className="nm-field__hint nm-field__hint--error" style={{ marginBottom: 16 }}>
                {noticeError}
              </div>
            )}
            <FormField
              label="제목"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="공지 제목을 입력하세요"
              maxLength={100}
            />
            <TextareaField
              label="본문"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="공지 내용을 입력하세요"
              maxLength={5000}
              style={{ marginBottom: 28 }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <Button label="취소" variant="outlined" color="assistive" size="lg" onClick={() => setMode('list')} />
              <Button
                label={isSaving ? '저장 중...' : '저장하기'}
                variant="solid"
                color="primary"
                size="lg"
                disabled={!title.trim() || !body.trim() || isSaving}
                onClick={() => void handleSave()}
              />
            </div>
          </>
        )}
      </div>

      {confirmId != null && (
        <ConfirmModal
          title="공지를 삭제하시겠습니까?"
          description="삭제하면 일반 사용자 목록에서 더 이상 조회할 수 없습니다."
          confirmLabel={isDeleting ? '삭제 중...' : '삭제'}
          confirmDisabled={isDeleting}
          onCancel={() => setConfirmId(null)}
          onConfirm={() => void handleDelete()}
        />
      )}
    </MainLayout>
  );
}

export default AdminNoticePage;
