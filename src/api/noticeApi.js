import { api } from './client'

function createAuthConfig(accessToken) {
  if (!accessToken) {
    return undefined
  }

  return {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  }
}

export function getNotices({ page, size }) {
  return api.get('/api/notices', {
    params: { page, size },
  })
}

export function getNotice(noticeId) {
  return api.get(`/api/notices/${noticeId}`)
}

export function createNotice({ accessToken, title, content }) {
  return api.post(
    '/api/admin/notices',
    { title, content },
    createAuthConfig(accessToken),
  )
}

export function updateNotice({ accessToken, noticeId, title, content }) {
  return api.patch(
    `/api/admin/notices/${noticeId}`,
    { title, content },
    createAuthConfig(accessToken),
  )
}

export function deleteNotice({ accessToken, noticeId }) {
  return api.delete(
    `/api/admin/notices/${noticeId}`,
    createAuthConfig(accessToken),
  )
}
