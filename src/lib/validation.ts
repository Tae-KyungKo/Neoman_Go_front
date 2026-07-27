const LOGIN_ID_REGEX = /^[A-Za-z0-9]{4,12}$/;
const PASSWORD_REGEX = /^[A-Za-z0-9!@#$%^&*()_\-+=[\]{};:'",.<>/?\\|`~]{8,16}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESERVED_NICKNAMES = ['관리자', '운영자', 'admin'];

export function validateLoginId(value: string): string | null {
  if (!value) return null;
  if (!LOGIN_ID_REGEX.test(value)) {
    return '아이디는 4~12자의 영문 대소문자와 숫자만 사용할 수 있습니다.';
  }
  return null;
}

export function validatePassword(value: string): string | null {
  if (!value) return null;
  if (!PASSWORD_REGEX.test(value)) {
    return '비밀번호는 8~16자이며 공백 없이 영문, 숫자, 특수문자만 사용할 수 있습니다.';
  }
  return null;
}

export function validatePasswordConfirm(password: string, confirm: string): string | null {
  if (!confirm) return null;
  if (password !== confirm) return '비밀번호가 일치하지 않아요';
  return null;
}

export function validateEmail(value: string): string | null {
  if (!value) return null;
  if (!EMAIL_REGEX.test(value)) return '이메일 형식이 올바르지 않습니다.';
  return null;
}

export function validateNickname(value: string): string | null {
  if (!value) return null;
  if (value.length < 2 || value.length > 12) {
    return '닉네임은 2~12자여야 합니다.';
  }
  if (RESERVED_NICKNAMES.includes(value.toLowerCase())) {
    return '사용할 수 없는 닉네임이에요';
  }
  return null;
}
