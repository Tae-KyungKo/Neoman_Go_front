import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import Button from '../components/Button';
import Icon from '../components/icons/Icon';
import { useAuth } from '../context/AuthContext';
import { withMock } from '../lib/mockData';
import { NOTICES } from '../data/notices';
import './NoticeDetailPage.css';

export function NoticeDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const notice = withMock(NOTICES.find((n) => n.id === Number(id)), undefined);

  if (!notice) {
    return (
      <MainLayout active="공지사항">
        <div className="nm-notice-detail">존재하지 않는 공지입니다.</div>
      </MainLayout>
    );
  }

  const handleDelete = () => {
    setConfirmOpen(false);
    navigate('/notices');
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
          <span>관리자</span>
          <span>{notice.createdAt} 작성</span>
          {notice.updatedAt && <span>{notice.updatedAt} 수정</span>}
        </div>
        <div className="nm-notice-detail__body">{notice.body}</div>
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
            <div className="nm-modal-card__actions">
              <Button label="취소" variant="outlined" color="assistive" size="md" onClick={() => setConfirmOpen(false)} />
              <Button label="삭제" variant="solid" color="primary" size="md" onClick={handleDelete} />
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

export default NoticeDetailPage;
