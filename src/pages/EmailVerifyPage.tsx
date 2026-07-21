import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import Button from '../components/Button';
import Icon from '../components/icons/Icon';
import './AuthForm.css';

export function EmailVerifyPage() {
  const navigate = useNavigate();
  const [verified, setVerified] = useState(false);

  return (
    <AuthLayout>
      <div className="nm-form-card" style={{ width: 420, textAlign: 'center' }}>
        {!verified ? (
          <>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 100,
                background: 'rgba(0,102,255,.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary-normal-3)',
                margin: '0 auto 20px',
              }}
            >
              <Icon name="Message" size={28} />
            </div>
            <h1 className="nm-form-card__title" style={{ marginBottom: 8 }}>
              이메일을 확인해주세요
            </h1>
            <p style={{ font: 'var(--text-body-2-regular)', color: 'var(--label-alternative-2)', margin: '0 0 20px' }}>
              user@neomango.kr 로 인증 링크를 보냈어요.
              <br />
              메일함에서 링크를 눌러 인증을 완료해주세요.
            </p>
            <Button label="인증 메일 다시 보내기" variant="outlined" color="assistive" size="lg" fullWidth />
            <Button label="인증 완료 확인" variant="solid" color="primary" size="lg" fullWidth style={{ marginTop: 8 }} onClick={() => setVerified(true)} />
          </>
        ) : (
          <>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 100,
                background: 'rgba(0,177,124,.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--status-positive)',
                margin: '0 auto 20px',
              }}
            >
              <Icon name="CircleCheck" size={30} />
            </div>
            <h1 className="nm-form-card__title" style={{ marginBottom: 8 }}>
              이메일 인증 완료
            </h1>
            <p style={{ font: 'var(--text-body-2-regular)', color: 'var(--label-alternative-2)', margin: '0 0 28px' }}>이제 너만고의 모든 기능을 이용할 수 있어요.</p>
            <Button label="홈으로 이동" variant="solid" color="primary" size="lg" fullWidth onClick={() => navigate('/')} />
          </>
        )}
      </div>
    </AuthLayout>
  );
}

export default EmailVerifyPage;
