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
  // TODO: 백엔드 팀원 목록 조회 엔드포인트 확정 후 실제 API 호출로 교체한다.
  return Promise.reject(
    new Error(
      `TODO: get team members endpoint is not confirmed. teamId=${teamId}`,
    ),
  )
}

export function leaveTeam(teamId) {
  // TODO: 백엔드 팀 탈퇴 엔드포인트 확정 후 실제 API 호출로 교체한다.
  return Promise.reject(
    new Error(`TODO: leave team endpoint is not confirmed. teamId=${teamId}`),
  )
}

export function kickMember(teamId, teamMemberId) {
  // TODO: 백엔드 팀원 강퇴 엔드포인트 확정 후 실제 API 호출로 교체한다.
  return Promise.reject(
    new Error(
      `TODO: kick member endpoint is not confirmed. teamId=${teamId}, teamMemberId=${teamMemberId}`,
    ),
  )
}

export function delegateOwner(teamId, targetTeamMemberId) {
  // TODO: 백엔드 OWNER 위임 엔드포인트 확정 후 실제 API 호출로 교체한다.
  return Promise.reject(
    new Error(
      `TODO: delegate owner endpoint is not confirmed. teamId=${teamId}, targetTeamMemberId=${targetTeamMemberId}`,
    ),
  )
}
