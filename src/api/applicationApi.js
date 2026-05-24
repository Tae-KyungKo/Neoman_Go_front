import { api } from './client'

export function applyToTeam(teamId) {
  return api.post(`/api/teams/${teamId}/applications`)
}

export function getMyApplications() {
  return api.get('/api/applications/me')
}

export function getTeamApplications(teamId) {
  return api.get(`/api/teams/${teamId}/applications`)
}

export function cancelApplication(applicationId) {
  // TODO: 백엔드 가입 신청 취소 엔드포인트 확정 후 실제 API 호출로 교체한다.
  return Promise.reject(
    new Error(
      `TODO: cancel application endpoint is not confirmed. applicationId=${applicationId}`,
    ),
  )
}

export function approveApplication(applicationId) {
  // TODO: 백엔드 가입 신청 승인 엔드포인트 확정 후 실제 API 호출로 교체한다.
  return Promise.reject(
    new Error(
      `TODO: approve application endpoint is not confirmed. applicationId=${applicationId}`,
    ),
  )
}

export function rejectApplication(applicationId) {
  // TODO: 백엔드 가입 신청 거절 엔드포인트 확정 후 실제 API 호출로 교체한다.
  return Promise.reject(
    new Error(
      `TODO: reject application endpoint is not confirmed. applicationId=${applicationId}`,
    ),
  )
}
