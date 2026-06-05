import { fetchEventSource } from '@microsoft/fetch-event-source'
import { API_BASE_URL } from './client'

export function connectNotificationStream({
  accessToken,
  signal,
  onConnected,
  onNotification,
  onError,
  onClosed,
}) {
  return fetchEventSource(`${API_BASE_URL}/api/notifications/stream`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    openWhenHidden: true,
    signal,
    async onopen(response) {
      if (!response.ok) {
        const error = new Error(`SSE connection failed: ${response.status}`)
        error.status = response.status
        throw error
      }
    },
    onmessage(event) {
      if (event.event === 'connected') {
        onConnected?.(event.data)
        return
      }

      if (event.event !== 'notification') {
        return
      }

      try {
        onNotification?.(JSON.parse(event.data))
      } catch (error) {
        onError?.(error)
      }
    },
    onclose() {
      onClosed?.()
    },
    onerror(error) {
      onError?.(error)
      throw error
    },
  })
}
