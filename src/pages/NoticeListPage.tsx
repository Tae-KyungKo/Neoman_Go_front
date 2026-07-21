import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import Button from '../components/Button';
import Pagination from '../components/Pagination';
import { useAuth } from '../context/AuthContext';
import { withMock } from '../lib/mockData';
import { NOTICES, NOTICE_PAGE_SIZE } from '../data/notices';
import './NoticeListPage.css';

export function NoticeListPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const notices = withMock(NOTICES, []);
  const totalPages = Math.max(1, Math.ceil(notices.length / NOTICE_PAGE_SIZE));
  const pageItems = notices.slice((page - 1) * NOTICE_PAGE_SIZE, page * NOTICE_PAGE_SIZE);

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

        {pageItems.length === 0 && (
          <div style={{ padding: '80px 0', textAlign: 'center', font: 'var(--text-body-1-regular)', color: 'var(--label-alternative-3)' }}>
            등록된 공지가 없어요.
          </div>
        )}
        <div className="nm-list-card">
          {pageItems.map((notice) => (
            <div key={notice.id} className="nm-list-row" onClick={() => navigate(`/notices/${notice.id}`)}>
              <span className="nm-list-row__title">{notice.title}</span>
              <span className="nm-list-row__meta">
                <span>관리자</span>
                <span>{notice.createdAt}</span>
              </span>
            </div>
          ))}
        </div>

        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>
    </MainLayout>
  );
}

export default NoticeListPage;
