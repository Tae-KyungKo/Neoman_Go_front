import { formatNotificationDateTime } from '../../utils/notificationTimeFormatter'

function RealtimeNotificationToast({ onDismiss, toasts }) {
  if (toasts.length === 0) {
    return null
  }

  return (
    <aside className="realtime-toast-stack" aria-live="polite">
      {toasts.map((toast) => (
        <div className="realtime-toast" key={toast.toastId}>
          <div>
            <strong>{toast.title ?? '새 알림'}</strong>
            <p>{toast.message ?? ''}</p>
            <span>{formatNotificationDateTime(toast.createdAt ?? toast.receivedAt)}</span>
          </div>
          <button type="button" onClick={() => onDismiss(toast.toastId)}>
            닫기
          </button>
        </div>
      ))}
    </aside>
  )
}

export default RealtimeNotificationToast
