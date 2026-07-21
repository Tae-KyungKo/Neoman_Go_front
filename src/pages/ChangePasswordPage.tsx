import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import FormField from '../components/FormField';
import Button from '../components/Button';
import { validatePassword, validatePasswordConfirm } from '../lib/validation';
import './AuthForm.css';

export function ChangePasswordPage() {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const newPasswordError = validatePassword(newPassword);
  const confirmError = validatePasswordConfirm(newPassword, confirmPassword);
  const isValid = currentPassword && newPassword && confirmPassword && !newPasswordError && !confirmError;

  return (
    <AuthLayout>
      <div className="nm-form-card" style={{ width: 440 }}>
        <h1 className="nm-form-card__title">비밀번호 변경</h1>
        <FormField
          label="현재 비밀번호"
          type="password"
          placeholder="현재 비밀번호를 입력하세요"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
        <FormField
          label="새 비밀번호"
          type="password"
          placeholder="영문·숫자·특수문자 포함 8자 이상"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          hint={newPasswordError ?? undefined}
          hintStatus={newPasswordError ? 'error' : 'default'}
        />
        <FormField
          label="새 비밀번호 확인"
          type="password"
          placeholder="새 비밀번호를 다시 입력하세요"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          hint={confirmError ?? (confirmPassword ? '비밀번호가 일치해요' : undefined)}
          hintStatus={confirmError ? 'error' : confirmPassword ? 'positive' : 'default'}
        />
        <Button
          label="변경하기"
          variant="solid"
          color="primary"
          size="lg"
          fullWidth
          disabled={!isValid}
          onClick={() => navigate('/mypage/info')}
          style={{ marginTop: 4 }}
        />
      </div>
    </AuthLayout>
  );
}

export default ChangePasswordPage;
