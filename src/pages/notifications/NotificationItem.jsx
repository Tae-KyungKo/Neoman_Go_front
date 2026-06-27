function formatDate(value) {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

function getTargetNavigationLabel(notification) {
  if (notification.targetType === 'TEAM') {
    return '팀 상세로 이동'
  }

  if (notification.targetType === 'POST') {
    return '게시글 상세로 이동'
  }

  if (notification.targetType === 'TEAM_APPLICATION') {
    return '팀 가입 신청 알림은 팀 상세 화면에서 확인해주세요.'
  }

  return '바로 이동을 지원하지 않는 알림입니다.'
}

function NotificationItem({
  notification,
  onMarkAsRead,
  onNavigateTarget,
  isProcessing,
  isTargetNavigating,
}) {
  const isUnread = !notification.read
  const canNavigateTarget =
    (notification.targetType === 'TEAM' || notification.targetType === 'POST') &&
    Boolean(notification.targetId)

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
        {canNavigateTarget ? (
          <button
            disabled={isTargetNavigating}
            onClick={() => onNavigateTarget(notification)}
            type="button"
          >
            {isTargetNavigating ? '이동 중...' : getTargetNavigationLabel(notification)}
          </button>
        ) : (
          <span className="processed-state">
            {getTargetNavigationLabel(notification)}
          </span>
        )}
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
