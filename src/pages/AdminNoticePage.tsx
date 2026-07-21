import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import Button from '../components/Button';
import FormField from '../components/FormField';
import TextareaField from '../components/TextareaField';
import ConfirmModal from '../components/ConfirmModal';
import { useAuth } from '../context/AuthContext';
import { NOTICES } from '../data/notices';
import { withMock } from '../lib/mockData';

type Mode = 'list' | 'form';

export function AdminNoticePage() {
  const { user } = useAuth();
  const [mode, setMode] = useState<Mode>('list');
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const notices = withMock(NOTICES, []);

  if (user?.role !== 'admin') {
    return <Navigate to="/forbidden" replace />;
  }

  const startCreate = () => {
    setTitle('');
    setBody('');
    setMode('form');
  };
  const startEdit = (noticeId: number) => {
    const notice = notices.find((n) => n.id === noticeId);
    setTitle(notice?.title ?? '');
    setBody(notice?.body ?? '');
    setMode('form');
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
            <div className="nm-list-card">
              {notices.map((n) => (
                <div key={n.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 24px', borderBottom: '1px solid var(--line-normal-normal)' }}>
                  <span style={{ flex: 1, font: 'var(--text-body-1-medium)', color: 'var(--label-normal)' }}>{n.title}</span>
                  <span style={{ font: 'var(--text-caption-1-medium)', color: 'var(--label-alternative-2)' }}>{n.createdAt}</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <Button label="수정" variant="outlined" color="assistive" size="sm" onClick={() => startEdit(n.id)} />
                    <Button label="삭제" variant="outlined" color="assistive" size="sm" onClick={() => setConfirmId(n.id)} />
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <h1 style={{ font: 'var(--text-title-1)', color: 'var(--label-normal)', margin: '0 0 24px' }}>공지 작성</h1>
            <FormField label="제목" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="공지 제목을 입력하세요" />
            <TextareaField label="본문" value={body} onChange={(e) => setBody(e.target.value)} placeholder="공지 내용을 입력하세요" style={{ marginBottom: 28 }} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <Button label="취소" variant="outlined" color="assistive" size="lg" onClick={() => setMode('list')} />
              <Button label="저장하기" variant="solid" color="primary" size="lg" onClick={() => setMode('list')} />
            </div>
          </>
        )}
      </div>

      {confirmId != null && (
        <ConfirmModal
          title="공지를 삭제하시겠습니까?"
          description="삭제하면 일반 사용자 목록에서 더 이상 조회할 수 없습니다."
          confirmLabel="삭제"
          onCancel={() => setConfirmId(null)}
          onConfirm={() => setConfirmId(null)}
        />
      )}
    </MainLayout>
  );
}

export default AdminNoticePage;
