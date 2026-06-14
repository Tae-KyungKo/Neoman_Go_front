import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  connectNotificationStream,
  isSseAuthError,
} from '../api/notificationStreamClient'
import { useAuth } from '../auth/useAuth'
import { dispatchNotificationRefresh } from '../constants/notificationEvents'

const MAX_TOASTS = 3
const MAX_AUTH_REISSUE_ATTEMPTS = 1

function normalizeStreamError(error) {
  if (error?.status) {
    return `SSE error: ${error.status}`
  }

  return error?.message ?? 'SSE connection error'
}

export function useNotificationStream() {
  const {
    accessToken,
    authReady,
    clearAuth,
    currentUser,
    reissueAccessToken,
  } = useAuth()
  const navigate = useNavigate()
  const [status, setStatus] = useState('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [toasts, setToasts] = useState([])
  const abortRef = useRef(null)
  const authReissueAttemptRef = useRef(0)
  const fallbackAfterConnectRef = useRef(false)
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
    let isActive = true
    abortRef.current?.abort()
    abortRef.current = controller
    queueMicrotask(() => {
      if (!isActive) {
        return
      }

      setStatus('connecting')
      setErrorMessage('')
    })

    connectNotificationStream({
      accessToken,
      signal: controller.signal,
      onConnected() {
        if (!isActive) {
          return
        }

        setStatus('connected')
        setErrorMessage('')
        authReissueAttemptRef.current = 0

        if (fallbackAfterConnectRef.current) {
          fallbackAfterConnectRef.current = false
          dispatchNotificationRefresh({
            source: 'sse-reconnect',
          })
        }
      },
      onNotification(notification) {
        if (!isActive) {
          return
        }

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
        if (controller.signal.aborted || !isActive) {
          return
        }

        setStatus('error')
        setErrorMessage(normalizeStreamError(error))
      },
      onClosed() {
        if (!controller.signal.aborted && isActive) {
          setStatus('disconnected')
        }
      },
    }).catch((error) => {
      if (controller.signal.aborted || !isActive) {
        return
      }

      if (
        isSseAuthError(error) &&
        authReissueAttemptRef.current < MAX_AUTH_REISSUE_ATTEMPTS
      ) {
        authReissueAttemptRef.current += 1
        setStatus('connecting')
        setErrorMessage('')

        reissueAccessToken()
          .then(() => {
            if (controller.signal.aborted || !isActive) {
              return
            }

            fallbackAfterConnectRef.current = true
          })
          .catch(() => {
            if (controller.signal.aborted || !isActive) {
              return
            }

            clearAuth()
            navigate('/login', { replace: true })
          })

        return
      }

      setStatus('error')
      setErrorMessage(normalizeStreamError(error))
    })

    return () => {
      isActive = false
      controller.abort()
      if (abortRef.current === controller) {
        abortRef.current = null
      }
    }
  }, [
    accessToken,
    canConnect,
    clearAuth,
    currentUser,
    navigate,
    reissueAccessToken,
  ])

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
