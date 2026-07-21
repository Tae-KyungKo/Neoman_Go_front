import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import FormField from '../components/FormField';
import Button from '../components/Button';
import { validatePassword, validatePasswordConfirm } from '../lib/validation';
import './AuthForm.css';
import './FindPasswordPage.css';

export function FindPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loginId, setLoginId] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const passwordError = validatePassword(newPassword);
  const confirmError = validatePasswordConfirm(newPassword, confirmPassword);

  return (
    <AuthLayout>
      <div className="nm-form-card" style={{ width: 420 }}>
        <div className="nm-step-dots">
          {[1, 2, 3].map((s) => (
            <div key={s} className={'nm-step-dot' + (s === step ? ' nm-step-dot--active' : '')} />
          ))}
        </div>

        {step === 1 && (
          <>
            <h1 className="nm-form-card__title" style={{ marginBottom: 8 }}>
              비밀번호 찾기
            </h1>
            <p style={{ font: 'var(--text-body-2-regular)', color: 'var(--label-alternative-2)', margin: '0 0 24px', textAlign: 'center' }}>
              가입 시 등록한 아이디와 이메일을 입력해주세요.
            </p>
            <FormField label="로그인 아이디" placeholder="아이디를 입력하세요" value={loginId} onChange={(e) => setLoginId(e.target.value)} />
            <FormField
              label="이메일"
              placeholder="가입한 이메일을 입력하세요"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ marginBottom: 20 }}
            />
            <Button
              label="인증코드 받기"
              variant="solid"
              color="primary"
              size="lg"
              fullWidth
              disabled={!loginId || !email}
              onClick={() => setStep(2)}
            />
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="nm-form-card__title" style={{ marginBottom: 8 }}>
              인증코드 입력
            </h1>
            <p style={{ font: 'var(--text-body-2-regular)', color: 'var(--label-alternative-2)', margin: '0 0 24px', textAlign: 'center' }}>
              {email || 'user@neomango.kr'} 로 전송된 6자리 코드를 입력해주세요.
            </p>
            <div className="nm-otp-row">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  className="nm-otp-box"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => setOtp((list) => list.map((d, idx) => (idx === i ? e.target.value.slice(-1) : d)))}
                />
              ))}
            </div>
            <div style={{ textAlign: 'center', font: 'var(--text-caption-1-medium)', color: 'var(--label-alternative-3)', marginBottom: 20 }}>
              남은 시간 04:52 · <a href="#">코드 재전송</a>
            </div>
            <Button label="확인" variant="solid" color="primary" size="lg" fullWidth disabled={otp.some((d) => !d)} onClick={() => setStep(3)} />
          </>
        )}

        {step === 3 && (
          <>
            <h1 className="nm-form-card__title">새 비밀번호 설정</h1>
            <FormField
              label="새 비밀번호"
              type="password"
              placeholder="영문·숫자·특수문자 포함 8자 이상"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              hint={passwordError ?? undefined}
              hintStatus={passwordError ? 'error' : 'default'}
            />
            <FormField
              label="새 비밀번호 확인"
              type="password"
              placeholder="새 비밀번호를 다시 입력하세요"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              hint={confirmError ?? (confirmPassword ? '비밀번호가 일치해요' : undefined)}
              hintStatus={confirmError ? 'error' : confirmPassword ? 'positive' : 'default'}
              style={{ marginBottom: 20 }}
            />
            <Button
              label="비밀번호 변경 완료"
              variant="solid"
              color="primary"
              size="lg"
              fullWidth
              disabled={!newPassword || !confirmPassword || Boolean(passwordError) || Boolean(confirmError)}
              onClick={() => navigate('/login')}
            />
          </>
        )}
      </div>
    </AuthLayout>
  );
}

export default FindPasswordPage;
