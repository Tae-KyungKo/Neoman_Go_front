export const NOTIFICATION_REFRESH_EVENT = 'neomango:notifications:refresh'

export function dispatchNotificationRefresh(detail = {}) {
  window.dispatchEvent(
    new CustomEvent(NOTIFICATION_REFRESH_EVENT, {
      detail,
    }),
  )
}
