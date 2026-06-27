import { api } from './client'

export function getCurrentUser() {
  return api.get('/api/users/me')
}
