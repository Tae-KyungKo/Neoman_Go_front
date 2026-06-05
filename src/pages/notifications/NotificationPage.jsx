import { useCallback, useEffect, useState } from 'react'
import { normalizeApiError } from '../../api/client'
import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '../../api/notificationApi'
import { useAuth } from '../../auth/useAuth'
import { NOTIFICATION_REFRESH_EVENT } from '../../constants/notificationEvents'
import NotificationList from './NotificationList'

function extractNotifications(response) {
  const data = response?.data?.data ?? response?.data

  if (Array.isArray(data)) {
    return data
  }

  return Array.isArray(data?.content) ? data.content : []
}

function extractUnreadCount(response) {
  const data = response?.data?.data ?? response?.data

  if (typeof data === 'number') {
    return data
  }

  return data?.count ?? data?.unreadCount ?? 0
}

function NotificationPage() {
  const { accessToken, authReady, clearAuth, currentUser } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [processingId, setProcessingId] = useState(null)
  const [isMarkingAll, setIsMarkingAll] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const canLoad = authReady && Boolean(accessToken) && Boolean(currentUser)

  const handleAuthError = useCallback(function handleAuthError(error) {
    const normalizedError = normalizeApiError(error)

    if (normalizedError.status === 401 || normalizedError.status === 403) {
      clearAuth()
    }

    return normalizedError
  }, [clearAuth])

  const loadNotifications = useCallback(async function loadNotifications() {
    if (!canLoad) {
      setNotifications([])
      setUnreadCount(0)
      return
    }

    setIsLoading(true)
    setErrorMessage('')

    try {
      const [notificationResponse, unreadCountResponse] = await Promise.all([
        getNotifications({ page: 0, size: 20 }),
        getUnreadNotificationCount(),
      ])

      setNotifications(extractNotifications(notificationResponse))
      setUnreadCount(extractUnreadCount(unreadCountResponse))
    } catch (error) {
      const normalizedError = handleAuthError(error)
      setNotifications([])
      setUnreadCount(0)
      setErrorMessage(normalizedError.message)
    } finally {
      setIsLoading(false)
    }
  }, [canLoad, handleAuthError])

  useEffect(() => {
    if (!canLoad) {
      queueMicrotask(() => {
        setNotifications([])
        setUnreadCount(0)
        setErrorMessage('')
      })
      return
    }

    queueMicrotask(() => {
      loadNotifications()
    })

    function handleNotificationRefresh() {
      loadNotifications()
    }

    window.addEventListener(NOTIFICATION_REFRESH_EVENT, handleNotificationRefresh)

    return () => {
      window.removeEventListener(
        NOTIFICATION_REFRESH_EVENT,
        handleNotificationRefresh,
      )
    }
  }, [canLoad, accessToken, currentUser, loadNotifications])

  async function handleMarkAsRead(notificationId) {
    setProcessingId(notificationId)
    setErrorMessage('')

    try {
      await markNotificationAsRead(notificationId)
      await loadNotifications()
    } catch (error) {
      setErrorMessage(handleAuthError(error).message)
    } finally {
      setProcessingId(null)
    }
  }

  async function handleMarkAllAsRead() {
    setIsMarkingAll(true)
    setErrorMessage('')

    try {
      await markAllNotificationsAsRead()
      await loadNotifications()
    } catch (error) {
      setErrorMessage(handleAuthError(error).message)
    } finally {
      setIsMarkingAll(false)
    }
  }

  return (
    <section className="route-panel notification-page">
      <div className="route-panel-header">
        <div>
          <h1>알림함</h1>
          <p>REST API로 알림 목록과 읽음 상태를 확인한다. SSE 연결은 다음 단계에서 진행한다.</p>
        </div>
        <span className="selected-category-badge">unread {unreadCount}</span>
      </div>

      <div className="login-actions">
        <button disabled={isLoading} onClick={loadNotifications} type="button">
          새로고침
        </button>
        <button
          disabled={unreadCount === 0 || isMarkingAll}
          onClick={handleMarkAllAsRead}
          type="button"
        >
          {isMarkingAll ? '처리 중...' : '전체 읽음'}
        </button>
      </div>

      {isLoading ? <p className="empty-log">알림 목록을 조회하는 중입니다.</p> : null}
      {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

      {!isLoading && !errorMessage ? (
        <NotificationList
          notifications={notifications}
          onMarkAsRead={handleMarkAsRead}
          processingId={processingId}
        />
      ) : null}
    </section>
  )
}

export default NotificationPage
