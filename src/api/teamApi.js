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
  return api.patch(`/api/teams/${teamId}/close`)
}

export function deleteTeam(teamId) {
  return api.delete(`/api/teams/${teamId}`)
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
