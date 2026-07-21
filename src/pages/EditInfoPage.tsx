import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import FormField from '../components/FormField';
import Button from '../components/Button';
import Avatar from '../components/Avatar';
import { useAuth } from '../context/AuthContext';
import { validateNickname, validateEmail } from '../lib/validation';
import './AuthForm.css';

export function EditInfoPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [nickname, setNickname] = useState(user?.nickname ?? '');
  const [email, setEmail] = useState('user@neomango.kr');

  const nicknameError = validateNickname(nickname);
  const emailError = validateEmail(email);
  const isValid = nickname && email && !nicknameError && !emailError;

  return (
    <AuthLayout>
      <div className="nm-form-card" style={{ width: 440 }}>
        <h1 className="nm-form-card__title">정보 수정</h1>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <Avatar size={80} />
        </div>
        <FormField
          label="닉네임"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          hint={nicknameError ?? undefined}
          hintStatus={nicknameError ? 'error' : 'default'}
        />
        <FormField
          label="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          hint={emailError ?? undefined}
          hintStatus={emailError ? 'error' : 'default'}
        />
        <div className="nm-field" style={{ marginBottom: 20 }}>
          <label>로그인 아이디</label>
          <input defaultValue="neomango_user" disabled />
          <div className="nm-field__hint">아이디는 변경할 수 없어요</div>
        </div>
        <Button
          label="저장하기"
          variant="solid"
          color="primary"
          size="lg"
          fullWidth
          disabled={!isValid}
          onClick={() => navigate('/mypage/info')}
        />
      </div>
    </AuthLayout>
  );
}

export default EditInfoPage;
