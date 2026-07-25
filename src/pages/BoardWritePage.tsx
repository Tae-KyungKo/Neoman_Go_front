import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import FormField from '../components/FormField';
import TextareaField from '../components/TextareaField';
import Button from '../components/Button';
import { BOARD_TABS, type BoardTab } from '../constants/board';

export function BoardWritePage() {
  const navigate = useNavigate();
  const [category, setCategory] = useState<BoardTab>('자유');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const isValid = title.trim().length > 0 && content.trim().length > 0;

  return (
    <MainLayout active="게시판">
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '64px 24px 120px' }}>
        <h1 style={{ font: 'var(--text-title-1)', color: 'var(--label-normal)', margin: '0 0 32px' }}>글쓰기</h1>
        <div className="nm-field">
          <label>카테고리</label>
          <select value={category} onChange={(e) => setCategory(e.target.value as BoardTab)}>
            {BOARD_TABS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <FormField label="제목" placeholder="제목을 입력하세요" value={title} onChange={(e) => setTitle(e.target.value)} />
        <TextareaField
          label="내용"
          placeholder="내용을 입력하세요"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          style={{ marginBottom: 28 }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button label="취소" variant="outlined" color="assistive" size="lg" onClick={() => navigate('/board')} />
          <Button label="등록" variant="solid" color="primary" size="lg" disabled={!isValid} onClick={() => navigate('/board')} />
        </div>
      </div>
    </MainLayout>
  );
}

export default BoardWritePage;
