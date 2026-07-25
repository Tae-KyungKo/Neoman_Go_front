import { useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import Chip from '../components/Chip';
import FormField from '../components/FormField';
import TextareaField from '../components/TextareaField';
import Button from '../components/Button';
import { createTeam } from '../api/teamApi';
import { getApiErrorMessage, getApiFieldErrors } from '../api/httpClient';
import { getAccessToken } from '../auth/tokenStorage';
import { useAuth } from '../context/AuthContext';
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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const isValid =
    name.trim().length > 0 &&
    location.trim().length > 0 &&
    time.trim().length > 0;

  const clearFieldError = (field: string) => {
    setFormError(null);
    setFieldErrors((errors) => ({ ...errors, [field]: '' }));
  };

  const handleSubmit = async () => {
    if (!isValid || isSubmitting) return;

    const accessToken = getAccessToken();
    const category = CATEGORIES.find((item) => item.id === categoryId);
    if (!accessToken || !category) return;

    setIsSubmitting(true);
    setFormError(null);
    setFieldErrors({});

    try {
      const team = await createTeam(
        {
          name: name.trim(),
          description: description.trim() || null,
          category: category.apiCode,
          level: level === '즐겜' ? 'CASUAL' : 'COMPETITIVE',
          location: location.trim(),
          activityTime: time.trim(),
        },
        accessToken,
      );
      navigate(`/teams/${team.id}`);
    } catch (error) {
      const nextFieldErrors = getApiFieldErrors(error);
      setFieldErrors(nextFieldErrors);
      if (Object.keys(nextFieldErrors).length === 0) {
        setFormError(getApiErrorMessage(error, '팀을 만들지 못했습니다. 잠시 후 다시 시도해 주세요.'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return <Navigate to="/login" replace />;
  }

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
          hint={fieldErrors.name}
          hintStatus={fieldErrors.name ? 'error' : 'default'}
          onChange={(e) => {
            setName(e.target.value);
            clearFieldError('name');
          }}
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
          <FormField
            label="활동 지역"
            placeholder="온라인 또는 장소"
            value={location}
            maxLength={100}
            hint={fieldErrors.location}
            hintStatus={fieldErrors.location ? 'error' : 'default'}
            onChange={(e) => {
              setLocation(e.target.value);
              clearFieldError('location');
            }}
          />
        </div>

        <FormField
          label="활동 시간"
          placeholder="예: 평일 저녁 9시 이후"
          value={time}
          maxLength={100}
          hint={fieldErrors.activityTime}
          hintStatus={fieldErrors.activityTime ? 'error' : 'default'}
          onChange={(e) => {
            setTime(e.target.value);
            clearFieldError('activityTime');
          }}
        />

        <TextareaField
          label="팀 소개"
          placeholder="어떤 팀인지, 어떤 팀원을 찾는지 소개해주세요"
          value={description}
          maxLength={500}
          hint={fieldErrors.description}
          hintStatus={fieldErrors.description ? 'error' : 'default'}
          onChange={(e) => {
            setDescription(e.target.value);
            clearFieldError('description');
          }}
          style={{ marginBottom: 28 }}
        />

        {formError && <div className="nm-field__hint nm-field__hint--error" style={{ marginBottom: 12 }}>{formError}</div>}
        <Button
          label={isSubmitting ? '팀 만드는 중...' : '팀 만들기'}
          variant="solid"
          color="primary"
          size="lg"
          fullWidth
          disabled={!isValid || isSubmitting}
          onClick={handleSubmit}
        />
      </div>
    </MainLayout>
  );
}

export default TeamCreatePage;
