import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import FormField from '../components/FormField';
import Button from '../components/Button';
import {
  validateLoginId,
  validatePassword,
  validatePasswordConfirm,
  validateEmail,
  validateNickname,
} from '../lib/validation';
import './AuthForm.css';

export function SignupPage() {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const navigate = useNavigate();

  const loginIdError = validateLoginId(loginId);
  const passwordError = validatePassword(password);
  const passwordConfirmError = validatePasswordConfirm(password, passwordConfirm);
  const emailError = validateEmail(email);
  const nicknameError = validateNickname(nickname);

  const isValid =
    loginId &&
    password &&
    passwordConfirm &&
    email &&
    nickname &&
    !loginIdError &&
    !passwordError &&
    !passwordConfirmError &&
    !emailError &&
    !nicknameError;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!isValid) return;
    navigate('/login');
  };

  return (
    <AuthLayout>
      <div className="nm-form-card" style={{ width: 440 }}>
        <h1 className="nm-form-card__title">회원가입</h1>
        <form onSubmit={handleSubmit}>
          <FormField
            label="로그인 아이디"
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            hint={loginIdError ?? (loginId ? '사용 가능한 형식이에요' : undefined)}
            hintStatus={loginIdError ? 'error' : loginId ? 'positive' : 'default'}
          />
          <FormField
            label="비밀번호"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            hint={passwordError ?? '영문·숫자·특수문자 포함 8자 이상'}
            hintStatus={passwordError ? 'error' : 'default'}
          />
          <FormField
            label="비밀번호 확인"
            type="password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            hint={passwordConfirmError ?? (passwordConfirm ? '비밀번호가 일치해요' : undefined)}
            hintStatus={passwordConfirmError ? 'error' : passwordConfirm ? 'positive' : 'default'}
          />
          <FormField label="이메일" value={email} onChange={(e) => setEmail(e.target.value)} hint={emailError ?? undefined} hintStatus={emailError ? 'error' : 'default'} />
          <FormField
            label="닉네임"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            hint={nicknameError ?? undefined}
            hintStatus={nicknameError ? 'error' : 'default'}
            style={{ marginBottom: 4 }}
          />
          <Button
            label="가입하기"
            variant="solid"
            color="primary"
            size="lg"
            fullWidth
            type="submit"
            disabled={!isValid}
            style={{ marginTop: 16 }}
          />
        </form>
        <div className="nm-form-card__footer">
          이미 계정이 있으신가요? <Link to="/login">로그인</Link>
        </div>
      </div>
    </AuthLayout>
  );
}

export default SignupPage;
