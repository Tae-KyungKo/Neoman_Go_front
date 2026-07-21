import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import FormField from '../components/FormField';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { findMockUser } from '../data/mockUsers';
import './AuthForm.css';

export function LoginPage() {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const expired = searchParams.get('expired') === '1';

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const matched = findMockUser(loginId, password);
    if (!matched) {
      setFormError('아이디 또는 비밀번호를 확인해 주세요.');
      return;
    }
    setFormError(null);
    login(matched);
    navigate('/');
  };

  return (
    <AuthLayout>
      <div style={{ width: 400 }}>
        {expired && (
          <div
            style={{
              display: 'flex',
              gap: 10,
              alignItems: 'center',
              background: 'rgba(255,171,0,.12)',
              color: '#8a6100',
              borderRadius: 12,
              padding: '14px 16px',
              marginBottom: 20,
              font: 'var(--text-body-2-medium)',
            }}
          >
            로그인이 만료되었습니다. 계속하려면 다시 로그인해 주세요.
          </div>
        )}
        <div className="nm-form-card">
        <h1 className="nm-form-card__title">로그인</h1>
        <form onSubmit={handleSubmit}>
          <FormField
            label="로그인 아이디"
            placeholder="아이디를 입력하세요"
            value={loginId}
            hintStatus={formError ? 'error' : 'default'}
            onChange={(e) => setLoginId(e.target.value)}
          />
          <FormField
            label="비밀번호"
            type="password"
            placeholder="비밀번호를 입력하세요"
            value={password}
            hint={formError ?? undefined}
            hintStatus={formError ? 'error' : 'default'}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button label="로그인" variant="solid" color="primary" size="lg" fullWidth type="submit" style={{ marginTop: 4 }} />
        </form>
        <div style={{ textAlign: 'center', marginTop: 14 }}>
          <Link to="/find-password" style={{ font: 'var(--text-caption-1-medium)', color: 'var(--label-alternative-2)' }}>
            비밀번호를 잊으셨나요?
          </Link>
        </div>
        <div className="nm-form-card__footer">
          아직 계정이 없으신가요? <Link to="/signup">회원가입</Link>
        </div>
        </div>
      </div>
    </AuthLayout>
  );
}

export default LoginPage;
