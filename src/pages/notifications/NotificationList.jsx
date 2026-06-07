import NotificationItem from './NotificationItem'

function NotificationList({
  notifications,
  onMarkAsRead,
  onNavigateTarget,
  processingId,
  navigatingId,
}) {
  if (notifications.length === 0) {
    return <p className="empty-log">읽지 않은 알림이 없습니다.</p>
  }

  return (
    <ul className="notification-list">
      {notifications.map((notification) => (
        <NotificationItem
          isProcessing={processingId === notification.id}
          isTargetNavigating={navigatingId === notification.id}
          key={notification.id}
          notification={notification}
          onMarkAsRead={onMarkAsRead}
          onNavigateTarget={onNavigateTarget}
        />
      ))}
    </ul>
  )
}

export default NotificationList
