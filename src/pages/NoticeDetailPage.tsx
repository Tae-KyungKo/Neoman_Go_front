import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import Button from '../components/Button';
import Icon from '../components/icons/Icon';
import { deleteNotice, getNotice, type NoticeResponse } from '../api/noticeApi';
import { getApiErrorMessage } from '../api/httpClient';
import { getAccessToken } from '../auth/tokenStorage';
import { useAuth } from '../context/AuthContext';
import './NoticeDetailPage.css';

function formatNoticeDate(dateTime: string): string {
  return dateTime.slice(0, 10).replaceAll('-', '.');
}

export function NoticeDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [notice, setNotice] = useState<NoticeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const noticeId = Number(id);
    if (!Number.isInteger(noticeId) || noticeId <= 0) {
      setLoadError('존재하지 않는 공지입니다.');
      setIsLoading(false);
      return;
    }

    let active = true;
    setIsLoading(true);
    setLoadError(null);

    getNotice(noticeId)
      .then((response) => {
        if (active) {
          setNotice(response);
        }
      })
      .catch((error) => {
        if (active) {
          setNotice(null);
          setLoadError(getApiErrorMessage(error, '공지사항을 불러오지 못했습니다.'));
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [id]);

  if (isLoading) {
    return (
      <MainLayout active="공지사항">
        <div className="nm-notice-detail">공지사항을 불러오는 중이에요.</div>
      </MainLayout>
    );
  }

  if (!notice || loadError) {
    return (
      <MainLayout active="공지사항">
        <div className="nm-notice-detail">{loadError ?? '존재하지 않는 공지입니다.'}</div>
      </MainLayout>
    );
  }

  const handleDelete = async () => {
    const accessToken = getAccessToken();
    if (!accessToken || isDeleting) return;

    setDeleteError(null);
    setIsDeleting(true);

    try {
      await deleteNotice(notice.id, accessToken);
      setConfirmOpen(false);
      navigate('/notices');
    } catch (error) {
      setDeleteError(getApiErrorMessage(error, '공지사항 삭제에 실패했습니다.'));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <MainLayout active="공지사항">
      <div className="nm-notice-detail">
        <div className="nm-notice-detail__breadcrumb">
          <Link to="/notices">공지사항</Link>
          <Icon name="ChevronRight" size={12} />
          <span>상세</span>
        </div>
        <h1 className="nm-notice-detail__title">{notice.title}</h1>
        <div className="nm-notice-detail__meta">
          <span>{notice.authorName}</span>
          <span>{formatNoticeDate(notice.createdAt)} 작성</span>
          {notice.updatedAt && <span>{formatNoticeDate(notice.updatedAt)} 수정</span>}
        </div>
        <div className="nm-notice-detail__body">{notice.content}</div>
        <div className="nm-notice-detail__actions">
          <Button label="목록으로" variant="outlined" color="assistive" size="md" onClick={() => navigate('/notices')} />
          {user?.role === 'admin' && (
            <div className="nm-notice-detail__actions-right">
              <Button label="수정" variant="outlined" color="assistive" size="md" />
              <Button label="삭제" variant="outlined" color="assistive" size="md" onClick={() => setConfirmOpen(true)} />
            </div>
          )}
        </div>
      </div>

      {confirmOpen && (
        <div className="nm-modal-backdrop" onClick={() => setConfirmOpen(false)}>
          <div className="nm-modal-card" onClick={(e) => e.stopPropagation()}>
            <h3 className="nm-modal-card__title">공지를 삭제하시겠습니까?</h3>
            <p className="nm-modal-card__desc">삭제하면 일반 사용자 목록에서 더 이상 조회할 수 없습니다.</p>
            {deleteError && <div className="nm-field__hint nm-field__hint--error" style={{ marginBottom: 12 }}>{deleteError}</div>}
            <div className="nm-modal-card__actions">
              <Button label="취소" variant="outlined" color="assistive" size="md" onClick={() => setConfirmOpen(false)} />
              <Button label={isDeleting ? '삭제 중...' : '삭제'} variant="solid" color="primary" size="md" disabled={isDeleting} onClick={handleDelete} />
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

export default NoticeDetailPage;
