import { api } from './client'

export function signup(payload) {
  return api.post('/api/auth/signup', payload)
}

export function login(payload) {
  return api.post('/api/auth/login', payload)
}

export function logout() {
  // TODO: 백엔드 로그아웃 엔드포인트 확정 후 실제 API 호출로 교체한다.
  return Promise.reject(new Error('TODO: logout endpoint is not confirmed.'))
}

export function reissue(payload) {
  // TODO: 백엔드 토큰 재발급 엔드포인트 확정 후 실제 API 호출로 교체한다.
  void payload
  return Promise.reject(new Error('TODO: reissue endpoint is not confirmed.'))
}
