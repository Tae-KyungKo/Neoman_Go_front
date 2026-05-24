function formatTimestamp(timestamp) {
  if (!timestamp) {
    return ''
  }

  return new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(timestamp))
}

function ActionLogPanel({ logs }) {
  return (
    <section className="action-log-panel" aria-labelledby="action-log-title">
      <div className="panel-header">
        <div>
          <h2 id="action-log-title">Action Log</h2>
          <p>API 검증 흐름에서 발생한 성공/실패 결과를 표시합니다.</p>
        </div>
        <span className="log-count">{logs.length}</span>
      </div>

      {logs.length === 0 ? (
        <p className="empty-log">아직 실행한 작업이 없습니다.</p>
      ) : (
        <ol className="log-list">
          {logs.map((log) => (
            <li className={`log-item ${log.type}`} key={log.id}>
              <div className="log-main">
                <span className="log-type">{log.type}</span>
                <span className="log-message">{log.message}</span>
              </div>
              <div className="log-meta">
                <time dateTime={log.timestamp}>
                  {formatTimestamp(log.timestamp)}
                </time>
                {log.status ? <span>status {log.status}</span> : null}
                {log.code ? <span>code {log.code}</span> : null}
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}

export default ActionLogPanel
