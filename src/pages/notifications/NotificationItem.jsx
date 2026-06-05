function formatDate(value) {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

function NotificationItem({ notification, onMarkAsRead, isProcessing }) {
  const isUnread = !notification.read

  return (
    <li className={isUnread ? 'notification-item unread' : 'notification-item'}>
      <div className="notification-main">
        <div>
          <strong>{notification.title ?? '(제목 없음)'}</strong>
          <p>{notification.message ?? ''}</p>
        </div>
        <span className={isUnread ? 'auth-on' : 'auth-off'}>
          {isUnread ? 'UNREAD' : 'READ'}
        </span>
      </div>

      <div className="auth-state">
        <span>type: {notification.type ?? '-'}</span>
        <span>targetType: {notification.targetType ?? '-'}</span>
        <span>targetId: {notification.targetId ?? '-'}</span>
        <span>createdAt: {formatDate(notification.createdAt)}</span>
        <span>readAt: {formatDate(notification.readAt)}</span>
      </div>

      <div className="login-actions">
        <button
          disabled={!isUnread || isProcessing}
          onClick={() => onMarkAsRead(notification.id)}
          type="button"
        >
          {isProcessing ? '처리 중...' : '읽음 처리'}
        </button>
      </div>
    </li>
  )
}

export default NotificationItem
