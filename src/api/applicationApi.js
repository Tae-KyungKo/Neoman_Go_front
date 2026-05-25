import { api } from './client'

export function applyToTeam(teamId, payload) {
  return api.post(`/api/teams/${teamId}/applications`, payload)
}

export function getMyApplications() {
  return api.get('/api/me/team-applications')
}

export function getTeamApplications(teamId) {
  return api.get(`/api/teams/${teamId}/applications`)
}

export function cancelApplication(applicationId) {
  return api.patch(`/api/team-applications/${applicationId}/cancel`)
}

export function approveApplication(applicationId) {
  return api.post(`/api/team-applications/${applicationId}/approve`)
}

export function rejectApplication(applicationId) {
  return api.post(`/api/team-applications/${applicationId}/reject`)
}
