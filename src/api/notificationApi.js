import { api } from './client'

export function getNotifications(params = {}) {
  return api.get('/api/notifications', { params })
}

export function getUnreadNotificationCount() {
  return api.get('/api/notifications/unread-count')
}

export function markNotificationAsRead(notificationId) {
  return api.patch(`/api/notifications/${notificationId}/read`)
}

export function markAllNotificationsAsRead() {
  return api.patch('/api/notifications/read-all')
}
