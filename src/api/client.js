import axios from 'axios'
import {
  isLogoutInProgress,
  refreshTokensOnce,
} from '../auth/authSession'
import { getAccessToken } from '../auth/tokenStorage'
import { API_BASE_URL } from './url'

export { API_BASE_URL, buildApiUrl, normalizeBaseUrl } from './url'

const REISSUE_EXCLUDED_PATHS = [
  '/api/auth/login',
  '/api/auth/signup',
  '/api/auth/reissue',
]

function getRequestPath(config) {
  const url = config?.url ?? ''

  if (/^https?:\/\//i.test(url)) {
    return new URL(url).pathname
  }

  return url.split('?')[0]
}

function shouldSkipReissue(config) {
  const path = getRequestPath(config)

  return REISSUE_EXCLUDED_PATHS.includes(path)
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  if (shouldSkipReissue(config)) {
    return config
  }

  const accessToken = getAccessToken()

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config
    const status = error?.response?.status

    if (
      status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      shouldSkipReissue(originalRequest) ||
      isLogoutInProgress()
    ) {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    try {
      const nextAccessToken = await refreshTokensOnce()
      originalRequest.headers = originalRequest.headers ?? {}
      originalRequest.headers.Authorization = `Bearer ${nextAccessToken}`

      return api(originalRequest)
    } catch (refreshError) {
      return Promise.reject(refreshError)
    }
  },
)

export function normalizeApiError(error) {
  if (error?.response) {
    const { status, data } = error.response
    const responseBody = data ?? {}

    return {
      status,
      code:
        responseBody.code ??
        responseBody.errorCode ??
        responseBody.error ??
        `HTTP_${status}`,
      message:
        responseBody.message ??
        responseBody.errorMessage ??
        responseBody.detail ??
        'API 요청 처리 중 오류가 발생했습니다.',
      data: responseBody,
    }
  }

  if (error?.request) {
    return {
      status: null,
      code: 'NETWORK_ERROR',
      message: '서버에 연결할 수 없습니다.',
      data: null,
    }
  }

  return {
    status: null,
    code: 'UNKNOWN_ERROR',
    message: error?.message ?? '알 수 없는 오류가 발생했습니다.',
    data: null,
  }
}
