import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import FormField from '../components/FormField';
import Button from '../components/Button';
import { checkLoginId, checkNickname, requestSignup } from '../api/authApi';
import { getApiErrorMessage, getApiFieldErrors } from '../api/httpClient';
import {
  validateLoginId,
  validatePassword,
  validatePasswordConfirm,
  validateEmail,
  validateNickname,
} from '../lib/validation';
import './AuthForm.css';

export function SignupPage() {
  type AvailabilityState = 'idle' | 'checking' | 'available' | 'unavailable' | 'error';

  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [loginIdAvailability, setLoginIdAvailability] = useState<AvailabilityState>('idle');
  const [nicknameAvailability, setNicknameAvailability] = useState<AvailabilityState>('idle');
  const [loginIdAvailabilityMessage, setLoginIdAvailabilityMessage] = useState<string | null>(null);
  const [nicknameAvailabilityMessage, setNicknameAvailabilityMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [serverFieldErrors, setServerFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const loginIdError = validateLoginId(loginId);
  const passwordError = validatePassword(password);
  const passwordConfirmError = validatePasswordConfirm(password, passwordConfirm);
  const emailError = validateEmail(email);
  const nicknameError = validateNickname(nickname);

  const handleCheckLoginId = async () => {
    if (!loginId || loginIdError) return;

    setLoginIdAvailability('checking');
    setLoginIdAvailabilityMessage(null);

    try {
      const result = await checkLoginId(loginId);
      setLoginIdAvailability(result.available ? 'available' : 'unavailable');
      setLoginIdAvailabilityMessage(
        result.available ? '사용 가능한 아이디입니다.' : '이미 사용 중인 아이디입니다.',
      );
    } catch (error) {
      setLoginIdAvailability('error');
      setLoginIdAvailabilityMessage(
        getApiErrorMessage(error, '아이디 중복 확인에 실패했습니다.'),
      );
    }
  };

  const handleCheckNickname = async () => {
    if (!nickname || nicknameError) return;

    setNicknameAvailability('checking');
    setNicknameAvailabilityMessage(null);

    try {
      const result = await checkNickname(nickname);
      setNicknameAvailability(result.available ? 'available' : 'unavailable');
      setNicknameAvailabilityMessage(
        result.available ? '사용 가능한 닉네임입니다.' : '이미 사용 중인 닉네임입니다.',
      );
    } catch (error) {
      setNicknameAvailability('error');
      setNicknameAvailabilityMessage(
        getApiErrorMessage(error, '닉네임 중복 확인에 실패했습니다.'),
      );
    }
  };

  const loginIdHint =
    loginIdError ??
    loginIdAvailabilityMessage ??
    (loginId ? '중복 확인이 필요해요' : '4~12자의 영문 대소문자와 숫자를 사용할 수 있어요.');
  const nicknameHint =
    nicknameError ??
    nicknameAvailabilityMessage ??
    (nickname ? '중복 확인이 필요해요' : '2~12자로 입력해 주세요.');
  const loginIdHintStatus =
    loginIdError || loginIdAvailability === 'unavailable' || loginIdAvailability === 'error'
      ? 'error'
      : loginIdAvailability === 'available'
        ? 'positive'
        : 'default';
  const nicknameHintStatus =
    nicknameError || nicknameAvailability === 'unavailable' || nicknameAvailability === 'error'
      ? 'error'
      : nicknameAvailability === 'available'
        ? 'positive'
        : 'default';

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
    !nicknameError &&
    loginIdAvailability === 'available' &&
    nicknameAvailability === 'available';

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!isValid || isSubmitting) return;

    setSubmitError(null);
    setServerFieldErrors({});
    setIsSubmitting(true);

    try {
      await requestSignup({
        loginId,
        password,
        passwordConfirm,
        email,
        nickname,
      });
      navigate('/login');
    } catch (error) {
      const nextFieldErrors = getApiFieldErrors(error);
      setServerFieldErrors(nextFieldErrors);
      if (Object.keys(nextFieldErrors).length === 0) {
        setSubmitError(getApiErrorMessage(error, '회원가입에 실패했습니다.'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div className="nm-form-card" style={{ width: 440 }}>
        <h1 className="nm-form-card__title">회원가입</h1>
        <form onSubmit={handleSubmit}>
          <FormField
            label="아이디"
            value={loginId}
            maxLength={12}
            autoComplete="username"
            onChange={(e) => {
              setLoginId(e.target.value);
              setLoginIdAvailability('idle');
              setLoginIdAvailabilityMessage(null);
              setServerFieldErrors((errors) => ({ ...errors, loginId: '' }));
            }}
            hint={serverFieldErrors.loginId || loginIdHint}
            hintStatus={serverFieldErrors.loginId ? 'error' : loginIdHintStatus}
            action={
              <Button
                label={loginIdAvailability === 'checking' ? '확인 중...' : '중복 확인'}
                variant="outlined"
                color="assistive"
                size="md"
                disabled={!loginId || Boolean(loginIdError) || loginIdAvailability === 'checking'}
                onClick={handleCheckLoginId}
              />
            }
          />
          <FormField
            label="비밀번호"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setServerFieldErrors((errors) => ({ ...errors, password: '' }));
            }}
            hint={serverFieldErrors.password || passwordError || '영문·숫자·특수문자 포함 8자 이상'}
            hintStatus={serverFieldErrors.password || passwordError ? 'error' : 'default'}
          />
          <FormField
            label="비밀번호 확인"
            type="password"
            value={passwordConfirm}
            onChange={(e) => {
              setPasswordConfirm(e.target.value);
              setServerFieldErrors((errors) => ({ ...errors, passwordConfirm: '' }));
            }}
            hint={serverFieldErrors.passwordConfirm || passwordConfirmError || (passwordConfirm ? '비밀번호가 일치해요' : undefined)}
            hintStatus={serverFieldErrors.passwordConfirm || passwordConfirmError ? 'error' : passwordConfirm ? 'positive' : 'default'}
          />
          <FormField
            label="이메일"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setServerFieldErrors((errors) => ({ ...errors, email: '' }));
            }}
            hint={serverFieldErrors.email || emailError || undefined}
            hintStatus={serverFieldErrors.email || emailError ? 'error' : 'default'}
          />
          <FormField
            label="닉네임"
            value={nickname}
            maxLength={12}
            onChange={(e) => {
              setNickname(e.target.value);
              setNicknameAvailability('idle');
              setNicknameAvailabilityMessage(null);
              setServerFieldErrors((errors) => ({ ...errors, nickname: '' }));
            }}
            hint={serverFieldErrors.nickname || nicknameHint}
            hintStatus={serverFieldErrors.nickname ? 'error' : nicknameHintStatus}
            action={
              <Button
                label={nicknameAvailability === 'checking' ? '확인 중...' : '중복 확인'}
                variant="outlined"
                color="assistive"
                size="md"
                disabled={!nickname || Boolean(nicknameError) || nicknameAvailability === 'checking'}
                onClick={handleCheckNickname}
              />
            }
            style={{ marginBottom: 4 }}
          />
          {submitError && (
            <div className="nm-field__hint nm-field__hint--error" role="alert">
              {submitError}
            </div>
          )}
          <Button
            label={isSubmitting ? '가입 중...' : '가입하기'}
            variant="solid"
            color="primary"
            size="lg"
            fullWidth
            type="submit"
            disabled={!isValid || isSubmitting}
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
