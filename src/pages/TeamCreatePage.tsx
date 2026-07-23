import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import Chip from '../components/Chip';
import FormField from '../components/FormField';
import TextareaField from '../components/TextareaField';
import Button from '../components/Button';
import { CATEGORIES } from '../data/categories';
import type { TeamLevel } from '../data/teams';
import './TeamCreatePage.css';

export function TeamCreatePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [categoryId, setCategoryId] = useState(searchParams.get('category') ?? CATEGORIES[0].id);
  const [level, setLevel] = useState<TeamLevel>('즐겜');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');

  const isValid = name.trim().length > 0;

  const handleSubmit = () => {
    if (!isValid) return;
    navigate('/teams');
  };

  return (
    <MainLayout active="팀 찾기">
      <div className="nm-team-create">
        <h1 className="nm-team-create__title">팀 만들기</h1>
        <p className="nm-team-create__desc">같이 활동할 팀원을 꾸준히 모아보세요. 만든 팀은 정규 클랜처럼 계속 이어갈 수 있어요.</p>

        <div className="nm-field">
          <label>종목</label>
          <div className="nm-chip-select">
            {CATEGORIES.map((c) => (
              <Chip key={c.id} active={categoryId === c.id} onClick={() => setCategoryId(c.id)}>
                {c.ko}
              </Chip>
            ))}
          </div>
        </div>

        <FormField
          label="팀 이름"
          placeholder="팀 이름을 입력하세요"
          value={name}
          maxLength={50}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="nm-field-row-2">
          <div className="nm-field">
            <label>팀 성향</label>
            <div className="nm-chip-select">
              {(['즐겜', '빡겜'] as TeamLevel[]).map((l) => (
                <Chip key={l} active={level === l} onClick={() => setLevel(l)}>
                  {l}
                </Chip>
              ))}
            </div>
          </div>
          <FormField label="활동 지역" placeholder="온라인 또는 지역명" value={location} onChange={(e) => setLocation(e.target.value)} />
        </div>

        <FormField label="활동 시간" placeholder="예: 평일 저녁 9시 이후" value={time} onChange={(e) => setTime(e.target.value)} />

        <TextareaField
          label="팀 소개"
          placeholder="어떤 팀인지, 어떤 팀원을 찾는지 소개해주세요"
          value={description}
          maxLength={500}
          onChange={(e) => setDescription(e.target.value)}
          style={{ marginBottom: 28 }}
        />

        <Button label="팀 만들기" variant="solid" color="primary" size="lg" fullWidth disabled={!isValid} onClick={handleSubmit} />
      </div>
    </MainLayout>
  );
}

export default TeamCreatePage;
