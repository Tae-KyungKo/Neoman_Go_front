import type { UserRole } from '../context/AuthContext';

export interface MockUser {
  loginId: string;
  password: string;
  nickname: string;
  email: string;
  joinedAt: string;
  role: UserRole;
}

export const MOCK_USERS: MockUser[] = [
  {
    loginId: 'neomango_user',
    password: 'Password123!',
    nickname: '플레이어1',
    email: 'user@neomango.kr',
    joinedAt: '2026.03.02',
    role: 'user',
  },
];

export function findMockUser(loginId: string, password: string): MockUser | undefined {
  return MOCK_USERS.find((u) => u.loginId === loginId && u.password === password);
}
