import NotificationItem from './NotificationItem'

function NotificationList({ notifications, onMarkAsRead, processingId }) {
  if (notifications.length === 0) {
    return <p className="empty-log">읽지 않은 알림이 없습니다.</p>
  }

  return (
    <ul className="notification-list">
      {notifications.map((notification) => (
        <NotificationItem
          isProcessing={processingId === notification.id}
          key={notification.id}
          notification={notification}
          onMarkAsRead={onMarkAsRead}
        />
      ))}
    </ul>
  )
}

export default NotificationList
