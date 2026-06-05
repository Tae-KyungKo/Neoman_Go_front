import axios from 'axios'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('accessToken')

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
})

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
