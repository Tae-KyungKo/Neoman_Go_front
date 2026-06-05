import { useEffect, useRef, useState } from 'react'
import { connectNotificationStream } from '../api/notificationStreamClient'
import { useAuth } from '../auth/useAuth'
import { dispatchNotificationRefresh } from '../constants/notificationEvents'

const MAX_TOASTS = 3

function normalizeStreamError(error) {
  if (error?.status) {
    return `SSE error: ${error.status}`
  }

  return error?.message ?? 'SSE connection error'
}

export function useNotificationStream() {
  const { accessToken, authReady, currentUser } = useAuth()
  const [status, setStatus] = useState('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [toasts, setToasts] = useState([])
  const abortRef = useRef(null)
  const canConnect = authReady && Boolean(accessToken) && Boolean(currentUser)

  useEffect(() => {
    if (!canConnect) {
      abortRef.current?.abort()
      abortRef.current = null
      queueMicrotask(() => {
        setStatus('idle')
        setErrorMessage('')
        setToasts([])
      })
      return
    }

    const controller = new AbortController()
    abortRef.current?.abort()
    abortRef.current = controller
    queueMicrotask(() => {
      setStatus('connecting')
      setErrorMessage('')
    })

    connectNotificationStream({
      accessToken,
      signal: controller.signal,
      onConnected() {
        setStatus('connected')
        setErrorMessage('')
      },
      onNotification(notification) {
        setStatus('connected')
        setToasts((currentToasts) => [
          {
            ...notification,
            toastId: crypto.randomUUID(),
            receivedAt: new Date().toISOString(),
          },
          ...currentToasts,
        ].slice(0, MAX_TOASTS))
        dispatchNotificationRefresh({
          source: 'sse',
          notification,
        })
      },
      onError(error) {
        if (controller.signal.aborted) {
          return
        }

        setStatus('error')
        setErrorMessage(normalizeStreamError(error))
      },
      onClosed() {
        if (!controller.signal.aborted) {
          setStatus('disconnected')
        }
      },
    }).catch((error) => {
      if (controller.signal.aborted) {
        return
      }

      setStatus('error')
      setErrorMessage(normalizeStreamError(error))
    })

    return () => {
      controller.abort()
      if (abortRef.current === controller) {
        abortRef.current = null
      }
    }
  }, [accessToken, canConnect, currentUser])

  function dismissToast(toastId) {
    setToasts((currentToasts) =>
      currentToasts.filter((toast) => toast.toastId !== toastId),
    )
  }

  return {
    status,
    errorMessage,
    toasts,
    dismissToast,
  }
}
