import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import Button from '../components/Button';
import Pagination from '../components/Pagination';
import { getNotices, type NoticeSummaryResponse } from '../api/noticeApi';
import { getApiErrorMessage } from '../api/httpClient';
import { useAuth } from '../context/AuthContext';
import './NoticeListPage.css';

function formatNoticeDate(createdAt: string): string {
  return createdAt.slice(0, 10).replaceAll('-', '.');
}

export function NoticeListPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [notices, setNotices] = useState<NoticeSummaryResponse[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setLoadError(null);

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
        setLoadError(getApiErrorMessage(error, '공지사항을 불러오지 못했습니다.'));
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [page]);

  return (
    <MainLayout active="공지사항">
      <div className="nm-notice-list">
        <div className="nm-notice-list__header">
          <h1 className="nm-notice-list__title">공지사항</h1>
          {user?.role === 'admin' && (
            <Button label="공지 작성" variant="solid" color="primary" size="sm" onClick={() => navigate('/admin/notices')} />
          )}
        </div>
        <p className="nm-notice-list__subtitle">너만고의 새 소식과 정책 변경을 확인하세요.</p>

        {isLoading && (
          <div style={{ padding: '80px 0', textAlign: 'center', font: 'var(--text-body-1-regular)', color: 'var(--label-alternative-3)' }}>
            공지사항을 불러오는 중이에요.
          </div>
        )}
        {!isLoading && loadError && (
          <div style={{ padding: '80px 0', textAlign: 'center', font: 'var(--text-body-1-regular)', color: 'var(--status-negative)' }}>
            {loadError}
          </div>
        )}
        {!isLoading && !loadError && notices.length === 0 && (
          <div style={{ padding: '80px 0', textAlign: 'center', font: 'var(--text-body-1-regular)', color: 'var(--label-alternative-3)' }}>
            등록된 공지가 없어요.
          </div>
        )}
        {!isLoading && !loadError && notices.length > 0 && (
          <div className="nm-list-card">
            {notices.map((notice) => (
              <div key={notice.id} className="nm-list-row" onClick={() => navigate(`/notices/${notice.id}`)}>
                <span className="nm-list-row__title">{notice.title}</span>
                <span className="nm-list-row__meta">
                  <span>{notice.authorName}</span>
                  <span>{formatNoticeDate(notice.createdAt)}</span>
                </span>
              </div>
            ))}
          </div>
        )}

        {!isLoading && !loadError && (
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        )}
      </div>
    </MainLayout>
  );
}

export default NoticeListPage;
