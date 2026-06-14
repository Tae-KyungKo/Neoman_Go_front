import { api } from './client'

export function signup(payload) {
  return api.post('/api/auth/signup', payload)
}

export function login(payload) {
  return api.post('/api/auth/login', payload)
}

export function logout() {
  return Promise.reject(new Error('TODO: logout endpoint is not confirmed.'))
}

export function reissue(payload) {
  const refreshToken = payload?.refreshToken

  if (!refreshToken) {
    return Promise.reject(new Error('refreshToken is required for token reissue.'))
  }

  return api.post('/api/auth/reissue', { refreshToken }).then((response) => {
    const data = response?.data?.data ?? response?.data ?? {}

    return {
      accessToken: data.accessToken ?? null,
      refreshToken: data.refreshToken ?? refreshToken,
      tokenType: data.tokenType ?? 'Bearer',
      accessTokenExpiresIn: data.accessTokenExpiresIn ?? null,
    }
  })
}
