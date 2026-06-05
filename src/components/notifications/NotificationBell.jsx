import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { normalizeApiError } from '../../api/client'
import { getUnreadNotificationCount } from '../../api/notificationApi'
import { useAuth } from '../../auth/useAuth'

function extractUnreadCount(response) {
  const data = response?.data?.data ?? response?.data

  if (typeof data === 'number') {
    return data
  }

  return data?.count ?? data?.unreadCount ?? 0
}

function NotificationBell() {
  const { accessToken, authReady, currentUser } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)
  const [errorMessage, setErrorMessage] = useState('')
  const canLoad = authReady && Boolean(accessToken) && Boolean(currentUser)

  useEffect(() => {
    if (!canLoad) {
      queueMicrotask(() => {
        setUnreadCount(0)
        setErrorMessage('')
      })
      return
    }

    let ignore = false

    async function loadUnreadCount() {
      try {
        const response = await getUnreadNotificationCount()

        if (ignore) {
          return
        }

        setUnreadCount(extractUnreadCount(response))
        setErrorMessage('')
      } catch (error) {
        if (ignore) {
          return
        }

        setUnreadCount(0)
        setErrorMessage(normalizeApiError(error).message)
      }
    }

    loadUnreadCount()

    return () => {
      ignore = true
    }
  }, [canLoad, accessToken, currentUser])

  if (!canLoad) {
    return null
  }

  return (
    <NavLink
      className="notification-link"
      title={errorMessage || '알림함'}
      to="/notifications"
    >
      알림함
      <span className="notification-count">{unreadCount}</span>
    </NavLink>
  )
}

export default NotificationBell
