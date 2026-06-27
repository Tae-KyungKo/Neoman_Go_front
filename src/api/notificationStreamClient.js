import { fetchEventSource } from '@microsoft/fetch-event-source'
import { API_BASE_URL } from './client'

export function isSseAuthError(error) {
  return error?.status === 401 || error?.status === 403
}

function createSseError(message, response) {
  const error = new Error(message)
  error.status = response?.status ?? null
  error.isAuthError = isSseAuthError(error)
  return error
}

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
        throw createSseError(`SSE connection failed: ${response.status}`, response)
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
