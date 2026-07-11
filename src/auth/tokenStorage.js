export const ACCESS_TOKEN_STORAGE_KEY = 'accessToken'
export const REFRESH_TOKEN_STORAGE_KEY = 'refreshToken'
export const TOKEN_TYPE_STORAGE_KEY = 'tokenType'
export const ACCESS_TOKEN_EXPIRES_IN_STORAGE_KEY = 'accessTokenExpiresIn'

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY) ?? ''
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY) ?? ''
}

export function saveTokens({
  accessToken,
  refreshToken,
  tokenType = 'Bearer',
  accessTokenExpiresIn,
}) {
  if (!accessToken) {
    throw new Error('accessToken is required.')
  }

  if (!refreshToken) {
    throw new Error('refreshToken is required.')
  }

  localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken)
  localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken)
  localStorage.setItem(TOKEN_TYPE_STORAGE_KEY, tokenType)

  if (accessTokenExpiresIn !== undefined && accessTokenExpiresIn !== null) {
    localStorage.setItem(
      ACCESS_TOKEN_EXPIRES_IN_STORAGE_KEY,
      String(accessTokenExpiresIn),
    )
  } else {
    localStorage.removeItem(ACCESS_TOKEN_EXPIRES_IN_STORAGE_KEY)
  }
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY)
  localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY)
  localStorage.removeItem(TOKEN_TYPE_STORAGE_KEY)
  localStorage.removeItem(ACCESS_TOKEN_EXPIRES_IN_STORAGE_KEY)
}
