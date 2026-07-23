import { requestApi } from './httpClient';

export interface MeResponse {
  id: number;
  email: string;
  nickname: string;
  role: 'USER' | 'ADMIN';
  status: 'ACTIVE' | 'DELETED';
}

export function getCurrentUser(accessToken: string): Promise<MeResponse> {
  return requestApi<MeResponse>('/api/users/me', {}, accessToken);
}
