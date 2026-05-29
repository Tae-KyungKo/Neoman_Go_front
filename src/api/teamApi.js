import { api } from './client'

export function getTeams(params) {
  return api.get('/api/teams', { params })
}

export function getTeamsByCategory(category) {
  return api.get('/api/teams', {
    params: { category },
  })
}

export function getTeam(teamId) {
  return api.get(`/api/teams/${teamId}`)
}

export function createTeam(payload) {
  return api.post('/api/teams', payload)
}

export function closeTeam(teamId) {
  // TODO: 백엔드 팀 마감 엔드포인트 확정 후 실제 API 호출로 교체한다.
  return Promise.reject(
    new Error(`TODO: close team endpoint is not confirmed. teamId=${teamId}`),
  )
}

export function deleteTeam(teamId) {
  // TODO: 백엔드 팀 삭제/DELETED 처리 엔드포인트 확정 후 실제 API 호출로 교체한다.
  return Promise.reject(
    new Error(`TODO: delete team endpoint is not confirmed. teamId=${teamId}`),
  )
}

export function getTeamMembers(teamId) {
  return api.get(`/api/teams/${teamId}/members`)
}

export function leaveTeam(teamId) {
  return api.post(`/api/teams/${teamId}/members/me/leave`)
}

export function kickMember(teamId, teamMemberId) {
  return api.post(`/api/teams/${teamId}/members/${teamMemberId}/kick`)
}

export function delegateOwner(teamId, targetTeamMemberId) {
  return api.post(`/api/teams/${teamId}/owner/delegate`, {
    targetTeamMemberId,
  })
}
