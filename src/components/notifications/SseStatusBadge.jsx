const STATUS_LABELS = {
  idle: 'SSE 대기',
  connecting: 'SSE 연결 중',
  connected: 'SSE 연결됨',
  disconnected: 'SSE 끊김',
  error: 'SSE 오류',
}

function SseStatusBadge({ errorMessage, status }) {
  return (
    <span className={`sse-status ${status}`} title={errorMessage || STATUS_LABELS[status]}>
      {STATUS_LABELS[status] ?? status}
    </span>
  )
}

export default SseStatusBadge
