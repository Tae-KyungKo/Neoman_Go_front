function formatDate(value) {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

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
            <span>{formatDate(toast.createdAt ?? toast.receivedAt)}</span>
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
